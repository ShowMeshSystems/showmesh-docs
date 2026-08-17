// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import mermaid from 'astro-mermaid';

const section = (label, directory) => ({
	label,
	items: [{ autogenerate: { directory } }],
});

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
			components: { SiteTitle: './src/components/SiteTitle.astro' },
			social: [
				{
					icon: 'github',
					label: 'ShowMesh on GitHub',
					href: 'https://github.com/ShowMeshSystems/showmesh-docs',
				},
			],
			sidebar: [
				section('Getting Started', 'getting-started'),
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
