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

const usingShowMesh = {
	label: 'Using ShowMesh',
	items: [
		{ label: 'Using ShowMesh', link: '/using-showmesh/' },
		{ label: 'Actions and Macros', link: '/using-showmesh/actions-and-macros/' },
		{ label: 'Assets', link: '/using-showmesh/assets/' },
		{ label: 'Nodes', link: '/using-showmesh/nodes/' },
		{
			label: 'Node Types',
			items: [
				{ label: 'Overview', link: '/using-showmesh/node-types/' },
				{ label: 'Render Nodes', link: '/using-showmesh/node-types/render-nodes/' },
				{ label: 'Audio Nodes', link: '/using-showmesh/node-types/audio-nodes/' },
			],
		},
		{ label: 'Shows', link: '/using-showmesh/shows/' },
		{ label: 'Surfaces', link: '/using-showmesh/surfaces/' },
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
				usingShowMesh,
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
