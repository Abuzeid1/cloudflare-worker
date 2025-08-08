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
import indexHtml from './index.html';

export default {
	async fetch(request, env, ctx): Promise<Response> {
		const url = new URL(request.url);
		const country = request?.cf?.country || 'us'; // Get country code from Cloudflare's header

		if (url.pathname == '/purge') {
			const cacheKey = new Request(`${url.origin}/?country=${country}`);
			ctx.waitUntil(caches.default.delete(cacheKey));

			return new Response('purged', {
				headers: {
					'Content-Type': 'text',
				},
			});
		}
		// Create a custom cache key including the country
		const cacheKey = new Request(`${url.origin}${url.pathname}?country=${country}`);

		let response = await caches.default.match(cacheKey);

		if (!response) {
			// If not in cache, fetch from origin
			const dynamicHtml = indexHtml.replace(
				'<h1>Hello World</h1>',
				`<h1>Hello World from ${country.toUpperCase()} - ${new Date().toISOString()}</h1>`
			);
			response = new Response(dynamicHtml, {
				headers: {
					'Content-Type': 'text/html',
					'cache-control': 'public, durable, max-age=60,max-s-age=3600',
					'Cache-Tag': 'index',
					time: new Date().toISOString(),
				},
			});

			// Put the response into the cache with the custom key
			ctx.waitUntil(caches.default.put(cacheKey, response.clone()));
		}

		return response;
	},
} satisfies ExportedHandler<Env>;
