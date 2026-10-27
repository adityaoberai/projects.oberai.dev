<script lang="ts">
	import type { Snippet } from 'svelte';

	let { title, meta, children }: { title: string; meta?: string; children: Snippet } = $props();
</script>

<!-- A TUI box: the title and meta sit in the top border, like ┌─ title ──── meta ─┐ -->
<section class="panel">
	<div class="legend">
		<span class="title">{title}</span>
		{#if meta}<span class="meta">{meta}</span>{/if}
	</div>
	{@render children()}
</section>

<style>
	.panel {
		position: relative;
		margin: 1.1em 0 0.5em;
		padding: 1.25em 2ch 1em;
		border: 1px solid var(--line-strong);
	}

	.legend {
		position: absolute;
		top: 0;
		left: 1.5ch;
		right: 1.5ch;
		display: flex;
		justify-content: space-between;
		gap: 2ch;
		line-height: 1.2;
		transform: translateY(-50%);
	}

	.legend span {
		min-width: 0;
		padding: 0 1ch;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		background: var(--bg);
	}

	.title {
		color: var(--fg);
	}

	.meta {
		flex-shrink: 0;
		color: var(--muted);
	}
</style>
