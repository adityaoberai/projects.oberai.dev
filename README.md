# projects.oberai.dev

Aditya Oberai's developer projects, browsed from a terminal. Live at [projects.oberai.dev](https://projects.oberai.dev). The portfolio lives at [adityaoberai.com](https://adityaoberai.com).

On load, a visitor "types" `neofetch` and `ls`, and the projects appear as terminal output. From there you can type commands or click anything; a click types its command at the prompt and runs it.

## Commands

| Command                   | What it does                                         |
| ------------------------- | ---------------------------------------------------- |
| `help`                    | List the commands                                    |
| `ls`                      | List every project                                   |
| `cat <project>`           | Open a project by slug, name, or number (`cat 1`)    |
| `grep <term>`             | Find projects by name, description, or technology    |
| `stack`                   | Show every technology with how many projects use it  |
| `portfolio`               | Count down, then go to adityaoberai.com (`exit` too) |
| `neofetch`                | Show who runs the machine                            |
| `theme <light/dark/auto>` | Switch colors; the choice is saved in `localStorage` |
| `history`, `clear`        | What you'd expect. `Ctrl+L` clears, `Ctrl+C` cancels |

`Tab` completes commands and project slugs, `→` accepts the grey suggestion, and `↑`/`↓` walk history. Typing anywhere on the page goes to the prompt.

## Stack

- SvelteKit 2, Svelte 5, TypeScript
- `@sveltejs/adapter-static`: every page is prerendered, and `404.html` is the fallback
- Geist Mono, self-hosted through Fontsource
- No other runtime dependencies

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:5173.

| Command           | What it does                        |
| ----------------- | ----------------------------------- |
| `npm run dev`     | Start the development server        |
| `npm run build`   | Build the static site into `build/` |
| `npm run preview` | Serve the production build          |
| `npm run check`   | Type-check with svelte-check        |
| `npm run lint`    | Check formatting with Prettier      |
| `npm run format`  | Format everything with Prettier     |

## How it works

- `src/lib/data.ts` holds the projects, newest first. Entries marked `portfolio: true` are copied from the portfolio's `src/lib/data/projects.ts`, so keep them in step; the rest are only listed here. `kind` (hackathon, demo, reference, and so on) and `year` are this site's own fields, and `outcome` is optional.
- `src/lib/shell.ts` parses commands and returns what to show. It has no DOM code, so the server prerenders the boot output with the same function the prompt uses.
- `src/lib/components/Terminal.svelte` is the window: title bar, screen, prompt, explorer pane, and status bar. Each output type has its own component next to it.
- The boot typing plays in CSS (`src/app.css`), timed with custom properties that Terminal sets on each boot entry. It starts before JavaScript loads, any key or tap skips it, and reduced motion shows the final state immediately. Without JavaScript the content is all there and the prompt is hidden.

### Routes

| Path          | Boots into                                             |
| ------------- | ------------------------------------------------------ |
| `/`           | `neofetch`, then `ls`                                  |
| `/<project>/` | `cat <project>`, one prerendered page per project      |
| anything else | `+error.svelte`, rendered from the `404.html` fallback |

Running `cat` updates the URL, so a project view can be shared or reloaded.

### Old portfolio links

oberai.dev used to host the portfolio. If that domain is also attached to this site, its old links land here, and the 404 page handles them:

- If the first path segment is one the portfolio serves (listed in `portfolioPaths` in `src/lib/data.ts`), it runs `portfolio <path>` and forwards to the same path on adityaoberai.com after five seconds. Any key cancels.
- `/projects` and `/projects/<slug>` open here.
- Anything else prints `cd: no such file or directory` and lists the projects.

The forward only ever targets adityaoberai.com, whatever the path. Add a segment to `portfolioPaths` when the portfolio gains a top-level page.

## Deployment

Built for Appwrite Sites as a static site on `projects.oberai.dev`:

- Framework: SvelteKit, with **Static site** enabled
- Install command: `npm install`
- Build command: `npm run build`
- Output directory: `./build`
- Fallback file: `404.html`, so unknown paths reach the 404 page and old portfolio links forward

Appwrite's domain-level redirects drop the path. To keep old oberai.dev deep links working, attach oberai.dev to this site as well, rather than redirecting the whole domain to adityaoberai.com.
