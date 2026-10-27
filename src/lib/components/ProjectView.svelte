<script lang="ts">
	import Panel from './Panel.svelte';
	import { external, getShell, runOnClick } from '$lib/context';
	import { projects, type Project } from '$lib/data';

	let { project }: { project: Project } = $props();

	const shell = getShell();
	const index = $derived(projects.indexOf(project));
	const prev = $derived(projects[(index - 1 + projects.length) % projects.length]);
	const next = $derived(projects[(index + 1) % projects.length]);
	const host = (href: string) => new URL(href).hostname.replace(/^www\./, '');
</script>

<Panel
	title="~/projects/{project.slug}/README.md"
	meta="{String(index + 1).padStart(2, '0')}/{String(projects.length).padStart(2, '0')}"
>
	<article>
		<header data-stagger style="--i: 0">
			<h2><span class="hash" aria-hidden="true">{'# '}</span>{project.name}</h2>
			<span class="kind">[{project.kind} · {project.year}]</span>
		</header>
		<p class="overview" data-stagger style="--i: 1">{project.overview}</p>

		<dl>
			<div data-stagger style="--i: 2">
				<dt>## why</dt>
				<dd>{project.motivation}</dd>
			</div>
			{#if project.outcome}
				<div data-stagger style="--i: 3">
					<dt>## outcome</dt>
					<dd class="outcome"><span aria-hidden="true">{'✓ '}</span>{project.outcome}</dd>
				</div>
			{/if}
			<div data-stagger style="--i: 4">
				<dt>## stack</dt>
				<dd>
					<ul class="chips">
						{#each project.technologies as tech (tech)}
							<li>
								<button
									type="button"
									title="grep {tech.toLowerCase()}"
									onclick={() => shell.exec(`grep ${tech.toLowerCase()}`)}>{tech}</button
								>
							</li>
						{/each}
					</ul>
				</dd>
			</div>
			<div data-stagger style="--i: 5">
				<dt>## links</dt>
				<dd>
					<ul class="links">
						{#each project.links as link (link.href)}
							<li>
								<a href={link.href} {...external}
									><span class="arrow" aria-hidden="true">→</span>
									{link.label}
									<span class="host">{host(link.href)}</span><span aria-hidden="true">{' ↗'}</span
									></a
								>
							</li>
						{/each}
					</ul>
				</dd>
			</div>
		</dl>
	</article>

	<nav aria-label="Other projects" data-stagger style="--i: 6">
		<a href="/{prev.slug}/" onclick={runOnClick(shell, `cat ${prev.slug}`)}
			><span aria-hidden="true">{'← '}</span>cat {prev.slug}</a
		>
		<a class="ls" href="/" onclick={runOnClick(shell, 'ls')}>ls</a>
		<a href="/{next.slug}/" onclick={runOnClick(shell, `cat ${next.slug}`)}
			>cat {next.slug}<span aria-hidden="true">{' →'}</span></a
		>
	</nav>
</Panel>

<style>
	header {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		justify-content: space-between;
		gap: 0.25em 2ch;
	}

	h2 {
		margin: 0;
		color: var(--yellow);
		font-size: 1.45em;
		font-weight: 650;
		line-height: 1.3;
	}

	.hash {
		color: var(--faint);
	}

	.kind {
		color: var(--magenta);
	}

	.overview {
		max-width: 72ch;
		margin: 0.6em 0 1.2em;
	}

	dl {
		margin: 0;
		border-top: 1px solid var(--line);
	}

	dl div {
		display: grid;
		grid-template-columns: 12ch minmax(0, 1fr);
		gap: 0.25em 2ch;
		padding: 0.75em 0;
		border-bottom: 1px solid var(--line);
	}

	dt {
		color: var(--blue);
		font-weight: 600;
	}

	dd {
		max-width: 72ch;
		margin: 0;
	}

	.outcome {
		color: var(--green);
	}

	ul {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5em 1ch;
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.chips button {
		padding: 0.05em 1ch;
		color: var(--fg);
		border: 1px solid var(--line-strong);
	}

	.chips button:hover {
		color: var(--bg);
		background: var(--fg);
		border-color: var(--fg);
	}

	.links {
		gap: 0.35em 3ch;
	}

	.links a {
		color: var(--cyan);
	}

	.links .host {
		color: var(--muted);
	}

	.links .arrow {
		color: var(--faint);
	}

	nav {
		display: grid;
		grid-template-columns: 1fr auto 1fr;
		margin-top: 1em;
		border: 1px solid var(--line);
	}

	nav a {
		padding: 0.45em 1.5ch;
		overflow: hidden;
		color: var(--muted);
		text-decoration: none;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	nav a:hover {
		color: var(--fg);
		background: var(--hover);
	}

	nav a:last-child {
		text-align: right;
	}

	.ls {
		border-inline: 1px solid var(--line);
	}

	@media (max-width: 640px) {
		dl div {
			grid-template-columns: minmax(0, 1fr);
		}
	}
</style>
