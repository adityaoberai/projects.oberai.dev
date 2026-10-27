<script lang="ts">
	import { flushSync, onMount, tick, untrack } from 'svelte';
	import { replaceState } from '$app/navigation';
	import Explorer from './Explorer.svelte';
	import Help from './Help.svelte';
	import Neofetch from './Neofetch.svelte';
	import ProjectList from './ProjectList.svelte';
	import ProjectView from './ProjectView.svelte';
	import Redirect from './Redirect.svelte';
	import Stack from './Stack.svelte';
	import { external, setShell } from '$lib/context';
	import { projects, site } from '$lib/data';
	import { complete, run, type Output, type Theme } from '$lib/shell';

	type Timing = { lineAt: number; typeAt: number; typeFor: number; revealAt: number };
	type Entry = { id: number; input: string; output: Output | null; boot?: Timing };

	// Commands typed out on load. Their output is prerendered, so the page reads fine without JavaScript.
	let { boot }: { boot: string[] } = $props();

	// The boot timeline plays in CSS (see app.css), so it starts before hydration
	// and is skipped entirely for reduced motion.
	const CHAR_MS = 55;
	const THINK_MS = 300;
	const OUTPUT_MS = 160;
	const NEXT_MS = 450;

	let at = 250;
	const initial: Entry[] = untrack(() => boot).map((input, id) => {
		const lineAt = at;
		const typeAt = lineAt + THINK_MS;
		const typeFor = input.length * CHAR_MS;
		const revealAt = typeAt + typeFor + OUTPUT_MS;
		at = revealAt + NEXT_MS;
		return { id, input, output: run(input).output, boot: { lineAt, typeAt, typeFor, revealAt } };
	});
	const readyAt = at - NEXT_MS + 250;

	const slugOf = (output?: Output | null) =>
		output?.kind === 'project' ? output.project.slug : undefined;

	// Raw state: outputs hold the project objects themselves, which components look up by identity.
	let entries = $state.raw<Entry[]>(initial);
	let history = $state.raw<string[]>(untrack(() => [...boot]));
	let current = $state(slugOf(initial.findLast((e) => e.output)?.output));
	let nextId = initial.length;

	let value = $state('');
	let caret = $state(0);
	let focused = $state(false);
	let overflowing = $state(false);
	let typing = $state(false);
	let ready = $state(false);
	let skipped = $state(false);
	let motd = $state(true);
	let suggestions = $state<string[]>([]);
	let announce = $state('');
	let time = $state('');
	let historyIndex = -1;
	let draft = '';
	let bootTimer: ReturnType<typeof setTimeout> | undefined;

	let input = $state<HTMLInputElement>();
	let prompt = $state<HTMLElement>();
	let screen = $state<HTMLElement>();

	const ghost = $derived(
		value && caret === value.length ? (complete(value)[0]?.slice(value.length) ?? '') : ''
	);
	const mode = $derived(typing ? 'typing' : ready ? 'ready' : 'boot');
	const project = $derived(projects.find((p) => p.slug === current));
	const title = $derived(
		project ? `${project.name} · ${site.host}` : `${site.host} · Developer projects by ${site.name}`
	);
	const description = $derived(project?.overview ?? site.description);
	const canonical = $derived(`${site.url}${project ? `/${project.slug}/` : '/'}`);
	const quick = ['help', 'ls', 'stack', 'portfolio'];

	setShell({ exec, current: () => current });

	const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
	const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
	const finePointer = () => matchMedia('(pointer: fine)').matches;
	const needsArgument = (command: string) => ['cat', 'grep', 'theme'].includes(command);

	function finishBoot() {
		if (ready) return;
		clearTimeout(bootTimer);
		skipped = true;
		ready = true;
	}

	// Types `command` at the prompt as if someone were at the keyboard, then runs it.
	async function exec(command: string) {
		if (typing) return;
		finishBoot();
		typing = true;
		suggestions = [];
		value = '';
		caret = 0;
		const instant = reducedMotion();
		prompt?.scrollIntoView({ block: 'nearest', behavior: instant ? 'auto' : 'smooth' });
		if (instant) value = command;
		else {
			await wait(180);
			for (const char of command) {
				value += char;
				caret = value.length;
				await wait(22 + Math.random() * 38);
			}
			await wait(180);
		}
		typing = false;
		await submit();
		if (finePointer()) input?.focus({ preventScroll: true });
	}

	async function submit(event?: SubmitEvent) {
		event?.preventDefault();
		if (typing) return;
		finishBoot();
		const command = value;
		value = '';
		caret = 0;
		suggestions = [];
		historyIndex = -1;
		const trimmed = command.trim();
		if (trimmed && history.at(-1) !== trimmed) history = [...history, trimmed];

		const result = run(command, history);
		announce = result.announce;
		if (result.effect?.type === 'clear') return clear();
		if (result.effect?.type === 'theme') setTheme(result.effect.value);

		const entry: Entry = { id: nextId++, input: command, output: result.output };
		entries = [...entries, entry];

		// Views that replace the screen's subject also move the URL, so it can be shared or reloaded.
		const { output } = result;
		if (output && output.kind !== 'lines' && output.kind !== 'redirect') {
			current = slugOf(output);
			const path = current ? `/${current}/` : '/';
			if (location.pathname !== path) replaceState(path, {});
		}

		await tick();
		const behavior = reducedMotion() ? 'auto' : 'smooth';
		const element = screen?.querySelector(`[data-entry="${entry.id}"]`);
		if (output && element) element.scrollIntoView({ block: 'start', behavior });
		else prompt?.scrollIntoView({ block: 'nearest', behavior });
	}

	function clear() {
		entries = [];
		motd = false;
		announce = 'Screen cleared.';
	}

	function setTheme(theme: Theme) {
		const root = document.documentElement;
		if (theme === 'auto') delete root.dataset.theme;
		else root.dataset.theme = theme;
		try {
			if (theme === 'auto') localStorage.removeItem('theme');
			else localStorage.setItem('theme', theme);
		} catch {
			// Storage can be unavailable; the theme still applies for this visit.
		}
	}

	function syncCaret() {
		if (!input) return;
		caret = input.selectionStart ?? value.length;
		overflowing = input.scrollWidth > input.clientWidth;
	}

	async function caretToEnd() {
		caret = value.length;
		await tick();
		input?.setSelectionRange(caret, caret);
		syncCaret();
	}

	function completeValue() {
		const options = complete(value);
		if (options.length === 1) {
			value = needsArgument(options[0]) ? `${options[0]} ` : options[0];
			suggestions = [];
		} else if (options.length > 1) {
			let prefix = options[0];
			for (const option of options) while (!option.startsWith(prefix)) prefix = prefix.slice(0, -1);
			if (prefix.length > value.length) value = prefix;
			else suggestions = options;
		}
		caretToEnd();
	}

	function walkHistory(step: number) {
		if (!history.length) return;
		if (historyIndex === -1) {
			if (step > 0) return;
			draft = value;
			historyIndex = history.length;
		}
		historyIndex = Math.min(history.length, Math.max(0, historyIndex + step));
		value = historyIndex === history.length ? draft : history[historyIndex];
		if (historyIndex === history.length) historyIndex = -1;
		caretToEnd();
	}

	function keydown(event: KeyboardEvent) {
		if (typing) return event.preventDefault();
		const key = event.key;
		const ctrl = event.ctrlKey && !event.metaKey && !event.altKey;
		if (key === 'Tab' && value && !event.shiftKey) {
			// An empty prompt lets Tab move focus as usual.
			event.preventDefault();
			completeValue();
		} else if ((key === 'ArrowRight' || key === 'End') && ghost) {
			event.preventDefault();
			value += ghost;
			caretToEnd();
		} else if (key === 'ArrowUp' || key === 'ArrowDown') {
			event.preventDefault();
			walkHistory(key === 'ArrowUp' ? -1 : 1);
		} else if (ctrl && key.toLowerCase() === 'l') {
			event.preventDefault();
			clear();
		} else if (ctrl && key.toLowerCase() === 'c' && input?.selectionStart === input?.selectionEnd) {
			event.preventDefault();
			entries = [...entries, { id: nextId++, input: `${value}^C`, output: null }];
			value = '';
			suggestions = [];
			caretToEnd();
		} else if (key === 'Escape') {
			value = '';
			suggestions = [];
			caretToEnd();
		}
	}

	onMount(() => {
		bootTimer = setTimeout(() => (ready = true), reducedMotion() ? 0 : readyAt);

		// Any key or tap skips the intro. Typing anywhere on the page lands in the prompt.
		const onKey = (event: KeyboardEvent) => {
			finishBoot();
			if (event.defaultPrevented || event.ctrlKey || event.metaKey || event.altKey || typing)
				return;
			if (event.key.length !== 1 || event.key === ' ') return;
			const target = event.target as HTMLElement;
			if (target === input || target.closest('input, textarea, select, [contenteditable]')) return;
			// Unhide the prompt now; a hidden input can't take focus, and the key would be lost.
			flushSync();
			input?.focus({ preventScroll: true });
			prompt?.scrollIntoView({ block: 'nearest' });
		};
		// Clicking empty space focuses the prompt, as in a real terminal. Touch screens are left
		// alone so reading doesn't keep opening the keyboard.
		const onClick = (event: MouseEvent) => {
			const target = event.target as HTMLElement;
			if (!finePointer() || target.closest('a, button, input, label')) return;
			if (getSelection()?.toString()) return;
			input?.focus({ preventScroll: true });
		};
		const updateTime = () =>
			(time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

		updateTime();
		const clock = setInterval(updateTime, 10_000);
		window.addEventListener('keydown', onKey);
		window.addEventListener('pointerdown', finishBoot, { once: true });
		screen?.addEventListener('click', onClick);
		return () => {
			clearTimeout(bootTimer);
			clearInterval(clock);
			window.removeEventListener('keydown', onKey);
			window.removeEventListener('pointerdown', finishBoot);
			screen?.removeEventListener('click', onClick);
		};
	});
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content={description} />
	<link rel="canonical" href={canonical} />
	<meta property="og:type" content="website" />
	<meta property="og:site_name" content={site.host} />
	<meta property="og:title" content={title} />
	<meta property="og:description" content={description} />
	<meta property="og:url" content={canonical} />
	<meta name="twitter:card" content="summary" />
</svelte:head>

{#snippet ps1()}
	<span class="ps1" aria-hidden="true"
		><span class="user">{site.user}@{site.hostname}</span><span class="sep">:</span><span
			class="cwd">~</span
		><span class="sep">$</span></span
	>
{/snippet}

<div class="window" class:skip={skipped}>
	<span class="mark tl" aria-hidden="true"></span>
	<span class="mark tr" aria-hidden="true"></span>
	<span class="mark bl" aria-hidden="true"></span>
	<span class="mark br" aria-hidden="true"></span>

	<header class="titlebar">
		<span class="dots" aria-hidden="true"><i></i><i></i><i></i></span>
		<p class="title">
			{site.user}@{site.hostname}: {project ? `~/projects/${project.slug}` : '~'}
			<span class="dim">— zsh</span>
		</p>
		<a class="home" href={site.home} {...external}
			>adityaoberai.com<span aria-hidden="true">{' ↗'}</span></a
		>
	</header>

	<main class="screen" bind:this={screen}>
		<h1 class="sr-only">{site.name}: developer projects</h1>

		{#if motd}
			<aside class="motd" aria-label="Message of the day">
				<span class="tag" aria-hidden="true">motd</span>
				<p>Looking for the portfolio? It lives at <a href={site.home}>adityaoberai.com</a>.</p>
				<p class="muted">
					This machine only runs the developer projects. Type
					<button type="button" onclick={() => exec('portfolio')}>portfolio</button> to head over.
				</p>
			</aside>
		{/if}

		{#each entries as entry (entry.id)}
			<div
				class="entry"
				class:boot={entry.boot}
				data-entry={entry.id}
				style={entry.boot &&
					`--line-at: ${entry.boot.lineAt}ms; --type-at: ${entry.boot.typeAt}ms; --type-for: ${entry.boot.typeFor}ms; --reveal-at: ${entry.boot.revealAt}ms; --chars: ${Math.max(entry.input.length, 1)}`}
			>
				<p class="cmdline">
					{@render ps1()}
					{#if entry.boot}
						<span class="typed"
							><span class="text">{entry.input}</span><span class="cursor" aria-hidden="true"
							></span></span
						>
					{:else}
						<span class="text">{entry.input}</span>
					{/if}
				</p>
				{#if entry.output}
					{@const output = entry.output}
					<div class="output">
						{#if output.kind === 'neofetch'}
							<Neofetch />
						{:else if output.kind === 'list'}
							<ProjectList items={output.items} query={output.query} />
						{:else if output.kind === 'project'}
							<ProjectView project={output.project} />
						{:else if output.kind === 'stack'}
							<Stack />
						{:else if output.kind === 'help'}
							<Help />
						{:else if output.kind === 'redirect'}
							<Redirect
								url={output.url}
								lines={output.lines}
								delay={entry.boot && !skipped ? entry.boot.revealAt : 0}
							/>
						{:else}
							{#each output.lines as line, i (i)}
								<p class="line {line.tone ?? ''}">
									{#if line.href}
										<a href={line.href} {...external}
											>{line.text}<span aria-hidden="true">{' ↗'}</span></a
										>
									{:else}
										{line.text}
									{/if}
								</p>
							{/each}
						{/if}
					</div>
				{/if}
			</div>
		{/each}

		<form
			class="cmdline prompt"
			class:booting={!skipped}
			style="--ready-at: {readyAt}ms"
			bind:this={prompt}
			onsubmit={submit}
		>
			<label for="command">{@render ps1()}<span class="sr-only">Command</span></label>
			<div class="field" class:focused class:typing class:overflowing>
				<input
					id="command"
					bind:this={input}
					bind:value
					onkeydown={keydown}
					oninput={() => {
						suggestions = [];
						syncCaret();
					}}
					onkeyup={syncCaret}
					onclick={syncCaret}
					onselect={syncCaret}
					onfocus={() => (focused = true)}
					onblur={() => (focused = false)}
					readonly={typing}
					autocomplete="off"
					autocapitalize="off"
					spellcheck="false"
					enterkeyhint="go"
					maxlength="120"
				/>
				{#if ghost}
					<span class="ghost" style="left: {value.length}ch" aria-hidden="true">{ghost}</span>
				{/if}
				<span class="cursor" style="left: {caret}ch" aria-hidden="true"></span>
			</div>
		</form>

		{#if suggestions.length}
			<ul class="suggestions" aria-label="Completions">
				{#each suggestions as suggestion (suggestion)}
					<li>
						<button type="button" onclick={() => exec(suggestion)}
							>{suggestion.split(' ').at(-1)}</button
						>
					</li>
				{/each}
			</ul>
		{/if}

		<p class="sr-only" role="status">{announce}</p>
	</main>

	<Explorer />

	<footer class="statusbar">
		<span class="seg brand">{site.host}</span>
		<span class="seg window-name">0:zsh*</span>
		<span class="seg mode {mode}">{mode}</span>
		<nav class="quick" aria-label="Quick commands">
			{#each quick as command (command)}
				<button type="button" onclick={() => exec(command)}>{command}</button>
			{/each}
		</nav>
		<span class="seg count">{projects.length} projects</span>
		<span class="seg time">{time}</span>
	</footer>
</div>

<style>
	.window {
		position: relative;
		display: grid;
		grid-template-columns: minmax(0, 1fr) 17.5rem;
		grid-template-rows: auto 1fr auto;
		width: calc(100% - 2 * var(--gutter));
		max-width: 1280px;
		min-height: calc(100dvh - 2 * var(--gutter));
		margin: var(--gutter) auto;
		background: var(--bg);
		border: 1px solid var(--line-strong);
	}

	/* Registration marks at the window's corners. */
	.mark {
		position: absolute;
		width: 13px;
		height: 13px;
		pointer-events: none;
		background:
			linear-gradient(var(--muted), var(--muted)) center / 100% 1px no-repeat,
			linear-gradient(var(--muted), var(--muted)) center / 1px 100% no-repeat;
	}

	.tl {
		top: -7px;
		left: -7px;
	}

	.tr {
		top: -7px;
		right: -7px;
	}

	.bl {
		bottom: -7px;
		left: -7px;
	}

	.br {
		right: -7px;
		bottom: -7px;
	}

	/* Title bar */
	.titlebar {
		position: sticky;
		top: 0;
		z-index: 3;
		grid-column: 1 / -1;
		display: grid;
		grid-template-columns: 1fr auto 1fr;
		align-items: center;
		gap: 2ch;
		height: var(--bar-h);
		padding: 0 1.5ch;
		background: var(--bg);
		border-bottom: 1px solid var(--line-strong);
	}

	.dots {
		display: flex;
		gap: 0.8ch;
	}

	.dots i {
		width: 0.85em;
		height: 0.85em;
		border: 1px solid var(--red);
		border-radius: 50%;
	}

	.dots i:nth-child(2) {
		border-color: var(--yellow);
	}

	.dots i:nth-child(3) {
		border-color: var(--green);
	}

	.title {
		margin: 0;
		overflow: hidden;
		color: var(--muted);
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.dim {
		color: var(--faint);
	}

	.home {
		justify-self: end;
		color: var(--cyan);
		white-space: nowrap;
	}

	/* Screen */
	.screen {
		grid-column: 1;
		min-width: 0;
		padding: 1.5rem 3ch 2.5rem;
	}

	.motd {
		position: relative;
		margin: 0.5rem 0 1.75rem;
		padding: 0.9em 2ch 0.8em;
		border: 1px dashed var(--yellow);
	}

	.motd .tag {
		position: absolute;
		top: 0;
		left: 1.5ch;
		padding: 0 1ch;
		color: var(--yellow);
		line-height: 1.2;
		background: var(--bg);
		transform: translateY(-50%);
	}

	.motd p {
		margin: 0;
	}

	.motd a {
		color: var(--yellow);
		font-weight: 600;
	}

	.motd button {
		color: var(--green);
		text-decoration: underline;
		text-underline-offset: 0.2em;
	}

	.muted {
		color: var(--muted);
	}

	.entry {
		margin-bottom: 1.1rem;
		scroll-margin-top: calc(var(--bar-h) + 1rem);
	}

	.cmdline {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		column-gap: 1ch;
		margin: 0;
	}

	.ps1 {
		white-space: nowrap;
	}

	.ps1 .user {
		color: var(--green);
		font-weight: 600;
	}

	.ps1 .sep {
		color: var(--muted);
	}

	.ps1 .cwd {
		color: var(--blue);
		font-weight: 600;
	}

	.cmdline .text {
		white-space: pre;
	}

	.output {
		margin-top: 0.3rem;
	}

	.line {
		margin: 0;
		white-space: pre-wrap;
		overflow-wrap: anywhere;
	}

	.line.muted {
		color: var(--muted);
	}

	.line.error {
		color: var(--red);
	}

	.line.ok {
		color: var(--green);
	}

	.line a {
		color: var(--cyan);
	}

	/* Prompt */
	.prompt {
		margin: 0 -1ch;
		padding: 0.1em 1ch;
		scroll-margin-bottom: calc(var(--bar-h) + 1rem);
	}

	.prompt:focus-within {
		background: var(--hover);
	}

	.prompt.booting {
		animation: appear 0s var(--ready-at) both;
	}

	:global(html:not(.js)) .prompt {
		display: none;
	}

	.prompt label {
		cursor: text;
	}

	.field {
		position: relative;
		flex: 1 1 24ch;
		min-width: min(24ch, 100%);
	}

	.field input {
		display: block;
		width: 100%;
		height: 1.6em;
		padding: 0;
		color: var(--fg);
		font: inherit;
		line-height: inherit;
		background: none;
		border: 0;
		outline: none;
		caret-color: transparent;
	}

	.ghost {
		position: absolute;
		top: 0;
		color: var(--faint);
		white-space: pre;
		pointer-events: none;
	}

	.cursor {
		position: absolute;
		top: 0.2em;
		width: 1ch;
		height: 1.2em;
		pointer-events: none;
		border: 1px solid var(--green);
	}

	.focused .cursor,
	.typing .cursor {
		background: var(--green);
	}

	.focused:not(.typing) .cursor {
		animation: blink 1.1s steps(1) infinite;
	}

	.overflowing input {
		caret-color: var(--green);
	}

	.overflowing .cursor,
	.overflowing .ghost {
		display: none;
	}

	.suggestions {
		display: flex;
		flex-wrap: wrap;
		gap: 0.2em 2.5ch;
		margin: 0.2rem 0 0;
		padding: 0;
		list-style: none;
	}

	.suggestions button {
		color: var(--blue);
	}

	.suggestions button:hover {
		text-decoration: underline;
		text-underline-offset: 0.2em;
	}

	/* Status bar, after tmux */
	.statusbar {
		position: sticky;
		bottom: 0;
		z-index: 3;
		grid-column: 1 / -1;
		display: flex;
		height: 2.1rem;
		font-size: 0.9em;
		background: var(--bg);
		border-top: 1px solid var(--line-strong);
	}

	.seg {
		display: flex;
		align-items: center;
		padding: 0 1.5ch;
		white-space: nowrap;
		border-right: 1px solid var(--line-strong);
	}

	.brand {
		color: var(--bg);
		font-weight: 600;
		background: var(--green);
		border-color: var(--green);
	}

	.window-name {
		color: var(--muted);
	}

	.mode {
		min-width: 9ch;
		justify-content: center;
		letter-spacing: 0.08em;
		text-transform: uppercase;
	}

	.mode.boot {
		color: var(--magenta);
	}

	.mode.typing {
		color: var(--yellow);
	}

	.mode.ready {
		color: var(--green);
	}

	.quick {
		display: flex;
		flex: 1;
		min-width: 0;
		overflow-x: auto;
		scrollbar-width: none;
	}

	.quick button {
		padding: 0 1.5ch;
		color: var(--muted);
		white-space: nowrap;
		border-right: 1px solid var(--line);
	}

	.quick button:hover {
		color: var(--fg);
		background: var(--hover);
	}

	.count,
	.time {
		color: var(--muted);
		border-right: 0;
		border-left: 1px solid var(--line-strong);
	}

	.time:empty {
		display: none;
	}

	@media (max-width: 960px) {
		.window {
			grid-template-columns: minmax(0, 1fr);
		}

		.window :global(aside[aria-label='Explorer']) {
			display: none;
		}
	}

	@media (max-width: 640px) {
		.titlebar {
			grid-template-columns: auto 1fr;
		}

		.title {
			display: none;
		}

		.screen {
			padding: 1.25rem 2ch 2rem;
		}

		.window-name,
		.count {
			display: none;
		}
	}

	/* Phones zoom into inputs under 16px. */
	@media (pointer: coarse) {
		.field {
			font-size: max(16px, 1em);
		}
	}

	@keyframes blink {
		50% {
			opacity: 0;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.prompt.booting,
		.focused:not(.typing) .cursor {
			animation: none;
		}
	}
</style>
