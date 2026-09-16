/**
 * EdgeOne Makers Middleware
 * Runs before page load on EdgeOne edge nodes.
 * Intercepts /api/activity/* and /api/origin-cache/*, reverse-proxying to upstream Cloudflare Worker (api.mango-mesa.ccwu.cc).
 */
export async function middleware(context) {
	const { request, rewrite, next } = context;
	const url = new URL(request.url);

	const isActivity =
		url.pathname === "/api/activity" ||
		url.pathname.startsWith("/api/activity/");
	const isOriginCache =
		url.pathname === "/api/origin-cache" ||
		url.pathname.startsWith("/api/origin-cache/");

	if (isActivity || isOriginCache) {
		if (request.method === "OPTIONS") {
			return new Response(null, {
				status: 204,
				headers: {
					"Access-Control-Allow-Origin": "*",
					"Access-Control-Allow-Methods": "GET, POST, OPTIONS",
					"Access-Control-Allow-Headers": "*",
					"Access-Control-Max-Age": "86400",
				},
			});
		}

		const upstreamUrl = `https://api.mango-mesa.ccwu.cc${url.pathname}${url.search}`;

		if (request.method === "GET") {
			try {
				const upstreamResp = await fetch(upstreamUrl, {
					headers: {
						Accept: request.headers.get("accept") || "application/json",
						"User-Agent":
							request.headers.get("user-agent") || "EdgeOne-Middleware-Proxy",
					},
				});
				const body = await upstreamResp.text();
				return new Response(body, {
					status: upstreamResp.status,
					headers: {
						"Content-Type":
							upstreamResp.headers.get("content-type") ||
							"application/json; charset=utf-8",
						"Access-Control-Allow-Origin": "*",
						"Access-Control-Allow-Methods": "GET, OPTIONS",
						"Access-Control-Allow-Headers": "*",
						"Cache-Control":
							url.pathname === "/api/activity"
								? "public, max-age=5, s-maxage=10"
								: "no-store",
					},
				});
			} catch (_err) {
				return rewrite(upstreamUrl);
			}
		}

		if (request.method === "POST") {
			try {
				const body = await request.text();
				const upstreamResp = await fetch(upstreamUrl, {
					method: "POST",
					headers: {
						"Content-Type":
							request.headers.get("content-type") || "application/json",
						Authorization: request.headers.get("authorization") || "",
						"User-Agent":
							request.headers.get("user-agent") || "EdgeOne-Middleware-Proxy",
					},
					body,
				});
				const respBody = await upstreamResp.text();
				return new Response(respBody, {
					status: upstreamResp.status,
					headers: {
						"Content-Type":
							upstreamResp.headers.get("content-type") ||
							"application/json; charset=utf-8",
						"Access-Control-Allow-Origin": "*",
						"Access-Control-Allow-Methods": "POST, OPTIONS",
						"Access-Control-Allow-Headers": "*",
					},
				});
			} catch (_err) {
				return rewrite(upstreamUrl);
			}
		}
	}

	return next();
}

export const config = {
	matcher: [
		"/api/activity",
		"/api/activity/:path*",
		"/api/origin-cache",
		"/api/origin-cache/:path*",
	],
};
