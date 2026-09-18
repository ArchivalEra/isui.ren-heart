/**
 * EdgeOne Makers Middleware
 * Runs before page load on EdgeOne edge nodes.
 * Intercepts /api/activity and /api/activity/report, reverse-proxying to upstream Cloudflare Worker.
 */
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

			// If repository has its own static files deployed locally in EdgeOne (e.g. S26-1Shitass),
			// serve directly via EdgeOne static origin
			if (repoName === "S26-1Shitass") {
				return next();
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
		"/repo",
		"/repo/:path*",
		"/Bahnhof",
	],
};
