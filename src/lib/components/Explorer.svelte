<script lang="ts">
	import { external, getShell, runOnClick } from '$lib/context';
	import { projects, site } from '$lib/data';

	const shell = getShell();
	const quick = ['help', 'ls', 'stack', 'neofetch', 'portfolio', 'clear'];
</script>

<aside aria-label="Explorer">
	<div class="inner">
		<section>
			<h2>Explorer</h2>
			<p class="root">~/projects</p>
			<ul class="tree">
				{#each projects as p, i (p.slug)}
					<li>
						<span class="branch" aria-hidden="true"
							>{i === projects.length - 1 ? '└──' : '├──'}</span
						>
						<a
							href="/{p.slug}/"
							aria-current={shell.current() === p.slug ? 'page' : undefined}
							onclick={runOnClick(shell, `cat ${p.slug}`)}>{p.slug}</a
						>
					</li>
				{/each}
			</ul>
		</section>

		<section>
			<h2>Commands</h2>
			<ul class="commands">
				{#each quick as command (command)}
					<li><button type="button" onclick={() => shell.exec(command)}>{command}</button></li>
				{/each}
			</ul>
		</section>

		<section>
			<h2>Elsewhere</h2>
			<ul class="links">
				<li>
					<a href={site.home} {...external}
						>adityaoberai.com<span aria-hidden="true">{' ↗'}</span></a
					>
				</li>
				<li>
					<a href={site.github} {...external}
						>github.com/adityaoberai<span aria-hidden="true">{' ↗'}</span></a
					>
				</li>
				<li><a href="mailto:{site.email}">{site.email}</a></li>
			</ul>
		</section>
	</div>
</aside>

<style>
	aside {
		border-left: 1px solid var(--line-strong);
	}

	.inner {
		position: sticky;
		top: var(--bar-h);
		max-height: calc(100dvh - 2 * var(--bar-h));
		overflow: auto;
	}

	section + section {
		border-top: 1px solid var(--line-strong);
	}

	h2 {
		margin: 0;
		padding: 0.5em 2ch;
		color: var(--muted);
		font-size: 0.8em;
		font-weight: 500;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		border-bottom: 1px solid var(--line);
	}

	ul {
		margin: 0;
		padding: 0.75em 2ch;
		list-style: none;
	}

	.root {
		margin: 0;
		padding: 0.75em 2ch 0;
		color: var(--blue);
		font-weight: 600;
	}

	.tree {
		padding-top: 0.15em;
	}

	.tree li {
		display: flex;
		gap: 1ch;
		white-space: nowrap;
	}

	.branch {
		color: var(--faint);
	}

	.tree a {
		min-width: 0;
		overflow: hidden;
		color: var(--fg);
		text-decoration: none;
		text-overflow: ellipsis;
	}

	.tree a:hover {
		text-decoration: underline;
		text-underline-offset: 0.2em;
	}

	.tree a[aria-current] {
		color: var(--bg);
		background: var(--green);
	}

	.commands {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5em 1ch;
	}

	.commands button {
		padding: 0 1ch;
		color: var(--green);
		border: 1px solid var(--line-strong);
	}

	.commands button:hover {
		color: var(--bg);
		background: var(--green);
		border-color: var(--green);
	}

	.links li {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.links a {
		color: var(--cyan);
	}
</style>
