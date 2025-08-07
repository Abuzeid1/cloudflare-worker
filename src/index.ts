/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Bind resources to your worker in `wrangler.jsonc`. After adding bindings, a type definition for the
 * `Env` object can be regenerated with `npm run cf-typegen`.
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

export default {
	async fetch(request, env, ctx): Promise<Response> {
		const country = request?.cf?.country || 'us'; // Get country code from Cloudflare's header
		const url = new URL(request.url);

		// Create a custom cache key including the country
		const cacheKey = new Request(`${url.origin}${url.pathname}?country=${country}`);

		let response = await caches.default.match(cacheKey);

		if (!response) {
			// If not in cache, fetch from origin
			response = new Response(`Hello World! ${country} ${new Date().toISOString()}`);

			// Put the response into the cache with the custom key
			await caches.default.put(cacheKey, response.clone());
		}

		return response;
	},
} satisfies ExportedHandler<Env>;
