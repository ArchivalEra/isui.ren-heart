/**
 * EdgeOne Makers Edge Function: /api/activity
 * Reverse-proxies to upstream Cloudflare Worker (api.mango-mesa.ccwu.cc)
 * with CORS headers and short edge caching (5s max-age, 10s s-maxage).
 */
export async function onRequest(context) {
	const { request } = context;

	// Handle CORS preflight if any
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
		const upstreamUrl = "https://api.mango-mesa.ccwu.cc/api/activity";
		const upstreamResp = await fetch(upstreamUrl, {
			method: "GET",
			headers: {
				Accept: "application/json",
				"User-Agent":
					request.headers.get("user-agent") || "EdgeOne-Activity-Proxy/1.0",
			},
		});

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
	} catch (err) {
		return new Response(
			JSON.stringify({
				error: "Failed to connect to upstream activity server",
				detail: String(err),
			}),
			{
				status: 502,
				headers: {
					"Content-Type": "application/json; charset=utf-8",
					"Access-Control-Allow-Origin": "*",
				},
			},
		);
	}
}

export default onRequest;
