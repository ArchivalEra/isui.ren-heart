/**
 * EdgeOne Makers Edge Function: /api/activity/origin-cache
 * Proxies telemetry / watchdog reports from origin-cache nodes to upstream Cloudflare Worker.
 */
export async function onRequest(context) {
	const { request } = context;

	// Handle CORS preflight
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

	if (request.method !== "POST") {
		return new Response(JSON.stringify({ error: "Method not allowed" }), {
			status: 405,
			headers: {
				"Content-Type": "application/json; charset=utf-8",
				"Access-Control-Allow-Origin": "*",
			},
		});
	}

	try {
		const upstreamUrl = "https://api.mango-mesa.ccwu.cc/api/activity/origin-cache";
		const body = await request.text();

		const upstreamResp = await fetch(upstreamUrl, {
			method: "POST",
			headers: {
				"Content-Type": request.headers.get("content-type") || "application/json",
				Authorization: request.headers.get("authorization") || "",
				"User-Agent":
					request.headers.get("user-agent") || "EdgeOne-OriginCache-Proxy/1.0",
			},
			body,
		});

		const respBody = await upstreamResp.text();

		return new Response(respBody, {
			status: upstreamResp.status,
			headers: {
				"Content-Type": upstreamResp.headers.get("content-type") || "application/json; charset=utf-8",
				"Access-Control-Allow-Origin": "*",
				"Access-Control-Allow-Methods": "POST, OPTIONS",
				"Access-Control-Allow-Headers": "*",
			},
		});
	} catch (err) {
		return new Response(
			JSON.stringify({
				error: "Failed to forward origin-cache report to upstream activity server",
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
