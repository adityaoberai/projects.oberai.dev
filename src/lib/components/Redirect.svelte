<script lang="ts">
	import { onMount } from 'svelte';
	import type { Line } from '$lib/shell';

	// `delay` holds the countdown until a boot entry's output is on screen.
	let { url, lines = [], delay = 0 }: { url: string; lines?: Line[]; delay?: number } = $props();

	const SECONDS = 5;
	const WIDTH = 20;
	let left = $state(SECONDS);
	let status = $state<'waiting' | 'counting' | 'stayed' | 'leaving'>('waiting');
	const label = $derived(url.replace(/^https?:\/\//, ''));
	const filled = $derived(Math.round(((SECONDS - left) / SECONDS) * WIDTH));

	let timers: ReturnType<typeof setTimeout>[] = [];

	function stay() {
		if (status === 'leaving') return;
		timers.forEach(clearTimeout);
		status = 'stayed';
	}

	onMount(() => {
		const start = setTimeout(() => {
			status = 'counting';
			const tick = () => {
				left -= 1;
				if (left > 0) timers.push(setTimeout(tick, 1000));
				else {
					status = 'leaving';
					location.href = url;
				}
			};
			timers.push(setTimeout(tick, 1000));
		}, delay);
		timers.push(start);
		// Any key keeps you here, including the ones that skip the intro.
		window.addEventListener('keydown', stay, { once: true });
		return () => {
			timers.forEach(clearTimeout);
			window.removeEventListener('keydown', stay);
		};
	});
</script>

<div class="redirect">
	{#each lines as line, i (i)}
		<p class={line.tone}>{line.text}</p>
	{/each}
	<p>
		<span class="arrow" aria-hidden="true">→</span>
		<a href={url}>{label}</a>
	</p>
	{#if status === 'stayed'}
		<p class="muted">Staying put. The link above works whenever you are ready.</p>
	{:else}
		<p class="progress">
			<span aria-hidden="true"
				>[<span class="done">{'█'.repeat(filled)}</span><span class="todo"
					>{'░'.repeat(WIDTH - filled)}</span
				>]</span
			>
			{#if status === 'leaving'}
				redirecting…
			{:else}
				redirecting in {left}s · press any key or
				<button type="button" onclick={stay}>stay here</button>
			{/if}
		</p>
	{/if}
</div>

<style>
	.redirect p {
		margin: 0;
	}

	.arrow {
		color: var(--faint);
	}

	a {
		color: var(--cyan);
	}

	.muted {
		color: var(--muted);
	}

	.progress {
		color: var(--muted);
	}

	.done {
		color: var(--green);
	}

	.todo {
		color: var(--line-strong);
	}

	button {
		color: var(--fg);
		text-decoration: underline;
		text-underline-offset: 0.2em;
	}
</style>
