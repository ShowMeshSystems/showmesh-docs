import { readFileSync, readdirSync } from 'node:fs';
import { extname, join, relative, resolve } from 'node:path';
import { parse as parseYaml } from 'yaml';

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

function sourceWithoutCode(body) {
	let inFence = false;
	return body.split(/\r?\n/).filter((line) => {
		if (/^\s*```/.test(line)) {
			inFence = !inFence;
			return false;
		}
		return !inFence;
	}).join('\n').replace(/<!--[\s\S]*?-->/g, '').replace(/\{\/\*[\s\S]*?\*\/\}/g, '');
}

function validateSource(source, name) {
	const failures = [];
	const { frontmatter, body, frontmatterFound, frontmatterError } = parseSource(source);
	const prose = sourceWithoutCode(body);
	const headings = [...prose.matchAll(/^##\s+(.+)$/gm)].map((match) => match[1].toLowerCase());
	const add = (message) => failures.push(`${name}: ${message}`);

	if (!frontmatterFound) add('missing YAML frontmatter');
	if (frontmatterError) add(`invalid YAML frontmatter: ${frontmatterError}`);
	if (!frontmatter.title) add('missing title');
	if (!frontmatter.description) add('missing description');
	if (!allowedPageTypes.has(frontmatter.pageType)) add(`invalid or missing pageType: ${frontmatter.pageType || '(missing)'}`);
	if (frontmatter.maturity && !allowedMaturity.has(frontmatter.maturity)) add(`invalid maturity: ${frontmatter.maturity}`);
	if (maturityRequired.has(frontmatter.pageType) && !frontmatter.maturity) add(`${frontmatter.pageType} pages require maturity`);
	if (frontmatter.complexity && frontmatter.complexity !== 'advanced') add(`invalid complexity: ${frontmatter.complexity}`);
	if (frontmatter.complexity === 'advanced' && frontmatter.maturity === 'planned') add('Planned pages cannot use Advanced without an available path');

	let inFence = false;
	for (const line of body.split(/\r?\n/)) {
		const fence = line.match(/^\s*```\s*([^\s`]*)/);
		if (!fence) continue;
		if (!inFence && !fence[1]) add('fenced code blocks require a language identifier');
		inFence = !inFence;
	}
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
		if (!/^\s*\d+\.\s+/m.test(prose) && !headings.some((heading) => /^\d+\./.test(heading))) add('procedures require ordered steps');
		if (!/\b(before you start|before the command|prerequisites?|requirements?|required permissions?|choose .* host)\b/i.test(prose)) add('procedures require prerequisites or a before-you-start boundary');
		if (!/\b(success|verify|verification|confirm|expected|inspect|check)\b/i.test(prose)) add('procedures require an observable success check');
		if (!/\b(recover|recovery|rollback|failure|fails?|does not|doesn.t|troubleshoot|boundary|before retrying)\b/i.test(prose)) add('procedures require failure, recovery, or stop guidance');
	}

	if (frontmatter.pageType === 'troubleshooting') {
		if (!headings.some((heading) => heading.startsWith('symptom:'))) add('troubleshooting pages require at least one Symptom heading');
		if (!/\b(confirm|verify|returns?|becomes?|reappears?|fresh|recovery|healthy|ready)\b/i.test(prose)) add('troubleshooting pages require an observable recovery check');
	}

	if (frontmatter.pageType === 'integration' && frontmatter.maturity !== 'planned') {
		if (!/\b(verify|confirm|test|inspect|check)\b/i.test(prose)) add('available integrations require a verification path');
		if (!/\b(boundar|limit|unsupported|does not|doesn.t|recovery|fallback)\b/i.test(prose)) add('available integrations require a boundary or recovery path');
	}

	if (frontmatter.pageType === 'reference' && headings.length === 0) add('reference pages require navigable sections');
	if (frontmatter.pageType === 'landing' && !/\[[^\]]+\]\((?!https?:)[^)]+\)/.test(prose)) add('landing pages require links to the paths they introduce');
	if (frontmatter.pageType === 'roadmap' && !/\b(planned|future|not available|does not|doesn.t|boundary)\b/i.test(prose)) add('roadmaps require a present-versus-future boundary');

	if (frontmatter.maturity === 'planned' && /^\s*```(?:sh|bash|shell|console)\b/m.test(body)) add('Planned pages cannot contain runnable shell procedures');
	if (frontmatter.maturity === 'deprecated' && !/\b(replace|replacement|migrat|remove|removal)\b/i.test(prose)) add('Deprecated pages require replacement or migration guidance');

	return failures;
}

function selfTest() {
	const invalid = `---\ntitle: Broken\ndescription: Fixture\npageType: procedure\n---\n\n## Run it\n\n\`\`\`\necho nope\n\`\`\``;
	const failures = validateSource(invalid, 'self-test');
	const expected = [
		'procedure pages require maturity',
		'fenced code blocks require a language identifier',
		'procedures require ordered steps',
		'procedures require prerequisites',
	];
	for (const message of expected) {
		if (!failures.some((failure) => failure.includes(message))) throw new Error(`Content validator self-test missed: ${message}`);
	}

	const hiddenContract = `---\ntitle: Hidden\ndescription: Fixture\npageType: procedure\nmaturity: available\n---\n\n<!-- before you start\n1. do something\nverify success\nfailure recovery\n-->`;
	const hiddenFailures = validateSource(hiddenContract, 'self-test-hidden');
	if (!hiddenFailures.some((failure) => failure.includes('ordered steps'))) throw new Error('Content validator self-test accepted a contract hidden in an HTML comment');

	const commentedYaml = `---\ntitle: Commented\ndescription: Fixture\npageType: reference # exact lookup page\nmaturity: available # implemented contract\n---\n\n## Values`;
	if (validateSource(commentedYaml, 'self-test-yaml').length > 0) throw new Error('Content validator self-test rejected valid commented YAML');
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
