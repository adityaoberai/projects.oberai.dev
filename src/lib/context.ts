import { getContext, setContext } from 'svelte';

export type Shell = {
	// Types `command` at the prompt, then runs it.
	exec: (command: string) => void;
	// Slug of the project on screen, if any.
	current: () => string | undefined;
};

const key = Symbol('shell');

export const setShell = (shell: Shell) => setContext(key, shell);
export const getShell = () => getContext<Shell>(key);

// For links that also work without JavaScript: a plain click runs the command in place,
// while modified clicks (new tab, new window) keep the browser's behavior.
export function runOnClick(shell: Shell, command: string) {
	return (event: MouseEvent) => {
		if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
			return;
		event.preventDefault();
		shell.exec(command);
	};
}

export const external = { target: '_blank', rel: 'noopener' } as const;
