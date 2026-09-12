/**
 * EdgeOne Makers Middleware
 * Runs before page load on EdgeOne edge nodes.
 * Intercepts /api/activity and reverse-proxies to upstream or rewrites.
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
			// Fallback to native EdgeOne rewrite proxy if direct fetch is unsupported in middleware
			return rewrite("https://api.mango-mesa.ccwu.cc/api/activity");
		}
	}

	return next();
}

export const config = {
	matcher: ["/api/activity"],
};
