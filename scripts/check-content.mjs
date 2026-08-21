import { readFileSync, readdirSync } from 'node:fs';
import { extname, join, relative, resolve } from 'node:path';
import { parse as parseYaml } from 'yaml';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkMdx from 'remark-mdx';
import { visit } from 'unist-util-visit';

const contentRoot = resolve('src/content/docs');
const allowedPageTypes = new Set([
	'landing',
	'concept',
	'procedure',
	'troubleshooting',
	'integration',
	'reference',
	'roadmap',
]);
const allowedMaturity = new Set([
	'available',
	'experimental-active',
	'experimental-testing',
	'planned',
	'deprecated',
]);
const maturityRequired = new Set(['procedure', 'integration', 'reference', 'roadmap']);
const plannedEmbeddedNodeTypes = new Set([
	'code',
	'html',
	'mdxJsxFlowElement',
	'mdxJsxTextElement',
	'mdxFlowExpression',
	'mdxTextExpression',
	'mdxjsEsm',
]);
const contractOpaqueNodeTypes = new Set(['code', 'html', 'mdxFlowExpression', 'mdxTextExpression', 'mdxjsEsm']);
const contractVisibleMdxNames = new Set(['card', 'cardgrid', 'statusnote']);
const documentationOrigin = new URL('https://docs.showmesh.invalid/');

const walk = (directory) => readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
	const path = join(directory, entry.name);
	return entry.isDirectory() ? walk(path) : [path];
});

function parseSource(source) {
	const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
	if (!match) return { frontmatter: {}, body: source, frontmatterFound: false, frontmatterError: undefined };

	try {
		const frontmatter = parseYaml(match[1]);
		if (!frontmatter || typeof frontmatter !== 'object' || Array.isArray(frontmatter)) throw new Error('frontmatter must be a mapping');
		return { frontmatter, body: source.slice(match[0].length), frontmatterFound: true, frontmatterError: undefined };
	} catch (error) {
		return {
			frontmatter: {},
			body: source.slice(match[0].length),
			frontmatterFound: true,
			frontmatterError: error instanceof Error ? error.message : String(error),
		};
	}
}

function sourceWithoutCode(body, markdownTree) {
	const masked = body.split('');
	visit(markdownTree, 'code', (node) => {
		const start = node.position?.start.offset;
		const end = node.position?.end.offset;
		if (start === undefined || end === undefined) return;
		for (let index = start; index < end; index += 1) {
			if (masked[index] !== '\n' && masked[index] !== '\r') masked[index] = ' ';
		}
	});
	return masked.join('')
		.replace(/<!--[\s\S]*?-->/g, '')
		.replace(/\{\/\*[\s\S]*?\*\/\}/g, '')
		.replace(/<pre\b[\s\S]*?<\/pre>/gi, '')
		.replace(/<Code\b[\s\S]*?<\/Code>/g, '');
}

function withoutRawContainers(body) {
	let stripped = body;
	let previous;
	do {
		previous = stripped;
		stripped = stripped.replace(/<([a-z][\w:.-]*)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, '');
	} while (stripped !== previous);
	return stripped;
}

function isContractOpaque(node) {
	if (contractOpaqueNodeTypes.has(node.type)) return true;
	if (node.type === 'mdxJsxFlowElement' || node.type === 'mdxJsxTextElement') {
		return !contractVisibleMdxNames.has((node.name || '').toLowerCase());
	}
	return false;
}

function isInternalDocumentationPath(url) {
	if (!url || url.startsWith('#')) return false;
	try {
		return new URL(url, documentationOrigin).origin === documentationOrigin.origin;
	} catch {
		return false;
	}
}

function contractSignals(markdownTree) {
	const text = [];
	const headings = [];
	let hasOrderedList = false;
	let hasInternalLink = false;

	const nodeText = (node) => {
		if (node.type === 'text' || node.type === 'inlineCode') return node.value || '';
		if (isContractOpaque(node)) return '';
		return (node.children || []).map(nodeText).join(' ');
	};

	const walk = (node) => {
		if (isContractOpaque(node)) return;
		if (node.type === 'heading') headings.push(nodeText(node).trim().toLowerCase());
		if (node.type === 'list' && node.ordered) hasOrderedList = true;
		if (node.type === 'link' && isInternalDocumentationPath(node.url || '')) hasInternalLink = true;
		if (node.type === 'text' || node.type === 'inlineCode') text.push(node.value || '');
		for (const child of node.children || []) walk(child);
	};

	walk(markdownTree);
	return { text: text.join('\n'), headings, hasOrderedList, hasInternalLink };
}

function validateSource(source, name) {
	const failures = [];
	const { frontmatter, body, frontmatterFound, frontmatterError } = parseSource(source);
	const markdownParser = unified().use(remarkParse);
	if (name.endsWith('.mdx')) markdownParser.use(remarkMdx);
	const markdownTree = markdownParser.parse(body);
	const contractBody = name.endsWith('.mdx') ? body : withoutRawContainers(body);
	const contractMarkdownTree = markdownParser.parse(contractBody);
	const codeBlocks = [];
	const embeddedBlocks = [];
	visit(markdownTree, 'code', (node) => codeBlocks.push(node));
	visit(markdownTree, (node) => {
		if (plannedEmbeddedNodeTypes.has(node.type) && node.type !== 'code') embeddedBlocks.push(node);
	});
	const prose = sourceWithoutCode(body, markdownTree);
	const { text: contractText, headings, hasOrderedList, hasInternalLink } = contractSignals(contractMarkdownTree);
	const add = (message) => failures.push(`${name}: ${message}`);
	const isContributionPolicy = name.startsWith('src/content/docs/contributing/');
	const hasMaturity = Object.hasOwn(frontmatter, 'maturity');
	const hasComplexity = Object.hasOwn(frontmatter, 'complexity');

	if (!frontmatterFound) add('missing YAML frontmatter');
	if (frontmatterError) add(`invalid YAML frontmatter: ${frontmatterError}`);
	if (!frontmatter.title) add('missing title');
	if (!frontmatter.description) add('missing description');
	if (!allowedPageTypes.has(frontmatter.pageType)) add(`invalid or missing pageType: ${frontmatter.pageType || '(missing)'}`);
	if (hasMaturity && !allowedMaturity.has(frontmatter.maturity)) add(`invalid maturity: ${frontmatter.maturity}`);
	if (maturityRequired.has(frontmatter.pageType) && !hasMaturity && !isContributionPolicy) add(`${frontmatter.pageType} pages require maturity`);
	if (hasComplexity && frontmatter.complexity !== 'advanced') add(`invalid complexity: ${frontmatter.complexity}`);
	if (frontmatter.complexity === 'advanced' && frontmatter.maturity === 'planned') add('Planned pages cannot use Advanced without an available path');

	if (codeBlocks.some((node) => !node.lang)) add('code blocks require a language identifier');
	for (const match of prose.matchAll(/!\[([^\]]*)\]\([^)]+\)/g)) {
		if (!match[1].trim()) add('informative Markdown images require alt text');
	}
	for (const match of prose.matchAll(/<img\b[^>]*>/gi)) {
		if (!/\balt\s*=\s*["'][^"']+["']/i.test(match[0])) add('HTML images require nonempty alt text');
	}
	if (/:::.*\[Owner screenshots? needed\]/i.test(prose) || /\bAdd (?:a|two) (?:current |versioned )?.*screenshots? here\b/i.test(prose)) {
		add('reader-facing owner or screenshot placeholder');
	}

	if (frontmatter.pageType === 'procedure') {
		if (!hasOrderedList && !headings.some((heading) => /^\d+\./.test(heading))) add('procedures require ordered steps');
		if (!/\b(before you start|before the command|prerequisites?|requirements?|required permissions?|choose .* host)\b/i.test(contractText)) add('procedures require prerequisites or a before-you-start boundary');
		if (!/\b(success|verify|verification|confirm|expected|inspect|check)\b/i.test(contractText)) add('procedures require an observable success check');
		if (!/\b(recover|recovery|rollback|failure|fails?|does not|doesn.t|troubleshoot|boundary|before retrying)\b/i.test(contractText)) add('procedures require failure, recovery, or stop guidance');
	}

	if (frontmatter.pageType === 'troubleshooting') {
		if (!headings.some((heading) => heading.startsWith('symptom:'))) add('troubleshooting pages require at least one Symptom heading');
		if (!/\b(confirm|verify|returns?|becomes?|reappears?|fresh|recovery|healthy|ready)\b/i.test(contractText)) add('troubleshooting pages require an observable recovery check');
	}

	if (frontmatter.pageType === 'integration' && frontmatter.maturity !== 'planned') {
		if (!/\b(verify|confirm|test|inspect|check)\b/i.test(contractText)) add('available integrations require a verification path');
		if (!/\b(boundar|limit|unsupported|does not|doesn.t|recovery|fallback)\b/i.test(contractText)) add('available integrations require a boundary or recovery path');
	}

	if (frontmatter.pageType === 'reference' && headings.length === 0) add('reference pages require navigable sections');
	if (frontmatter.pageType === 'landing' && !hasInternalLink) add('landing pages require links to the paths they introduce');
	if (frontmatter.pageType === 'roadmap' && !/\b(planned|future|not available|does not|doesn.t|boundary)\b/i.test(contractText)) add('roadmaps require a present-versus-future boundary');

	if (frontmatter.maturity === 'planned' && (codeBlocks.length > 0 || embeddedBlocks.length > 0)) {
		add('Planned pages cannot contain block code, raw HTML, or MDX components that imply runnable behavior');
	}
	if (frontmatter.maturity === 'deprecated' && !/\b(replace|replacement|migrat|remove|removal)\b/i.test(contractText)) add('Deprecated pages require replacement or migration guidance');

	return failures;
}

function selfTest() {
	const invalid = `---\ntitle: Broken\ndescription: Fixture\npageType: procedure\n---\n\n## Run it\n\n\`\`\`\necho nope\n\`\`\``;
	const failures = validateSource(invalid, 'self-test');
	const expected = [
		'procedure pages require maturity',
		'code blocks require a language identifier',
		'procedures require ordered steps',
		'procedures require prerequisites',
	];
	for (const message of expected) {
		if (!failures.some((failure) => failure.includes(message))) throw new Error(`Content validator self-test missed: ${message}`);
	}

	const hiddenContract = `---\ntitle: Hidden\ndescription: Fixture\npageType: procedure\nmaturity: available\n---\n\n<!-- before you start\n1. do something\nverify success\nfailure recovery\n-->`;
	const hiddenFailures = validateSource(hiddenContract, 'self-test-hidden');
	if (!hiddenFailures.some((failure) => failure.includes('ordered steps'))) throw new Error('Content validator self-test accepted a contract hidden in an HTML comment');

	const hiddenTildeContract = `---\ntitle: Hidden\ndescription: Fixture\npageType: procedure\nmaturity: available\n---\n\n~~~text\nbefore you start\n1. do something\nverify success\nfailure recovery\n~~~`;
	const hiddenTildeFailures = validateSource(hiddenTildeContract, 'self-test-hidden-tilde');
	if (!hiddenTildeFailures.some((failure) => failure.includes('ordered steps'))) throw new Error('Content validator self-test accepted a procedure contract hidden in a tilde code fence');

	const hiddenUnicodeContract = `---\ntitle: Hidden\ndescription: Fixture\npageType: procedure\nmaturity: available\n---\n\n${'😀'.repeat(70)}\n\n\`\`\`text\nbefore you start\n1. hidden step\nverify success\nfailure recovery\n\`\`\``;
	const hiddenUnicodeFailures = validateSource(hiddenUnicodeContract, 'self-test-hidden-unicode');
	if (!hiddenUnicodeFailures.some((failure) => failure.includes('ordered steps'))) throw new Error('Content validator self-test leaked a Unicode-shifted code block into procedure contract checks');

	const hiddenTemplateContract = `---\ntitle: Hidden\ndescription: Fixture\npageType: procedure\nmaturity: available\n---\n\n<template>\nbefore you start\n1. hidden step\nverify success\nfailure recovery\n</template>`;
	const hiddenTemplateFailures = validateSource(hiddenTemplateContract, 'self-test-hidden-template');
	if (!hiddenTemplateFailures.some((failure) => failure.includes('ordered steps'))) throw new Error('Content validator self-test accepted a procedure contract hidden in raw HTML');

	const hiddenLandingLink = `---\ntitle: Hidden\ndescription: Fixture\npageType: landing\n---\n\n<template>[Hidden link](./hidden)</template>`;
	if (!validateSource(hiddenLandingLink, 'self-test-hidden-landing').some((failure) => failure.includes('landing pages require links'))) {
		throw new Error('Content validator self-test accepted a landing-page link hidden in raw HTML');
	}

	const hiddenMdxLandingLink = `---\ntitle: Hidden\ndescription: Fixture\npageType: landing\n---\n\n<div style="display: none">[Hidden link](./hidden)</div>`;
	if (!validateSource(hiddenMdxLandingLink, 'self-test-hidden-landing.mdx').some((failure) => failure.includes('landing pages require links'))) {
		throw new Error('Content validator self-test accepted a landing-page link hidden in an unknown MDX component');
	}

	for (const unsafeLink of ['//external.example/path', '/\\external.example/path', 'javascript:alert(1)', 'data:text/plain,not-internal']) {
		const externalOnlyLanding = `---\ntitle: External\ndescription: Fixture\npageType: landing\n---\n\n[Not an internal path](${unsafeLink})`;
		if (!validateSource(externalOnlyLanding, 'self-test-external-landing').some((failure) => failure.includes('landing pages require links'))) {
			throw new Error(`Content validator self-test treated ${unsafeLink} as an internal documentation path`);
		}
	}

	const commentedYaml = `---\ntitle: Commented\ndescription: Fixture\npageType: reference # exact lookup page\nmaturity: available # implemented contract\n---\n\n## Values`;
	if (validateSource(commentedYaml, 'self-test-yaml').length > 0) throw new Error('Content validator self-test rejected valid commented YAML');

	const contributionPolicy = `---\ntitle: Policy\ndescription: Fixture\npageType: reference\n---\n\n## Rules`;
	if (validateSource(contributionPolicy, 'src/content/docs/contributing/self-test.md').length > 0) throw new Error('Content validator self-test rejected a contribution-policy maturity exemption');
	if (!validateSource(contributionPolicy, 'src/content/docs/reference/self-test.md').some((failure) => failure.includes('reference pages require maturity'))) {
		throw new Error('Content validator self-test allowed a product reference to omit maturity');
	}

	const plannedUppercaseShell = `---\ntitle: Planned\ndescription: Fixture\npageType: integration\nmaturity: planned\n---\n\n\`\`\`BASH\necho deploy\n\`\`\``;
	if (!validateSource(plannedUppercaseShell, 'self-test-planned-shell').some((failure) => failure.includes('Planned pages cannot contain'))) {
		throw new Error('Content validator self-test allowed an uppercase runnable shell fence on a Planned page');
	}

	const plannedIndentedCode = `---\ntitle: Planned\ndescription: Fixture\npageType: integration\nmaturity: planned\n---\n\n## Boundary\n\nPresent alternative; planned future.\n\n    showmeshctl deploy --now`;
	if (!validateSource(plannedIndentedCode, 'self-test-planned-indented').some((failure) => failure.includes('Planned pages cannot contain'))) {
		throw new Error('Content validator self-test allowed an indented code procedure on a Planned page');
	}

	const plannedTildeFence = `---\ntitle: Planned\ndescription: Fixture\npageType: integration\nmaturity: planned\n---\n\n~~~bash\necho deploy\n~~~`;
	if (!validateSource(plannedTildeFence, 'self-test-planned-tilde').some((failure) => failure.includes('Planned pages cannot contain'))) {
		throw new Error('Content validator self-test allowed a tilde-fenced code procedure on a Planned page');
	}

	const plannedRawCode = `---\ntitle: Planned\ndescription: Fixture\npageType: integration\nmaturity: planned\n---\n\n<pre><code>echo deploy</code></pre>`;
	if (!validateSource(plannedRawCode, 'self-test-planned-raw').some((failure) => failure.includes('Planned pages cannot contain'))) {
		throw new Error('Content validator self-test allowed a raw code container on a Planned page');
	}

	const plannedMdxComponent = `---\ntitle: Planned\ndescription: Fixture\npageType: integration\nmaturity: planned\n---\n\n<CodeBlock>echo deploy</CodeBlock>`;
	if (!validateSource(plannedMdxComponent, 'self-test-planned-component.mdx').some((failure) => failure.includes('Planned pages cannot contain'))) {
		throw new Error('Content validator self-test allowed an MDX component on a Planned page');
	}

	const nullComplexity = `---\ntitle: Null\ndescription: Fixture\npageType: concept\ncomplexity:\n---\n\nConcept.`;
	if (!validateSource(nullComplexity, 'self-test-null-complexity').some((failure) => failure.includes('invalid complexity'))) {
		throw new Error('Content validator self-test allowed null complexity metadata');
	}
}

selfTest();
console.log('Content validator negative self-test passed.');

const files = walk(contentRoot).filter((file) => ['.md', '.mdx'].includes(extname(file)));
const failures = files.flatMap((file) => validateSource(readFileSync(file, 'utf8'), relative(process.cwd(), file)));

if (failures.length > 0) {
	console.error(`Found ${failures.length} content standard violation${failures.length === 1 ? '' : 's'}:`);
	for (const failure of failures) console.error(`- ${failure}`);
	process.exit(1);
}

console.log(`Checked documentation metadata and structure in ${files.length} source files.`);
