/**
 * EdgeOne Makers Middleware
 * Runs before page load on EdgeOne edge nodes.
 * Intercepts /api/activity and /api/activity/report, reverse-proxying to upstream Cloudflare Worker.
 */
// ─────────────────────────────────────────────────────────────────────────
// mp-ticket minting, inlined (ADR-0027 client half).
//
// The origin (cdn-oracle) refuses unsigned content reads; a ticket is a
// standard S3 presigned URL (SigV4 query auth) with a signed `session` marker
// the origin charges its budgets on. Minting is LOCAL crypto — the site holds
// its tenant credential in edge env and signs here; no external minting
// service is involved, and the operator's duty ends at the credential.
//
// Kept inline (not a sibling import): this middleware is deliberately
// self-contained because EdgeOne Makers does not resolve sibling dynamic
// imports. Byte-for-byte agreement with the origin's reference signer
// (presign.py) is a test result, checked with a fixed --date vector.
//
// env: TICKET_HOST / TICKET_ID / TICKET_PREFIX / TICKET_SECRET (+ optional
// ALLOWED_ORIGIN, TICKET_EXPIRES_SECS, TICKET_RATE_PER_MIN). Missing config
// → 503; the client silently falls back to the bare source URL.
const enc = new TextEncoder();

const DEFAULT_EXPIRES = 3600; // 1 h: the client renews; a leak lives an hour
const DEFAULT_RATE_PER_MIN = 30;
const SESSION_COOKIE = "ticket_session";
const SESSION_MAX_AGE = 7 * 24 * 3600; // >= the 24 h the client asked for

/** AWS SigV4 unreserved set; everything else percent-encodes, uppercase hex. */
const UNRESERVED = /[A-Za-z0-9_.~-]/;

function uriEncode(value, keepSlash = false) {
	let out = "";
	for (const ch of value) {
		if (UNRESERVED.test(ch) || (keepSlash && ch === "/")) {
			out += ch;
		} else {
			for (const byte of enc.encode(ch)) {
				out += "%" + byte.toString(16).toUpperCase().padStart(2, "0");
			}
		}
	}
	return out;
}

function hex(bytes) {
	return [...new Uint8Array(bytes)]
		.map((b) => b.toString(16).padStart(2, "0"))
		.join("");
}

async function hmac(key, data) {
	const k = await crypto.subtle.importKey(
		"raw",
		typeof key === "string" ? enc.encode(key) : key,
		{ name: "HMAC", hash: "SHA-256" },
		false,
		["sign"],
	);
	return new Uint8Array(
		await crypto.subtle.sign(
			"HMAC",
			k,
			typeof data === "string" ? enc.encode(data) : data,
		),
	);
}

async function sha256Hex(data) {
	return hex(await crypto.subtle.digest("SHA-256", enc.encode(data)));
}

/** Sort by name, then by value; encode each component. */
function canonicalQuery(pairs) {
	const ordered = [...pairs].sort((a, b) =>
		a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : a[1] < b[1] ? -1 : 1,
	);
	return ordered
		.map(([k, v]) => `${uriEncode(k, false)}=${uriEncode(v, false)}`)
		.join("&");
}

/**
 * Mint one presigned GET. Byte-for-byte equivalent to
 *   presign.py --host H --key K --session S --expires E --id I --secret SEC
 * (`--date` fixed via `now`), which is how the cross-check against the
 * reference signer is run.
 */
async function signUrl({
	host,
	key,
	session,
	expires,
	accessKeyId,
	secret,
	region = "us-east-1",
	service = "s3",
	method = "GET",
	now = new Date(),
}) {
	// The reference signer normalizes a bare key to an absolute path, and the
	// canonical request is computed over that normalized form.
	const fullKey = key.startsWith("/") ? key : `/${key}`;
	const amzDate = now
		.toISOString()
		.replace(/[-:]/g, "")
		.replace(/\.\d+Z$/, "Z");
	const scopeDate = amzDate.slice(0, 8);
	const pairs = [
		["X-Amz-Algorithm", "AWS4-HMAC-SHA256"],
		["X-Amz-Credential", `${accessKeyId}/${scopeDate}/${region}/${service}/aws4_request`],
		["X-Amz-Date", amzDate],
		["X-Amz-Expires", String(expires)],
		["X-Amz-SignedHeaders", "host"],
		["session", session],
	];
	const canonicalRequest = [
		method,
		uriEncode(fullKey, true),
		canonicalQuery(pairs),
		`host:${host}`,
		"",
		"host",
		"UNSIGNED-PAYLOAD",
	].join("\n");
	const scope = `${scopeDate}/${region}/${service}/aws4_request`;
	const stringToSign = [
		"AWS4-HMAC-SHA256",
		amzDate,
		scope,
		await sha256Hex(canonicalRequest),
	].join("\n");
	let signingKey = await hmac(`AWS4${secret}`, scopeDate);
	signingKey = await hmac(signingKey, region);
	signingKey = await hmac(signingKey, service);
	signingKey = await hmac(signingKey, "aws4_request");
	const signature = hex(await hmac(signingKey, stringToSign));
	const query = canonicalQuery(pairs) + `&X-Amz-Signature=${signature}`;
	return `https://${host}${uriEncode(fullKey, true)}?${query}`;
}

/**
 * The caller must come from the site: `Origin` when the browser sends one,
 * `Referer` otherwise (same-origin POSTs carry Origin; some agents only
 * carry Referer).
 */
function originAllowed(request, allowedOrigin) {
	const origin = request.headers.get("origin");
	if (origin) return origin === allowedOrigin;
	const referer = request.headers.get("referer");
	return Boolean(referer) && referer.startsWith(`${allowedOrigin}/`);
}

/**
 * Two refusal kinds with deliberately different codes: a malformed src
 * (unparseable, a query riding along) is the client's mistake → 400; a src
 * that names another host or leaves the tenant prefix is authorization → 403.
 */
function validateSrc(raw, host, prefix) {
	if (typeof raw !== "string" || raw === "") return { status: 400 };
	let url;
	try {
		url = new URL(raw);
	} catch {
		return { status: 400 };
	}
	if (url.protocol !== "https:" || url.search) return { status: 400 };
	if (url.host !== host) return { status: 403 };
	let key;
	try {
		key = decodeURIComponent(url.pathname.slice(1));
	} catch {
		return { status: 400 };
	}
	if (!key.startsWith(prefix)) return { status: 403 };
	return { key };
}

function sessionFromCookie(request, name) {
	const cookie = request.headers.get("cookie") ?? "";
	for (const part of cookie.split(";")) {
		const [k, ...rest] = part.trim().split("=");
		if (k === name && rest.length) return rest.join("=");
	}
	return null;
}

/**
 * Per-session valve: a mint per embed and one per hour after that is a tiny
 * budget, so this only has to stop a runaway. Isolate-memory, best-effort by
 * design — the origin's budgets are the authority; this is a valve, not a
 * quality-of-service signal.
 */
function makeRateValve(perMinute) {
	const seen = new Map();
	return (session, nowMs) => {
		const window = Math.floor(nowMs / 60000);
		const key = `${session}:${window}`;
		const used = (seen.get(key) ?? 0) + 1;
		seen.set(key, used);
		if (seen.size > 4096) {
			for (const k of seen.keys()) {
				if (!k.endsWith(`:${window}`)) seen.delete(k);
			}
		}
		return used <= perMinute;
	};
}

/**
 * One mint per request: validate, derive-or-create the session, valve, sign.
 * `deps` injects the clock / session factory / limiter / signer for tests.
 * Returns a `Response` with `Cache-Control: no-store` in every branch.
 */
async function handleTicketRequest(request, env, deps = {}) {
	const now = deps.now ? deps.now() : new Date();
	const nowMs = now.getTime();
	const respond = (status, body, extra = {}) =>
		new Response(body, {
			status,
			headers: {
				"cache-control": "no-store",
				"content-type": "application/json; charset=utf-8",
				...extra,
			},
		});

	if (request.method !== "POST") return respond(405, "{}");
	const required = ["TICKET_HOST", "TICKET_ID", "TICKET_PREFIX", "TICKET_SECRET"];
	const missing = required.filter((k) => !env[k]);
	if (missing.length) {
		console.error("ticket mint misconfigured: missing", missing.join(", "));
		return respond(503, "{}");
	}
	const allowedOrigin = env.ALLOWED_ORIGIN || "https://isui.ren";
	if (!originAllowed(request, allowedOrigin)) return respond(403, "{}");

	let src;
	try {
		src = JSON.parse(await request.text()).src;
	} catch {
		return respond(400, "{}");
	}
	const parsed = validateSrc(src, env.TICKET_HOST, env.TICKET_PREFIX);
	if (parsed.status) return respond(parsed.status, "{}");
	const key = parsed.key;

	const cookieName = env.TICKET_SESSION_COOKIE ?? SESSION_COOKIE;
	const existing = sessionFromCookie(request, cookieName);
	const session = existing ?? (deps.newSession ?? crypto.randomUUID.bind(crypto))();
	const perMinute = Number(env.TICKET_RATE_PER_MIN ?? DEFAULT_RATE_PER_MIN);
	const valve = deps.valve ?? (deps.valve = makeRateValve(perMinute));
	if (!valve(session, nowMs)) return respond(429, "{}");

	const expires = Number(env.TICKET_EXPIRES_SECS ?? DEFAULT_EXPIRES);
	const url = await (deps.sign ?? signUrl)({
		host: env.TICKET_HOST,
		key,
		session,
		expires,
		accessKeyId: env.TICKET_ID,
		secret: env.TICKET_SECRET,
		now,
	});
	const headers = {};
	if (!existing) {
		headers["set-cookie"] =
			`${cookieName}=${session}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${SESSION_MAX_AGE}`;
	}
	return respond(
		200,
		JSON.stringify({
			url,
			expiresAt: new Date(nowMs + expires * 1000)
				.toISOString()
				.replace(/\.\d+Z$/, "Z"),
		}),
		headers,
	);
}

export async function middleware(context) {
	const { request, rewrite, next } = context;
	const url = new URL(request.url);

	if (url.pathname === "/api/activity") {
		if (request.method === "OPTIONS") {
			return new Response(null, {
				status: 204,
				headers: {
					"Access-Control-Allow-Origin": "*",
					"Access-Control-Allow-Methods": "GET, OPTIONS",
					"Access-Control-Allow-Headers": "*",
					"Access-Control-Max-Age": "86400",
				},
			});
		}

		try {
			const upstreamResp = await fetch(
				"https://api.mango-mesa.ccwu.cc/api/activity",
				{
					headers: {
						Accept: "application/json",
						"User-Agent":
							request.headers.get("user-agent") || "EdgeOne-Middleware-Proxy",
					},
				},
			);
			const body = await upstreamResp.text();
			return new Response(body, {
				status: upstreamResp.status,
				headers: {
					"Content-Type": "application/json; charset=utf-8",
					"Access-Control-Allow-Origin": "*",
					"Access-Control-Allow-Methods": "GET, OPTIONS",
					"Access-Control-Allow-Headers": "*",
					"Cache-Control": "public, max-age=5, s-maxage=10",
				},
			});
		} catch (_err) {
			return rewrite("https://api.mango-mesa.ccwu.cc/api/activity");
		}
	}

	if (url.pathname === "/api/activity/report") {
		if (request.method === "OPTIONS") {
			return new Response(null, {
				status: 204,
				headers: {
					"Access-Control-Allow-Origin": "*",
					"Access-Control-Allow-Methods": "POST, OPTIONS",
					"Access-Control-Allow-Headers": "*",
					"Access-Control-Max-Age": "86400",
				},
			});
		}

		if (request.method === "POST") {
			try {
				const body = await request.text();
				const upstreamResp = await fetch(
					"https://api.mango-mesa.ccwu.cc/api/activity/report",
					{
						method: "POST",
						headers: {
							"Content-Type": "application/json",
							Authorization: request.headers.get("authorization") || "",
							"User-Agent":
								request.headers.get("user-agent") || "EdgeOne-Middleware-Proxy",
						},
						body,
					},
				);
				const respBody = await upstreamResp.text();
				return new Response(respBody, {
					status: upstreamResp.status,
					headers: {
						"Content-Type": "application/json; charset=utf-8",
						"Access-Control-Allow-Origin": "*",
						"Access-Control-Allow-Methods": "POST, OPTIONS",
						"Access-Control-Allow-Headers": "*",
					},
				});
			} catch (_err) {
				return rewrite("https://api.mango-mesa.ccwu.cc/api/activity/report");
			}
		}
	}

	// mp-ticket: the site mints its own tickets (ADR-0027 client half). The
	// operator's duty ends at the tenant credential (edge env); minting is local
	// crypto, so it happens here — zero external minting services.
	if (url.pathname === "/api/mp-ticket") {
		return handleTicketRequest(request, context.env || {});
	}

	// Hard-wire /Bahnhof slash normalization
	if (url.pathname === "/Bahnhof") {
		const redirectUrl = new URL(request.url);
		redirectUrl.pathname = "/Bahnhof/";
		return Response.redirect(redirectUrl.toString(), 301);
	}

	// Reverse-proxy /repo/<repoName>/* to https://archivalera.github.io/<repoName>/*
	if (url.pathname === "/repo" || url.pathname === "/repo/") {
		return Response.redirect("https://isui.ren/MangoMesa/projects/", 302);
	}

	if (url.pathname.startsWith("/repo/")) {
		const repoMatch = url.pathname.match(/^\/repo\/([^\/]+)(\/.*)?$/);
		if (repoMatch) {
			const repoName = repoMatch[1];
			const restPath = repoMatch[2] || "";

			// Enforce trailing slash on repository root path (/repo/<repoName> -> /repo/<repoName>/)
			if (!restPath && !url.pathname.endsWith("/")) {
				const redirectUrl = new URL(request.url);
				redirectUrl.pathname = `/repo/${repoName}/`;
				return Response.redirect(redirectUrl.toString(), 301);
			}

			// 301 redirect legacy repo name S26-1Shitass to S26-1_202609
			if (repoName === "S26-1Shitass") {
				const redirectUrl = new URL(request.url);
				redirectUrl.pathname = `/repo/S26-1_202609${restPath || "/"}`;
				return Response.redirect(redirectUrl.toString(), 301);
			}

			// If repository has its own static files deployed locally in EdgeOne,
			// serve directly via EdgeOne static origin
			if (repoName === "S26-1_202609") {
				return next();
			}

			// Octave-UI (repo/Octave): bytes come from GitHub Pages, not the deploy
			// tree — octave.wasm is ~31MB and EdgeOne refuses files over 25MB, so the
			// Pages site (archivalera.github.io/Octave-UI) carries the large binaries
			// and this middleware reverse-proxies it under /repo/Octave/. Every
			// response is stamped with the cross-origin isolation headers the WASM
			// engine requires (SharedArrayBuffer → COOP/COEP; Octave-UI HANDOFF §3),
			// and .wasm gets application/wasm or streaming compilation fails.
			// The Pages build uses base '/repo/Octave/', so no path rewriting is needed
			// here — the HTML already references this prefix, which this proxy serves.
			if (repoName === "Octave") {
				const cleanRest = restPath.startsWith("/") ? restPath.slice(1) : restPath;
				const pagesUrl = `https://archivalera.github.io/Octave-UI/${cleanRest}${url.search}`;

				// 转发给上游的条件/范围头：让「大二进制不必每次重传、但推送立即可见」
				// 这两件事同时成立（Pages 支持 ETag，条件请求回 304 不收体）。
				// Range 与 gzip 互斥：请求分片时**不能**带上 gzip —— 否则 Pages 会对
				// 压缩表示切范围，返回的 Content-Range 总数是压缩后大小（实测 7488364
				// 而非 31003790），分片拼起来就是坏文件。分片走原始字节，压缩只用于整包。
				// 分片走 **gzip 表示**（Pages 支持 Range+gzip，实测 Content-Range 总数
				// 7488364 = 压缩后大小、首字节 1f8b）。于是回源只拉 ~7.4MB 而不是 31MB；
				// 客户端 shim 负责把拼好的 gzip 流解压回原文件（DecompressionStream）。
				const rangeHeader = request.headers.get("range");
				const fwd = rangeHeader
					? { "Accept-Encoding": "gzip", Range: rangeHeader }
					: { "Accept-Encoding": "gzip" };
				const inm = request.headers.get("if-none-match");
				if (inm) fwd["If-None-Match"] = inm;

				let upstream = null;
				try {
					// Ask Pages for its gzip variant so the ORIGIN PULL is ~7.5MB instead of
					// ~31MB (octave.wasm). This edge runtime decodes the gzip body it
					// receives but leaves the upstream `content-encoding` header in place, so
					// the forwarded headers are sanitised below (a naive pass-through sends a
					// gzip header over a decoded body and the transfer truncates).
					upstream = await fetch(pagesUrl, { headers: fwd });
				} catch (_err) {
					upstream = null;
				}
				if (!upstream) {
					return new Response("Octave upstream unreachable", {
						status: 502,
						headers: { "Content-Type": "text/plain; charset=utf-8" },
					});
				}
				if (upstream.status === 404) {
					return new Response("Octave asset not found on GitHub Pages", {
						status: 404,
						headers: { "Content-Type": "text/plain; charset=utf-8" },
					});
				}

				const headers = new Headers(upstream.headers);
				headers.set("Cross-Origin-Opener-Policy", "same-origin");
				headers.set("Cross-Origin-Embedder-Policy", "require-corp");
				headers.set("Access-Control-Allow-Origin", "*");
				headers.set("Accept-Ranges", "bytes");
				if (url.pathname.endsWith(".wasm")) {
					headers.set("Content-Type", "application/wasm");
				}
				// 200（整包）：运行时可能已把 gzip 解掉，故这两个头必须删。
				// 206（分片）：体是**原始 gzip 分片**（Content-Encoding: gzip 必须保留，
				// 否则客户端不知道要解压），Content-Length 与 Content-Range 也都准确。
				if (upstream.status !== 206) {
					headers.delete("Content-Encoding");
					headers.delete("Content-Length");
				}
				// 与站内其它路径保持一致的缓存策略：max-age=0 + must-revalidate。
				// 这不是「清缓存」，而是「本来就每次校验」——所以推送立刻可见；
				// 配合上面的条件请求透传，大文件校验走 304、不重传（MangoMesa /
				// repo/S26 用的是同一档，只是它们由 EdgeOne 静态托管直接处理）。
				headers.set("Cache-Control", "public, max-age=0, must-revalidate");

				// 304 / 其它无体状态：按原状态回，不带 body
				if (upstream.status === 304 || upstream.status === 204) {
					return new Response(null, { status: upstream.status, headers });
				}
				return new Response(upstream.body, { status: upstream.status, headers });
			}

			const cleanRest = restPath.startsWith("/") ? restPath.slice(1) : restPath;
			const upstreamUrl = `https://archivalera.github.io/${repoName}/${cleanRest}${url.search}`;

			if (request.method === "OPTIONS") {
				return new Response(null, {
					status: 204,
					headers: {
						"Access-Control-Allow-Origin": "*",
						"Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
						"Access-Control-Allow-Headers": "*",
						"Access-Control-Max-Age": "86400",
					},
				});
			}

			try {
				const upstreamResp = await fetch(upstreamUrl, {
					method: request.method,
					headers: {
						"User-Agent":
							request.headers.get("user-agent") || "EdgeOne-RepoProxy/1.0",
						Accept: request.headers.get("accept") || "*/*",
					},
				});

				// If upstream returns 404 (Pages not enabled or page doesn't exist)
				if (upstreamResp.status === 404) {
					const accept = request.headers.get("accept") || "";
					if (!accept.includes("text/html") && cleanRest.includes(".")) {
						return new Response("Asset not found on upstream GitHub Pages", {
							status: 404,
							headers: { "Content-Type": "text/plain; charset=utf-8" },
						});
					}

					const placeholderHtml = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${repoName} - 仓库页面准备中 | isui.ren</title>
    <style>
        :root {
            --bg: #0f1013;
            --surface: #1a1b1f;
            --on-surface: #e2e2e6;
            --muted: #8f9099;
            --primary: #80b3ff;
            --outline: rgba(255,255,255,0.12);
        }
        @media (prefers-color-scheme: light) {
            :root {
                --bg: #f8f9fa;
                --surface: #ffffff;
                --on-surface: #1a1b1f;
                --muted: #5f6368;
                --primary: #005fb8;
                --outline: rgba(0,0,0,0.12);
            }
        }
        body {
            margin: 0;
            padding: 40px 20px;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            background: var(--bg);
            color: var(--on-surface);
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 80vh;
        }
        .card {
            background: var(--surface);
            border: 1px solid var(--outline);
            border-radius: 20px;
            padding: 36px 32px;
            max-width: 520px;
            width: 100%;
            text-align: center;
            box-shadow: 0 8px 32px rgba(0,0,0,0.2);
        }
        .badge {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 4px 12px;
            border-radius: 999px;
            background: rgba(128,179,255,0.15);
            color: var(--primary);
            font-size: 13px;
            font-weight: 600;
            margin-bottom: 16px;
        }
        h1 { margin: 0 0 12px; font-size: 24px; font-weight: 700; }
        p { margin: 0 0 24px; color: var(--muted); font-size: 15px; line-height: 1.6; }
        .actions { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
        .btn {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 10px 20px;
            border-radius: 12px;
            font-size: 14px;
            font-weight: 600;
            text-decoration: none;
            transition: all 0.2s;
        }
        .btn-primary { background: var(--primary); color: #ffffff; }
        .btn-secondary { background: transparent; color: var(--on-surface); border: 1px solid var(--outline); }
        .btn:hover { opacity: 0.88; transform: translateY(-1px); }
    </style>
</head>
<body>
    <div class="card">
        <div class="badge">⚡ EdgeOne 国内加速路由</div>
        <h1>${repoName}</h1>
        <p>该仓库尚未开启 GitHub Pages 或仍在通过 GitHub Actions 构建中。<br/>开通后即可在此处由 EdgeOne 国内节点以毫秒级速度直连访问。</p>
        <div class="actions">
            <a href="https://github.com/ArchivalEra/${repoName}" target="_blank" rel="noopener noreferrer" class="btn btn-primary">
                查看 GitHub 源码仓库 →
            </a>
            <a href="https://isui.ren/MangoMesa/projects/" class="btn btn-secondary">
                返回博客项目展台
            </a>
        </div>
    </div>
</body>
</html>`;
					return new Response(placeholderHtml, {
						status: 404,
						headers: {
							"Content-Type": "text/html; charset=utf-8",
							"Cache-Control": "public, max-age=60",
						},
					});
				}

				const contentType = upstreamResp.headers.get("content-type") || "";

				// HTML response: rewrite base and absolute subpaths
				if (contentType.includes("text/html")) {
					let html = await upstreamResp.text();
					const baseTarget = `/repo/${repoName}/`;

					// 1. Inject <base> into <head>
					if (html.includes("<head>")) {
						html = html.replace(
							"<head>",
							`<head>\n    <base href="${baseTarget}">`,
						);
					} else if (html.includes("<head ")) {
						html = html.replace(
							/(<head[^>]*>)/i,
							`$1\n    <base href="${baseTarget}">`,
						);
					}

					// 2. Rewrite root-relative links for /<repoName>/
					const repoRegex = new RegExp(
						`(href|src|action)=["']/${repoName}/`,
						"g",
					);
					html = html.replace(repoRegex, `$1="${baseTarget}`);

					return new Response(html, {
						status: upstreamResp.status,
						headers: {
							"Content-Type": "text/html; charset=utf-8",
							"Access-Control-Allow-Origin": "*",
							"Cache-Control": "public, max-age=60, s-maxage=300",
						},
					});
				}

				// Static assets (CSS, JS, images, wasm, fonts): stream with long-term EdgeOne cache
				const assetHeaders = new Headers(upstreamResp.headers);
				assetHeaders.set("Access-Control-Allow-Origin", "*");
				assetHeaders.set(
					"Cache-Control",
					"public, max-age=3600, s-maxage=86400",
				);

				return new Response(upstreamResp.body, {
					status: upstreamResp.status,
					headers: assetHeaders,
				});
			} catch (err) {
				return new Response(`EdgeOne Proxy Error: ${err.message}`, {
					status: 502,
					headers: { "Content-Type": "text/plain; charset=utf-8" },
				});
			}
		}
	}

	return next();
}

export const config = {
	matcher: [
		"/api/activity",
		"/api/activity/:path*",
		"/api/mp-ticket",
		"/repo",
		"/repo/:path*",
		"/Bahnhof",
	],
};
