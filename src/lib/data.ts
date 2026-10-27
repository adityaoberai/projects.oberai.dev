// Projects marked `portfolio` are copied from the portfolio repository
// (src/lib/data/projects.ts); keep them in step. The rest are only listed here.
// `kind` is this site's own label, and `year` is when the project started.

export const site = {
	name: 'Aditya Oberai',
	host: 'projects.oberai.dev',
	// What the prompt shows, like `hostname -s`.
	hostname: 'projects',
	url: 'https://projects.oberai.dev',
	user: 'guest',
	role: 'Developer Relations Lead at Appwrite',
	tagline: 'Hackathon builds, demo apps, and small tools.',
	description:
		'Developer projects by Aditya Oberai: hackathon builds, demo apps, and small tools, browsable from a terminal.',
	home: 'https://adityaoberai.com',
	github: 'https://github.com/adityaoberai',
	email: 'aditya@oberai.dev'
};

// Top-level paths the portfolio serves. A link to one of these that reaches this site, such
// as an old oberai.dev link when that domain also points here, forwards to the same path on
// adityaoberai.com (see src/routes/+error.svelte).
export const portfolioPaths = [
	'about',
	'aditya.jpg',
	'collection',
	'community',
	'contact',
	'index',
	'meet',
	'now',
	'photography',
	'pic',
	'resume',
	'resume.docx',
	'resume.pdf',
	'speaking',
	'work',
	'world',
	'writing'
];

export type Project = {
	slug: string;
	name: string;
	kind:
		| 'hackathon'
		| 'competition'
		| 'challenge'
		| 'demo'
		| 'reference'
		| 'experiment'
		| 'tool'
		| 'community'
		| 'fun';
	year: number;
	overview: string;
	motivation: string;
	technologies: string[];
	outcome?: string;
	links: { label: string; href: string }[];
	featured?: boolean;
	portfolio?: boolean;
};

// Newest first.
export const projects: Project[] = [
	{
		slug: 'formwrite',
		name: 'Formwrite',
		kind: 'reference',
		year: 2026,
		overview:
			'Multitenant forms built entirely on Appwrite: each team gets a workspace, builds forms from thirteen question types, shares them by link or embed, and triages the responses.',
		motivation:
			"An exploration of multitenancy on Appwrite. Every workspace is an Appwrite Team with its own collections and storage bucket, so Appwrite's permission engine keeps tenants apart, not application code.",
		technologies: [
			'SvelteKit',
			'Tailwind CSS',
			'Appwrite Auth',
			'Appwrite Teams',
			'Appwrite DocumentsDB',
			'Appwrite Storage',
			'Appwrite Sites'
		],
		links: [
			{ label: 'Live', href: 'https://formwrite.appwrite.network' },
			{ label: 'GitHub', href: 'https://github.com/adityaoberai/formwrite' }
		]
	},
	{
		slug: 'relief-atl',
		name: 'Relief ATL',
		kind: 'hackathon',
		year: 2026,
		overview:
			'A map of public restrooms in Atlanta that ranks nearby options by an Access Confidence Score, so you find one you can actually use rather than one that is merely close.',
		motivation:
			'A Georgia State University audit found that 55% of 262 potential public restrooms in Atlanta failed basic access checks. Relief ATL turns that static research into a live tool that anyone can update, with no account required.',
		technologies: [
			'SvelteKit',
			'TypeScript',
			'MapLibre GL JS',
			'PostgreSQL',
			'TimescaleDB',
			'DigitalOcean App Platform'
		],
		outcome: 'Winner of Best Use of DigitalOcean at Hack RenderATL 2026.',
		links: [
			{ label: 'Devpost', href: 'https://devpost.com/software/relief-atl' },
			{ label: 'GitHub', href: 'https://github.com/adityaoberai/hack-renderatl' }
		],
		featured: true,
		portfolio: true
	},
	{
		slug: 'developer-wrapped',
		name: 'Developer Wrapped',
		kind: 'demo',
		year: 2026,
		overview:
			'A mobile-first GitHub Wrapped: sign in with GitHub and your last 12 months of contributions, streaks, and languages become an uncomfortably accurate story you can choose to publish.',
		motivation:
			'Built end to end on Appwrite with privacy as the constraint: GitHub tokens never leave the server, only aggregate numbers are stored, and a background function syncs on every sign-in without slowing it down.',
		technologies: [
			'SvelteKit',
			'TypeScript',
			'Appwrite Auth',
			'Appwrite TablesDB',
			'Appwrite Realtime',
			'Appwrite Functions',
			'Appwrite Sites',
			'GitHub OAuth'
		],
		links: [
			{ label: 'Live', href: 'https://developer-wrapped.appwrite.network' },
			{ label: 'GitHub', href: 'https://github.com/adityaoberai/developer-wrapped' }
		]
	},
	{
		slug: 'the-writers-room',
		name: "The Writers' Room BLR",
		kind: 'community',
		year: 2026,
		overview:
			'The website for a Bengaluru writing community: writers find the next meetup, sign in with an email code, build a profile, submit their writing, and earn seals for taking part.',
		motivation:
			'Runs the whole community from one place: members get a directory and public profiles, and admins manage members, submissions, rewards, events, and site content from a dashboard.',
		technologies: [
			'SvelteKit',
			'Appwrite Auth',
			'Appwrite TablesDB',
			'Appwrite Storage',
			'Appwrite Messaging',
			'Resend',
			'Appwrite Sites'
		],
		links: [
			{ label: 'Live', href: 'https://thewritersroom.club' },
			{ label: 'GitHub', href: 'https://github.com/adityaoberai/the-writers-room-blr' }
		]
	},
	{
		slug: 'write-my-app',
		name: 'Write My App',
		kind: 'tool',
		year: 2026,
		overview:
			'Turns a one-sentence app idea into a complete, build-ready spec: target users, prioritised features, user stories, design, data model, API, and tech stack.',
		motivation:
			'The spec also exports as a build brief for coding agents like Claude Code, Codex, or Cursor, with features in priority order and an explicit build sequence. Keep chatting to refine it.',
		technologies: ['SvelteKit', 'OpenAI'],
		links: [
			{ label: 'Live', href: 'https://writemyapp.com' },
			{ label: 'GitHub', href: 'https://github.com/adityaoberai/write-my-app' }
		]
	},
	{
		slug: 'qr-code-generator',
		name: 'QR Code Generator',
		kind: 'tool',
		year: 2025,
		overview:
			'Generates QR codes for URLs, text, or any other content, with adjustable size and margin, and downloads them as PNGs.',
		motivation:
			'A small tool on the Appwrite Avatars API, which renders the QR code on the server, so the app needs no QR library of its own.',
		technologies: ['SvelteKit', 'Appwrite Avatars'],
		links: [
			{ label: 'Live', href: 'https://qrcode.oberai.dev' },
			{ label: 'GitHub', href: 'https://github.com/adityaoberai/qr-code-generator' }
		]
	},
	{
		slug: 'personal-crm',
		name: 'Personal CRM',
		kind: 'reference',
		year: 2025,
		overview:
			'A personal contact management platform for keeping track of the people you meet and the conversations worth following up on.',
		motivation:
			"Built to demonstrate Appwrite's bulk database actions on a realistically messy dataset.",
		technologies: ['Appwrite Databases', 'SvelteKit'],
		outcome:
			'A reference implementation for bulk create, update, and delete operations in Appwrite.',
		links: [{ label: 'GitHub', href: 'https://github.com/appwrite-community/personal-crm' }],
		portfolio: true
	},
	{
		slug: 'offline-journal',
		name: 'Offline Journal',
		kind: 'reference',
		year: 2025,
		overview:
			'A journal app that works entirely offline and syncs when a connection returns, so an entry is never lost to a bad network.',
		motivation:
			"Built to demonstrate RxDB's Appwrite Databases integration and what local-first data replication looks like in practice.",
		technologies: ['RxDB', 'Appwrite Databases', 'JavaScript'],
		outcome: 'A working local-first reference app for offline data replication with Appwrite.',
		links: [{ label: 'GitHub', href: 'https://github.com/appwrite-community/offline-journal' }],
		featured: true,
		portfolio: true
	},
	{
		slug: 'valentine-sonnet',
		name: "Valentine's Day Sonnet Generator",
		kind: 'fun',
		year: 2025,
		overview:
			"Writes a personalised love sonnet with AI, then schedules it to arrive by email on Valentine's Day or shares it through a unique link.",
		motivation:
			"Began in 2024 as an Appwrite Function that wrote a sonnet around your partner's name with GPT-4. The 2025 version turned it into a site with scheduled delivery.",
		technologies: [
			'SvelteKit',
			'Appwrite Functions',
			'Appwrite Databases',
			'OpenAI',
			'Resend',
			'Pink Design'
		],
		links: [
			{ label: 'Live', href: 'https://lovesonnet.online' },
			{ label: 'GitHub', href: 'https://github.com/adityaoberai/valentine-sonnet' },
			{
				label: '2024 function',
				href: 'https://github.com/adityaoberai/valentines-day-sonnet-generator'
			}
		]
	},
	{
		slug: 'url-shortener',
		name: 'URL Shortener',
		kind: 'experiment',
		year: 2025,
		overview:
			'A self-hostable URL shortener with the interface and the redirect logic packaged into a single serverless function.',
		motivation:
			'An experiment in minimalism: how much product can fit inside one Appwrite Function, with no separate frontend to deploy?',
		technologies: ['Appwrite Functions', 'Node.js'],
		outcome: 'A one-function deployment anyone can self-host in minutes.',
		links: [{ label: 'GitHub', href: 'https://github.com/adityaoberai/url-shortener-appwrite' }],
		portfolio: true
	},
	{
		slug: 'whatsapp-translator',
		name: 'WhatsApp Translator',
		kind: 'challenge',
		year: 2024,
		overview:
			'A WhatsApp chatbot that translates your text into another language with GPT-4o, built on Twilio Functions and Programmable Messaging.',
		motivation:
			'Built to solve a problem from travelling across countries: translating quickly without leaving WhatsApp. Conversation state lives in an Appwrite database and is deleted as soon as the translation is sent.',
		technologies: [
			'Twilio Functions',
			'Twilio Programmable Messaging',
			'WhatsApp',
			'Appwrite Databases',
			'OpenAI'
		],
		outcome: 'Submitted to the Twilio Challenge on DEV in June 2024.',
		links: [
			{
				label: 'DEV',
				href: 'https://dev.to/adityaoberai/twilio-challenge-language-translator-via-twilio-functions-whatsapp-openai-5hmc'
			},
			{
				label: 'GitHub',
				href: 'https://github.com/adityaoberai/language-translator-twilio-function'
			}
		]
	},
	{
		slug: 'ai-crystal-ball',
		name: 'AI Crystal Ball',
		kind: 'demo',
		year: 2024,
		overview:
			'An AI-driven GitHub profile reviewer that reads your public activity and tells you, with a wink, what your coding future holds.',
		motivation:
			"Built to demonstrate Appwrite's GitHub OAuth, Databases, and Sites working together in a single playful product.",
		technologies: ['Appwrite Sites', 'Appwrite Databases', 'GitHub OAuth', 'AI'],
		outcome: '400+ sign-ups within the first three days of launch.',
		links: [{ label: 'GitHub', href: 'https://github.com/adityaoberai/AI-Crystal-Ball' }],
		featured: true,
		portfolio: true
	},
	{
		slug: 'alt-text-generator',
		name: 'Alt Text Generator',
		kind: 'tool',
		year: 2023,
		overview:
			'A web app that takes any image and generates a caption ready to use as alternative text, making the web a little more accessible.',
		motivation:
			'Writing good alt text is the kind of accessibility work people skip when it takes effort. This makes it take seconds.',
		technologies: ['Svelte', 'JavaScript', 'Vercel Serverless Functions', 'Azure AI Vision'],
		outcome: 'Used more than 150,000 times.',
		links: [{ label: 'GitHub', href: 'https://github.com/adityaoberai/Alt-Text-Generator' }],
		featured: true,
		portfolio: true
	},
	{
		slug: 'rickroll',
		name: 'Rickroll',
		kind: 'fun',
		year: 2022,
		overview:
			'Enter a phone number and it calls them and plays Rick Astley, through Twilio Voice. It exists as a .NET MAUI app and as an Appwrite Function.',
		motivation:
			'A prank that doubles as a tutorial: the Appwrite Function version, written in .NET 6, is walked through step by step on DEV.',
		technologies: ['.NET MAUI', '.NET', 'Appwrite Functions', 'Twilio Voice'],
		links: [
			{
				label: 'DEV',
				href: 'https://dev.to/adityaoberai/rick-roll-your-friends-using-appwrite-twilio-and-net-4180'
			},
			{ label: 'MAUI app', href: 'https://github.com/adityaoberai/RickRoll-.NET-MAUI' },
			{ label: 'Function', href: 'https://github.com/adityaoberai/RickRoll-AppwriteFunction' }
		]
	},
	{
		slug: 'codecapture',
		name: 'CodeCapture',
		kind: 'competition',
		year: 2021,
		overview:
			'A web app that brings handwritten code from paper to a runnable state in the mobile browser, built for students learning to program without regular access to computers.',
		motivation:
			'Many students in India learn programming on paper. CodeCapture lets them photograph their handwritten code and actually run it.',
		technologies: [
			'.NET',
			'Azure Functions',
			'Azure AI',
			'Azure Database for MySQL',
			'Azure Static Web Apps'
		],
		outcome:
			'National winner in the Education category at the Microsoft Imagine Cup 2021 India chapter.',
		links: [{ label: 'Devpost', href: 'https://devpost.com/software/code-capture-compile' }],
		featured: true,
		portfolio: true
	},
	{
		slug: 'fake-a-call',
		name: 'Fake A Call',
		kind: 'fun',
		year: 2021,
		overview:
			'A Wear OS smartwatch app that fakes an incoming phone call, so you can step out of a situation you would rather leave.',
		motivation:
			'The watch app is built with Xamarin.Android, and an Azure Function places the call through Twilio Programmable Voice. The whole build is written up as a tutorial on DEV.',
		technologies: ['Xamarin.Android', 'Wear OS', 'Azure Functions', 'Twilio Voice'],
		links: [
			{
				label: 'DEV',
				href: 'https://dev.to/adityaoberai/fake-a-phone-call-from-wear-os-smartwatches-using-xamarin-azure-functions-and-twilio-2j56'
			},
			{ label: 'GitHub', href: 'https://github.com/adityaoberai/FakeACall' }
		]
	}
];

// Every technology with the projects that use it, most used first.
export const stack = Object.entries(
	projects.reduce<Record<string, string[]>>((acc, p) => {
		for (const t of p.technologies) (acc[t] ??= []).push(p.slug);
		return acc;
	}, {})
)
	.map(([name, slugs]) => ({ name, slugs }))
	.sort((a, b) => b.slugs.length - a.slugs.length || a.name.localeCompare(b.name));
