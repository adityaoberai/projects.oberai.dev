<script lang="ts">
	import { external } from '$lib/context';
	import { projects, site, stack } from '$lib/data';

	const logo = [
		' █████╗  ██████╗ ',
		'██╔══██╗██╔═══██╗',
		'███████║██║   ██║',
		'██╔══██║██║   ██║',
		'██║  ██║╚██████╔╝',
		'╚═╝  ╚═╝ ╚═════╝ '
	];
	// Split each row into runs so the solid blocks and their shadow take different colors.
	const rows = logo.map((row) => row.match(/█+|[^█]+/g) ?? []);

	const header = `${site.user}@${site.hostname}`;
	const info: { key: string; value: string; href?: string }[] = [
		{ key: 'Owner', value: site.name },
		{ key: 'Role', value: site.role },
		{ key: 'Projects', value: `${projects.length}, from hackathon builds to small tools` },
		{ key: 'Stack', value: `${stack.length} technologies` },
		{ key: 'Home', value: 'adityaoberai.com', href: site.home },
		{ key: 'GitHub', value: '@adityaoberai', href: site.github },
		{ key: 'Mail', value: site.email, href: `mailto:${site.email}` },
		{ key: 'Built with', value: 'SvelteKit, prerendered' }
	];
	const swatches = ['red', 'yellow', 'green', 'cyan', 'blue', 'magenta', 'muted', 'fg'];
</script>

<div class="neofetch">
	<pre class="logo" aria-hidden="true">{#each rows as row}{#each row as run}<span
					class:fill={run.startsWith('█')}>{run}</span
				>{/each}{'\n'}{/each}</pre>

	<div class="info">
		<p class="head" data-stagger style="--i: 0">
			<span class="user">{site.user}</span>@<span class="host">{site.hostname}</span>
		</p>
		<p class="rule" aria-hidden="true" data-stagger style="--i: 1">{'─'.repeat(header.length)}</p>
		<dl>
			{#each info as row, i (row.key)}
				<div data-stagger style="--i: {i + 2}">
					<dt>{row.key}</dt>
					<dd>
						{#if row.href}
							<a href={row.href} {...row.href.startsWith('http') ? external : {}}
								>{row.value}{#if row.href.startsWith('http')}<span aria-hidden="true">{' ↗'}</span
									>{/if}</a
							>
						{:else}
							{row.value}
						{/if}
					</dd>
				</div>
			{/each}
		</dl>
		<div class="swatches" aria-hidden="true" data-stagger style="--i: {info.length + 2}">
			{#each swatches as color (color)}<span style="background: var(--{color})"></span>{/each}
		</div>
	</div>
</div>

<style>
	.neofetch {
		display: flex;
		flex-wrap: wrap;
		align-items: flex-start;
		gap: 1.5em 4ch;
		margin: 0.75em 0 0.5em;
	}

	.logo {
		margin: 0;
		padding-top: 0.2em;
		color: var(--faint);
		line-height: 1.15;
	}

	.logo .fill {
		color: var(--green);
	}

	.info {
		flex: 1 1 36ch;
		min-width: 0;
	}

	.head {
		margin: 0;
		font-weight: 600;
	}

	.user,
	.host {
		color: var(--green);
	}

	.rule {
		margin: 0;
		color: var(--faint);
		overflow: hidden;
	}

	dl {
		margin: 0;
	}

	dl div {
		display: flex;
		gap: 1ch;
	}

	dt {
		flex-shrink: 0;
		color: var(--blue);
		font-weight: 600;
	}

	dt::after {
		content: ':';
		color: var(--fg);
	}

	dd {
		min-width: 0;
		margin: 0;
	}

	.swatches {
		display: flex;
		margin-top: 0.9em;
	}

	.swatches span {
		width: 3ch;
		height: 1.2em;
	}
</style>
