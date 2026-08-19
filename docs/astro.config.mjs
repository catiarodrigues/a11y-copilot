// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
	site: 'https://a11y-copilot.catiarodrigues.dev',
	integrations: [
		starlight({
			title: 'a11y-copilot',
			description:
				'An AI-agent accessibility auditor that verifies its own fixes before trusting them.',
			social: [
				{ icon: 'github', label: 'GitHub', href: 'https://github.com/catiarodrigues/a11y-copilot' },
			],
			sidebar: [
				{
					label: 'Guides',
					items: [
						{ label: 'Overview', link: '/' },
						{ label: 'Getting started', slug: 'getting-started' },
						{ label: 'Commands', slug: 'commands' },
						{ label: 'Mock mode', slug: 'mock-mode' },
					],
				},
				{
					label: 'Reference',
					items: [{ autogenerate: { directory: 'reference' } }],
				},
			],
		}),
	],
});
