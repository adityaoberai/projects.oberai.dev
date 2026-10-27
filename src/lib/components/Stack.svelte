<script lang="ts">
	import Panel from './Panel.svelte';
	import { getShell } from '$lib/context';
	import { projects, stack } from '$lib/data';

	const shell = getShell();
	const most = stack[0].slugs.length;
	const SEGMENT = 3;
</script>

<Panel title="stack" meta="{stack.length} technologies across {projects.length} projects">
	<ul>
		{#each stack as tech, i (tech.name)}
			<li data-stagger style="--i: {i}">
				<button type="button" onclick={() => shell.exec(`grep ${tech.name.toLowerCase()}`)}>
					<span class="name">{tech.name}</span>
					<span class="bar" aria-hidden="true"
						>{'█'.repeat(tech.slugs.length * SEGMENT)}<span class="rest"
							>{'░'.repeat((most - tech.slugs.length) * SEGMENT)}</span
						></span
					>
					<span class="count"
						>{tech.slugs.length}<span class="sr-only"
							>{tech.slugs.length === 1 ? ' project' : ' projects'}</span
						></span
					>
				</button>
			</li>
		{/each}
	</ul>
	<p class="hint">Click a technology to grep for it.</p>
</Panel>

<style>
	ul {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(min(100%, 42ch), 1fr));
		column-gap: 4ch;
		margin: 0;
		padding: 0;
		list-style: none;
	}

	li {
		border-bottom: 1px dashed var(--line);
	}

	button {
		display: flex;
		gap: 2ch;
		width: 100%;
		padding: 0.25em 0;
		text-align: left;
	}

	button:hover .name {
		text-decoration: underline;
		text-underline-offset: 0.2em;
	}

	.name {
		flex: 1;
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.bar {
		color: var(--green);
		white-space: pre;
	}

	.rest {
		color: var(--line-strong);
	}

	.count {
		width: 2ch;
		color: var(--muted);
		text-align: right;
	}

	.hint {
		margin: 0.9em 0 0;
		color: var(--muted);
	}
</style>
