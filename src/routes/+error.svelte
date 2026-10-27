<script lang="ts">
	import { page } from '$app/state';
	import Terminal from '$lib/components/Terminal.svelte';
	import { portfolioPaths, projects } from '$lib/data';

	// oberai.dev used to host the portfolio, so old links still arrive here. Paths the
	// portfolio serves forward to adityaoberai.com; /projects/<slug> opens the project here.
	const path = page.url.pathname.replace(/\/+$/, '') || '/';
	const [first = '', second] = path.split('/').filter(Boolean);
	const boot =
		first === 'projects'
			? [projects.some((p) => p.slug === second) ? `cat ${second}` : 'ls']
			: portfolioPaths.includes(first.toLowerCase())
				? [`cd ${path}`, `portfolio ${path}`]
				: [`cd ${path}`, 'ls'];
</script>

<Terminal {boot} />
