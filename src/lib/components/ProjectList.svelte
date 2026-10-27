<script lang="ts">
	import Panel from './Panel.svelte';
	import { getShell, runOnClick } from '$lib/context';
	import { projects, type Project } from '$lib/data';

	let { items, query }: { items: Project[]; query?: string } = $props();

	const shell = getShell();
	const number = (p: Project) => String(projects.indexOf(p) + 1).padStart(2, '0');
	const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

	// Split text around the search term so matches can be highlighted.
	function parts(text: string) {
		if (!query) return [{ text, hit: false }];
		const q = query.toLowerCase();
		return text
			.split(new RegExp(`(${escape(query)})`, 'i'))
			.filter(Boolean)
			.map((t) => ({ text: t, hit: t.toLowerCase() === q }));
	}

	// When grep matched a technology rather than the description, show the technology.
	function about(p: Project) {
		if (!query || p.overview.toLowerCase().includes(query.toLowerCase())) return p.overview;
		const techs = p.technologies.filter((t) => t.toLowerCase().includes(query.toLowerCase()));
		return techs.length ? `uses ${techs.join(', ')}` : p.overview;
	}
</script>

<Panel
	title={query ? `grep "${query}" ~/projects` : '~/projects'}
	meta="{items.length} {items.length === 1 ? 'item' : 'items'}"
>
	<div class="row head" aria-hidden="true">
		<span>#</span><span class="mode">mode</span><span class="kind">kind</span><span class="name"
			>name</span
		><span class="about">about</span>
	</div>
	<ul>
		{#each items as p, i (p.slug)}
			<li class="row" class:current={shell.current() === p.slug} data-stagger style="--i: {i}">
				<span class="n">{number(p)}</span>
				<span class="mode" aria-hidden="true">drwxr-xr-x</span>
				<span class="kind">{p.kind}</span>
				<a class="name" href="/{p.slug}/" onclick={runOnClick(shell, `cat ${p.slug}`)}
					>{#each parts(p.slug) as part, j (j)}{#if part.hit}<mark>{part.text}</mark
							>{:else}{part.text}{/if}{/each}/</a
				>
				<span class="about"
					>{#each parts(about(p)) as part, j (j)}{#if part.hit}<mark>{part.text}</mark
							>{:else}{part.text}{/if}{/each}</span
				>
			</li>
		{/each}
	</ul>
</Panel>

<style>
	ul {
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.row {
		position: relative;
		display: grid;
		grid-template-columns: 2ch 10ch 11ch 20ch minmax(0, 1fr);
		gap: 2.5ch;
		padding: 0.3em 1ch;
		margin: 0 -1ch;
	}

	.head {
		padding-bottom: 0.45em;
		margin-bottom: 0.25em;
		color: var(--muted);
		border-bottom: 1px solid var(--line);
	}

	li + li {
		border-top: 1px dashed var(--line);
	}

	.n,
	.mode {
		color: var(--faint);
	}

	.kind {
		color: var(--magenta);
	}

	.name {
		color: var(--blue);
		font-weight: 600;
		text-decoration: none;
		white-space: nowrap;
	}

	/* The whole row is the click target. */
	.name::after {
		content: '';
		position: absolute;
		inset: 0;
	}

	.about {
		overflow: hidden;
		color: var(--muted);
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	li:hover,
	li:focus-within,
	li.current {
		background: var(--hover);
	}

	li:hover .name,
	li:focus-within .name {
		text-decoration: underline;
		text-underline-offset: 0.2em;
	}

	li.current .n {
		color: var(--green);
	}

	mark {
		color: var(--bg);
		background: var(--yellow);
	}

	@media (max-width: 760px) {
		.row {
			grid-template-columns: 2ch minmax(0, 1fr) auto;
			grid-template-areas: 'n name kind' '. about about';
			column-gap: 1.5ch;
			row-gap: 0.1em;
		}

		.head {
			display: none;
		}

		.mode {
			display: none;
		}

		.n {
			grid-area: n;
		}

		.name {
			grid-area: name;
			overflow: hidden;
			text-overflow: ellipsis;
		}

		.kind {
			grid-area: kind;
		}

		.about {
			grid-area: about;
			display: -webkit-box;
			-webkit-box-orient: vertical;
			-webkit-line-clamp: 2;
			line-clamp: 2;
			white-space: normal;
		}
	}
</style>
