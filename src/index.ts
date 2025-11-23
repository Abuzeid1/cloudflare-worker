import { waitUntil } from 'cloudflare:workers';

export default {
	async fetch(request, env, ctx): Promise<Response> {
		const url = new URL(request.url);
		// Get country code from Cloudflare's header
		const country = request?.cf?.country || 'us';

		if (url.pathname == '/purge') {
			const cacheKey = 'https://staging.theqalink.com/database/worker';
			ctx.waitUntil(caches.default.delete(cacheKey));

			return new Response('purged', {
				headers: {
					'Content-Type': 'text',
				},
			});
		}
		// Create a custom cache key including the country
		const cacheKey = 'https://staging.theqalink.com/database/worker';

		let response = await caches.default.match(cacheKey);

		if (!response) {
			// If not in cache, fetch from origin

			response = new Response(`hell on earth ${new Date().toString()}`, {
				headers: {
					'Content-Type': 'text/plain',
					'Cache-Control': 'public, durable, max-age=60,s-maxage=3600, stale-while-revalidate=3600',
				},
			});

			console.log('cache not found');

			// Put the response into the cache with the custom key
			ctx.waitUntil(caches.default.put(cacheKey, response));
		} else {
			console.log({ text: await response.text() });
		}

		return new Response('go To hell');
	},
} satisfies ExportedHandler<Env>;
