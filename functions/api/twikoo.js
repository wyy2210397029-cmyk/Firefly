const TWIKOO_ENDPOINT = "https://twikoo-vercel-omega-two.vercel.app/api";

export async function onRequest(context) {
	const { request } = context;

	if (request.method === "OPTIONS") {
		return new Response(null, {
			status: 204,
			headers: corsHeaders(request),
		});
	}

	const headers = new Headers(request.headers);
	headers.delete("host");

	const upstreamResponse = await fetch(TWIKOO_ENDPOINT, {
		method: request.method,
		headers,
		body: request.method === "GET" || request.method === "HEAD" ? undefined : request.body,
	});

	const responseHeaders = new Headers(upstreamResponse.headers);
	for (const [key, value] of Object.entries(corsHeaders(request))) {
		responseHeaders.set(key, value);
	}

	return new Response(upstreamResponse.body, {
		status: upstreamResponse.status,
		statusText: upstreamResponse.statusText,
		headers: responseHeaders,
	});
}

function corsHeaders(request) {
	const origin = request.headers.get("Origin") || "*";
	return {
		"Access-Control-Allow-Origin": origin,
		"Access-Control-Allow-Credentials": "true",
		"Access-Control-Allow-Methods": "GET, POST, OPTIONS",
		"Access-Control-Allow-Headers":
			request.headers.get("Access-Control-Request-Headers") ||
			"Content-Type, X-CSRF-Token, X-Requested-With, Accept",
		"Access-Control-Max-Age": "600",
	};
}
