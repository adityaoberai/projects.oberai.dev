<script lang="ts">
	import Panel from './Panel.svelte';
	import { getShell } from '$lib/context';
	import { commands } from '$lib/shell';

	const shell = getShell();
</script>

<Panel title="help" meta="{commands.length} commands">
	<ul>
		{#each commands as command, i (command.name)}
			<li data-stagger style="--i: {i}">
				<button type="button" onclick={() => shell.exec(command.example)}>
					<span class="usage">{command.usage}</span>
					<span class="summary">{command.summary}</span>
				</button>
			</li>
		{/each}
	</ul>
	<p class="tips" data-stagger style="--i: {commands.length}">
		<kbd>Tab</kbd> completes · <kbd>↑</kbd> <kbd>↓</kbd> walk history · <kbd>Ctrl</kbd>+<kbd>L</kbd>
		clears · anything you click gets typed for you
	</p>
</Panel>

<style>
	ul {
		margin: 0;
		padding: 0;
		list-style: none;
	}

	li + li {
		border-top: 1px dashed var(--line);
	}

	button {
		display: grid;
		grid-template-columns: 26ch minmax(0, 1fr);
		gap: 2ch;
		width: 100%;
		padding: 0.3em 1ch;
		margin: 0 -1ch;
		text-align: left;
	}

	button:hover {
		background: var(--hover);
	}

	.usage {
		color: var(--green);
	}

	.summary {
		color: var(--muted);
	}

	.tips {
		margin: 1em 0 0;
		color: var(--muted);
	}

	kbd {
		padding: 0 0.6ch;
		color: var(--fg);
		font: inherit;
		border: 1px solid var(--line-strong);
	}

	@media (max-width: 640px) {
		button {
			grid-template-columns: minmax(0, 1fr);
			gap: 0;
		}
	}
</style>
