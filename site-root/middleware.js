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

			// 仓名大小写归一化：GitHub 仓名不区分大小写，但 Pages 路径与本站静态树
			// 区分大小写。已知规范名（本站特殊处理的仓）按不区分大小写匹配，命中即
			// 301 到规范大小写 —— 否则 /repo/s26-1_202609/ 会落到通用分支去
			// archivalera.github.io/s26-1_202609/（不存在）而 404。
			const CANONICAL_REPOS = ["S26-1_202609", "Octave"];
			const canonical = CANONICAL_REPOS.find((n) => n.toLowerCase() === repoName.toLowerCase());
			if (canonical && canonical !== repoName) {
				const redirectUrl = new URL(request.url);
				redirectUrl.pathname = `/repo/${canonical}${restPath || "/"}`;
				return Response.redirect(redirectUrl.toString(), 301);
			}

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

			// S26-1_202609：EdgeOne 静态树直出（deploy 分支 repo/S26-1_202609/）。
			// 曾短暂走 GitHub Pages 反代（2026-10-12 中文路径 403 事件后迁的），
			// 2026-10-21 回退：该事件当天已自愈且平台侧无规则误拦，而 Pages 管线
			// 与 deploy.yml 两条线同一次 push 各自部署、中间件反代与静态树互相
			// 覆盖（竞态），回归单一管线——deploy.yml 推 deploy 分支。
			// 缓存由 EdgeOne 静态层自身策略管（全站 max-age=0 短缓存惯例）。
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
				// 字节经 GitHub Pages，因为 octave.wasm ~31MB 超过 EdgeOne 单文件 25MB 上限。
				//
				// 传输策略（2026-10-08 原始 HTTP 实测，见下）：**只做整包转发，不做分片**。
				//   · 回源：向 Pages 要 gzip（~7.4MB 拉取，而非 31MB）。
				//   · 本运行时**自己会**把函数响应对声明接受 gzip 的客户端压缩；
				//     实测客户端拿到 7488364B + `content-encoding: gzip`，浏览器原生解压成 31MB。
				//   · 所以两个方向都只有 ~7.4MB，且不需要任何客户端 shim。
				//   · 反例：`Range` + gzip **不成立** —— 实测 206 声称
				//     `content-range: bytes 0-5242879/7488364` 却吐回 19,699,285B 的**已解压**体
				//     （头与体不一致），客户端解析必然失败。故此处不实现分片。
				const cleanRest = restPath.startsWith("/") ? restPath.slice(1) : restPath;
				const pagesUrl = `https://archivalera.github.io/Octave-UI/${cleanRest}${url.search}`;
				// 引擎大二进制（octave.wasm ~31MB / octave.data ~9.3MB）与其它路径分开
				// 治理（issue #30）：max-age=0 意味着每次访问都跨洋回源、浏览器也不落盘。
				// 这两类文件是引擎固定名字节，发布即换内容（Pages ETag 随构建变）：
				//   · 浏览器 1h 强缓存（二次访问 0ms、from disk cache）；
				//   · EdgeOne 侧 s-maxage 24h 驻留国内节点；
				//   · 过期后条件请求透传上游（Pages 原生支持 304；实测此前带
				//     If-None-Match 也整包重传 30s+，透传后秒回）。
				// 版本失效：Octave-UI 发版时 Pages ETag/Last-Modified 变化，再校验立即
				// 拿到新 200；无需 Zone Purge。
				const isEngineBinary =
					/\.wasm$/.test(url.pathname) || /\.data$/.test(url.pathname);
				// Astro 的 _astro/ 产物文件名带内容哈希（Octave-UI 2026-10-24 实证：
				// 同源重建名集合一致 / 注释被剥名不变 / 真改内容 App.D7owsQ-e →
				// App.Bq1w34hm 名必变）⇒ 内容变则名变，可永久缓存且永不需 purge。
				// 这也是消除「最高频穿边缘路径」的关键：chunk 此前 max-age=0，
				// 每次请求都跨洋回源，而边缘间歇挂起正发生在这条 fetch 上
				// （Octave-UI SITE-ADMIN-REQUEST 附录实测：chunk 8 次里 2 次超时）。
				const isHashedAsset = url.pathname.includes("/_astro/");
				// bridge/* 与 favicon 等「固定名、非 HTML、非哈希」静态（申请五）：
				// index.html 里有 12 个 bridge 经典脚本、0 defer/async（<head> 阻塞），
				// 每个都 max-age=0 ⇒ 每次页面加载 12 发穿边缘回源。按节点级抖动
				// 概率 p，整页幸存率 ≈ (1-p)^12（p=5% 时 ≈54%，与对方实测浏览器层
				// ~50% 失败率吻合）。bridge 内容变更节奏 = 引擎仓更新节奏，与 lanes
				// 同源同频，故给同档缓存（浏览器 1h / 边缘 24h / SWR 600s）。
				const isFixedNameAsset =
					/^\/repo\/Octave\/(bridge\/|favicon\.)/.test(url.pathname);
				// HTML 文档判定：以扩展名/目录形态识别（上游 content-type 已拿到，
				// 但这里在 fetch 前就要决定超时策略，故用路径判断；末尾无扩展名
				// 的路径按目录索引处理 = HTML）。
				const isHtmlDocument =
					/\.html?$/.test(url.pathname) ||
					!/\.[a-z0-9]+$/i.test(url.pathname);
				const upstreamHeaders = { "Accept-Encoding": "gzip" };
				if (isEngineBinary) {
					const inm = request.headers.get("if-none-match");
					if (inm) upstreamHeaders["If-None-Match"] = inm;
					const ims = request.headers.get("if-modified-since");
					if (ims) upstreamHeaders["If-Modified-Since"] = ims;
				}
				// A'：`.gz` 走不透明二进制通道——上游必须 identity（否则 Pages 会
				// 对 gz 再压一层，Range 就指向二次压缩体，客户端解不出），并把客户端
				// 的 Range 原样透传（分片加载的前提）。
				const isPrecompressedReq = url.pathname.endsWith(".gz");
				if (isPrecompressedReq) {
					upstreamHeaders["Accept-Encoding"] = "identity";
					const range = request.headers.get("range");
					if (range) upstreamHeaders["Range"] = range;
				}
				// 边缘挂起兜底 + 对冲请求（hedged request）。
				//
				// 实测形态（2026-10-25 07:59，并发 10 路同 URL）：
				//   边缘 9 路 0.6–1.3s 正常，1–2 路卡到 25s 上限；
				//   Pages 直连基线同样有 3/10 慢到 5.5s。
				// ⇒ 劣化是**单请求级随机失败**，不是整条路径死掉（否则 10 路会全卡）。
				// 这正适合对冲：1.5s 内没拿到响应头就并发第二发，谁先回用谁，
				// 另一个 abort。最坏延迟 ≈ 对冲延迟 + 正常延迟，不是串行重试的 2×。
				// 收益：单发失败率 p → p²（假设独立）。p=5% 时 12 发脚本的整页
				// 幸存率从 (0.95)^12≈54% 升到 (0.9975)^12≈97%。
				//
				// 超时：小文件 8s（对方实测成功请求全在 0.3–7s，挂住的都是 20s+ 到底）；
				// 大二进制不设超时（74.5MB 实测 142s，卡死它才是事故）。
				const HEDGE_DELAY_MS = 1500;
				const SMALL_TIMEOUT_MS = 8000;
				const fetchOnce = async (signal) =>
					fetch(pagesUrl, { headers: upstreamHeaders, signal });
				const withTimeout = async () => {
					if (isEngineBinary || typeof AbortController !== "function") {
						return fetchOnce(undefined);
					}
					const ctrl = new AbortController();
					const timer = setTimeout(() => ctrl.abort(), SMALL_TIMEOUT_MS);
					try {
						return await fetchOnce(ctrl.signal);
					} finally {
						clearTimeout(timer);
					}
				};
				let upstream = null;
				if (isEngineBinary || typeof AbortController !== "function") {
					// 大二进制 / 无 AbortController：单发 + 各自超时策略
					try {
						upstream = await withTimeout();
					} catch (_err) {
						upstream = null;
					}
				} else {
					// 小文件：对冲。第一发 1.5s 未回响应头 ⇒ 立刻发第二发。
					// 语义：「首个**成功**者胜」——任一发失败不算结果，继续等另一发；
					// 任一发成功则 settle 并 abort 另一发。
					const ctrlA = new AbortController();
					const ctrlB = new AbortController();
					const timerA = setTimeout(() => ctrlA.abort(), SMALL_TIMEOUT_MS);
					let timerB = null;
					let hedgeTimer = null;
					upstream = await new Promise((resolve) => {
						let settled = false;
						const win = (r) => {
							if (settled || !r) return; // 失败：不 settle，等另一发
							settled = true;
							clearTimeout(timerA);
							clearTimeout(hedgeTimer);
							if (timerB) clearTimeout(timerB);
							ctrlA.abort();
							ctrlB.abort();
							resolve(r);
						};
						// 第一发
						fetchOnce(ctrlA.signal)
							.catch(() => null)
							.then(win);
						// 对冲发：1.5s 后若仍未 settle 就发第二发
						hedgeTimer = setTimeout(() => {
							if (settled) return;
							timerB = setTimeout(() => ctrlB.abort(), SMALL_TIMEOUT_MS);
							fetchOnce(ctrlB.signal)
								.catch(() => null)
								.then(win);
						}, HEDGE_DELAY_MS);
						// 兜底：两发都失败时，等 timerA 触发 abort 后 primary 的 catch
						// 会走到这里，但 win(null) 不 settle ⇒ 需要一个失败收口。
						// 用最长等待（SMALL_TIMEOUT + HEDGE_DELAY + SMALL_TIMEOUT）兜底。
						setTimeout(
							() => {
								if (settled) return;
								settled = true;
								resolve(null);
							},
							SMALL_TIMEOUT_MS * 2 + HEDGE_DELAY_MS,
						);
					});
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
				if (url.pathname.endsWith(".wasm")) {
					headers.set("Content-Type", "application/wasm");
				}
				// A'（2026-10-25，第三方评估推荐的主线）：`.gz` 文件按**不透明二进制**
				// 处理——透传 Range/206/Content-Range/Content-Length，**不设**
				// Content-Encoding。这样出口层「无需解读、不可再压」，规避 1008 那次
				// 头体来自不同表示的坑（旧形态 EdgeOne 原生 maker；现在是中间件反代，
				// 且实测 GitHub Pages 对 .gz 的 Range 完全自洽：
				//   206 / content-range: bytes 0-1048575/7304578 / 实收 1048576B，
				//   分片拼接 gunzip rc=0、31246819 字节、\0asm 头正确，2.1s 完成）。
				// 客户端自行按 gz 分片取、拼接、DecompressionStream 解压。
				// 非 .gz 路径保持原语义（Accept-Ranges: none，整包 + 运行时压缩）。
				if (isPrecompressedReq) {
					headers.set("Accept-Ranges", "bytes");
					headers.set("Content-Type", "application/gzip");
					// 不设 Content-Encoding：体就是 gz 字节，标签由 Content-Type 表达
					headers.delete("Content-Encoding");
				} else {
					headers.set("Accept-Ranges", "none");
					// 运行时交给我们的体可能已被解压，故清掉这两个头（由运行时按客户端
					// 的 Accept-Encoding 重新协商压缩）；这与实测 B 一致。
					headers.delete("Content-Encoding");
					headers.delete("Content-Length");
				}
				// 304 必须无实体头（Content-Length: 0 会把浏览器搞糊涂）；上游 304 的
				// ETag/Last-Modified 已在 headers 里透传，浏览器据此更新缓存条目。
				if (upstream.status === 304) {
					const h304 = new Headers();
					h304.set("ETag", upstream.headers.get("etag") || "");
					h304.set("Last-Modified", upstream.headers.get("last-modified") || "");
					h304.set(
						"Cache-Control",
						"public, max-age=3600, s-maxage=86400, stale-while-revalidate=600",
					);
					return new Response(null, { status: 304, headers: h304 });
				}
				if (isEngineBinary) {
					headers.set(
						"Cache-Control",
						"public, max-age=3600, s-maxage=86400, stale-while-revalidate=600",
					);
				} else if (isHashedAsset) {
					// 内容哈希命名 ⇒ 名变即内容变，永久缓存安全（对方已实证）。
					headers.set("Cache-Control", "public, max-age=31536000, immutable");
				} else if (isFixedNameAsset) {
					// 固定名静态（bridge/*、favicon）：内容随引擎构建变，故不能
					// immutable，给与 lanes 同档的 1h/24h/SWR——把每次加载的 12 发
					// 穿边缘回源压到 0。
					headers.set(
						"Cache-Control",
						"public, max-age=3600, s-maxage=86400, stale-while-revalidate=600",
					);
				} else if (isHtmlDocument) {					// HTML 短缓存（申请五-1，对方 2026-10-24 深夜答复接受）：此前
					// max-age=0 意味着每次页面加载必有 1 发穿边缘回源，正是他们 12
					// 样本复验里 2 次整页超时的来源。30s 强缓存 + SWR 600s：发版后
					// 最长 30s 用户见旧版（对方接受：发版节奏小时级），换掉每次加载
					// 必中的挂起彩票；SWR 窗口内旧版照常服务、后台再验证。
					headers.set(
						"Cache-Control",
						"public, max-age=30, stale-while-revalidate=600",
					);
				} else {
					// 与站内其它路径一致：每次校验，推送立即可见（不是「清缓存」，是默认不缓存）。
					headers.set("Cache-Control", "public, max-age=0, must-revalidate");
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
