import { projects, site, stack, type Project } from './data';

export type Tone = 'muted' | 'error' | 'ok' | 'accent';
export type Line = { text: string; tone?: Tone; href?: string };

export type Output =
	| { kind: 'neofetch' }
	| { kind: 'list'; items: Project[]; query?: string }
	| { kind: 'project'; project: Project }
	| { kind: 'stack' }
	| { kind: 'help' }
	| { kind: 'redirect'; url: string; lines?: Line[] }
	| { kind: 'lines'; lines: Line[] };

export type Effect = { type: 'clear' } | { type: 'theme'; value: Theme };
export type Theme = 'light' | 'dark' | 'auto';

export type Result = {
	output: Output | null;
	effect?: Effect;
	// Short sentence for the screen reader status region.
	announce: string;
};

// `example` is what clicking the command in `help` types.
export const commands = [
	{ name: 'help', usage: 'help', summary: 'List these commands', example: 'help' },
	{ name: 'ls', usage: 'ls', summary: 'List every project', example: 'ls' },
	{
		name: 'cat',
		usage: 'cat <project>',
		summary: 'Open a project by name or number',
		example: 'cat relief-atl'
	},
	{
		name: 'grep',
		usage: 'grep <term>',
		summary: 'Find projects by name, idea, or technology',
		example: 'grep appwrite'
	},
	{ name: 'stack', usage: 'stack', summary: 'Show the technologies behind them', example: 'stack' },
	{
		name: 'portfolio',
		usage: 'portfolio',
		summary: 'Go to adityaoberai.com, my main site',
		example: 'portfolio'
	},
	{
		name: 'neofetch',
		usage: 'neofetch',
		summary: 'Show who runs this machine',
		example: 'neofetch'
	},
	{ name: 'theme', usage: 'theme <light|dark|auto>', summary: 'Switch colors', example: 'theme' },
	{ name: 'history', usage: 'history', summary: 'Show what you have run', example: 'history' },
	{ name: 'clear', usage: 'clear', summary: 'Clear the screen (Ctrl+L)', example: 'clear' }
] as const;

const themes: Theme[] = ['light', 'dark', 'auto'];

const text = (...lines: (string | Line)[]): Output => ({
	kind: 'lines',
	lines: lines.map((l) => (typeof l === 'string' ? { text: l } : l))
});

const fail = (message: string, hint?: string): Result => ({
	output: text(
		{ text: message, tone: 'error' },
		...(hint ? [{ text: hint, tone: 'muted' as const }] : [])
	),
	announce: message
});

// Accepts `relief-atl`, `relief-atl/`, `projects/relief-atl`, `README.md` paths, numbers, and names.
export function findProject(arg: string): Project | undefined {
	const key = arg
		.trim()
		.toLowerCase()
		.replace(/^(\.\/|~\/)?(projects\/)?/, '')
		.replace(/\/(readme\.md)?$/, '');
	const n = Number(key);
	if (Number.isInteger(n) && n >= 1 && n <= projects.length) return projects[n - 1];
	return (
		projects.find((p) => p.slug === key || p.name.toLowerCase() === key) ??
		single(projects.filter((p) => p.slug.startsWith(key)))
	);
}

// Only ever forward to the portfolio's own origin, whatever path was asked for.
export function portfolioUrl(path = '') {
	const home = new URL(site.home);
	try {
		const url = new URL(path, home);
		if (url.origin === home.origin) return url.href.replace(/\/$/, '');
	} catch {
		// Fall through to the home page.
	}
	return site.home;
}

const redirect = (url: string, lines?: Line[]): Result => ({
	output: { kind: 'redirect', url, lines },
	announce: `Redirecting to ${url} in a few seconds. Press any key to stay.`
});

const single = <T>(items: T[]) => (items.length === 1 ? items[0] : undefined);

export function matches(p: Project, query: string) {
	const q = query.toLowerCase();
	return [p.slug, p.name, p.kind, p.overview, ...p.technologies].some((s) =>
		s.toLowerCase().includes(q)
	);
}

export function run(raw: string, history: string[] = []): Result {
	const input = raw.trim();
	if (!input) return { output: null, announce: '' };
	const [cmd, ...rest] = input.split(/\s+/);
	const arg = rest.join(' ').replace(/^["']|["']$/g, '');

	switch (cmd.toLowerCase()) {
		case 'help':
		case 'man':
		case '?':
			return { output: { kind: 'help' }, announce: 'Listed the available commands.' };

		case 'ls':
		case 'll':
		case 'dir':
			return {
				output: { kind: 'list', items: projects },
				announce: `Listed ${projects.length} projects.`
			};

		case 'cat':
		case 'open':
		case 'less': {
			if (!arg) return fail(`${cmd}: missing project`, 'Try cat relief-atl, or cat 1.');
			const project = findProject(arg);
			if (!project) return fail(`${cmd}: ${arg}: No such project`, 'Run ls to see them all.');
			return { output: { kind: 'project', project }, announce: `Opened ${project.name}.` };
		}

		case 'grep':
		case 'find': {
			if (!arg) return fail(`${cmd}: missing search term`, 'Try grep appwrite.');
			const items = projects.filter((p) => matches(p, arg));
			if (!items.length)
				return fail(`${cmd}: nothing matches "${arg}"`, 'Run stack to see what is in use.');
			return {
				output: { kind: 'list', items, query: arg },
				announce: `${items.length} ${items.length === 1 ? 'project matches' : 'projects match'} ${arg}.`
			};
		}

		case 'stack':
			return { output: { kind: 'stack' }, announce: `Listed ${stack.length} technologies.` };

		case 'neofetch':
		case 'fastfetch':
			return { output: { kind: 'neofetch' }, announce: 'Showed system information.' };

		case 'theme': {
			const value = arg.toLowerCase() as Theme;
			if (!themes.includes(value))
				return {
					output: text('usage: theme <light|dark|auto>', {
						text: 'auto follows your system setting.',
						tone: 'muted'
					}),
					announce: 'Theme usage shown.'
				};
			return {
				output: text({ text: `theme set to ${value}`, tone: 'ok' }),
				effect: { type: 'theme', value },
				announce: `Theme set to ${value}.`
			};
		}

		case 'history':
			return {
				output: text(...history.map((h, i) => ({ text: `${String(i + 1).padStart(4)}  ${h}` }))),
				announce: `${history.length} commands in history.`
			};

		case 'clear':
		case 'cls':
			return { output: null, effect: { type: 'clear' }, announce: 'Screen cleared.' };

		case 'whoami':
			return { output: text(site.user), announce: site.user };

		case 'pwd':
			return { output: text(`/home/${site.user}`), announce: `/home/${site.user}` };

		case 'cd':
			if (!arg || ['~', '/', '.', '..', 'projects', '~/projects'].includes(arg))
				return { output: null, announce: '' };
			return fail(`cd: no such file or directory: ${arg}`);

		case 'echo':
			return { output: text(arg), announce: arg };

		case 'date':
			return { output: text(new Date().toString()), announce: new Date().toString() };

		case 'sudo':
			return fail(`${site.user} is not in the sudoers file. This incident will be reported.`);

		case 'portfolio':
		case 'home':
		case 'www':
			return redirect(portfolioUrl(arg.startsWith('/') ? arg : ''));

		case 'exit':
		case 'logout':
			return redirect(site.home, [
				{ text: 'logout' },
				{ text: `Connection to ${site.host} closed.`, tone: 'muted' }
			]);

		default:
			return fail(`zsh: command not found: ${cmd}`, 'Type help to see what this terminal can do.');
	}
}

// Candidates for Tab and the inline suggestion, given everything typed so far.
export function complete(value: string): string[] {
	const lower = value.toLowerCase();
	const space = lower.indexOf(' ');
	if (space === -1) {
		return commands.map((c) => c.name).filter((c) => c.startsWith(lower) && c !== lower);
	}
	const cmd = lower.slice(0, space);
	const arg = lower.slice(space + 1);
	const pool =
		cmd === 'cat' || cmd === 'open'
			? projects.map((p) => p.slug)
			: cmd === 'grep'
				? stack.map((t) => t.name.toLowerCase())
				: cmd === 'theme'
					? themes
					: [];
	return pool.filter((p) => p.startsWith(arg) && p !== arg).map((p) => `${cmd} ${p}`);
}
