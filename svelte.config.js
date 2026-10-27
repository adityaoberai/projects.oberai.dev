import adapter from '@sveltejs/adapter-static';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		// Every route is prerendered. 404.html is an SPA shell that renders +error.svelte for unknown paths.
		adapter: adapter({ fallback: '404.html' })
	}
};

export default config;
