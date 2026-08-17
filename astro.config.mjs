// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import mermaid from 'astro-mermaid';

const section = (label, directory) => ({
	label,
	items: [{ autogenerate: { directory } }],
});

const gettingStarted = {
	label: 'Getting Started',
	items: [
		{ label: 'Getting Started', link: '/getting-started/' },
		{ label: 'What is ShowMesh?', link: '/getting-started/what-is-showmesh/' },
		{ label: 'Requirements', link: '/getting-started/requirements/' },
		{ label: 'Architecture Overview', link: '/getting-started/architecture/' },
		{ label: 'Installation', link: '/getting-started/installation/' },
		{ label: 'Your First Show', link: '/getting-started/your-first-show/' },
	],
};

export default defineConfig({
	site: 'https://docs.showmesh.systems',
	integrations: [
		mermaid({
			autoTheme: true,
			enableLog: false,
			mermaidConfig: {
				flowchart: { curve: 'linear', htmlLabels: true },
				securityLevel: 'strict',
			},
		}),
		starlight({
			title: 'ShowMesh Docs',
			description:
				'Human-facing documentation for operating, integrating with, and contributing to ShowMesh.',
			favicon: '/brand/showmesh-icon.png',
			customCss: ['./src/styles/showmesh.css'],
			components: {
				Footer: './src/components/DiagramTools.astro',
				PageTitle: './src/components/PageTitle.astro',
				SiteTitle: './src/components/SiteTitle.astro',
			},
			social: [
				{
					icon: 'github',
					label: 'ShowMesh on GitHub',
					href: 'https://github.com/ShowMeshSystems/showmesh-docs',
				},
			],
			sidebar: [
				gettingStarted,
				section('Using ShowMesh', 'using-showmesh'),
				section('Integrations', 'integrations'),
				section('Guides', 'guides'),
				section('Troubleshooting', 'troubleshooting'),
				section('Developer Guide', 'developer-guide'),
				section('Reference', 'reference'),
				section('Contributing', 'contributing'),
			],
			lastUpdated: true,
			pagination: true,
			tableOfContents: { minHeadingLevel: 2, maxHeadingLevel: 3 },
		}),
	],
});
