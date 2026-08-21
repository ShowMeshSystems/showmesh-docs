import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { extname, isAbsolute, join, relative, resolve, sep } from 'node:path';

const root = resolve('dist');

const walk = (directory) => readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
	const path = join(directory, entry.name);
	return entry.isDirectory() ? walk(path) : [path];
});

const activeHtml = (html) => html
	.replace(/<!--[\s\S]*?-->/g, '')
	.replace(/(<script\b[^>]*>)[\s\S]*?<\/script>/gi, '$1</script>');

function checkSite(siteRoot) {
	const htmlFiles = walk(siteRoot).filter((file) => extname(file) === '.html');
	const cssFiles = walk(siteRoot).filter((file) => extname(file) === '.css');
	const htmlIds = new Map(htmlFiles.map((file) => {
		const html = activeHtml(readFileSync(file, 'utf8'));
		const ids = new Set([...html.matchAll(/\bid=["']([^"']+)["']/g)].map((match) => match[1]));
		return [file, ids];
	}));
	const failures = [];

	function resolveTarget(source, pathname) {
		let cleanPath;
		try {
			cleanPath = decodeURIComponent(pathname);
		} catch {
			return undefined;
		}

		const candidate = cleanPath.startsWith('/') ? join(siteRoot, cleanPath) : resolve(source, '..', cleanPath);
		const relativeCandidate = relative(siteRoot, candidate);
		if (relativeCandidate === '..' || relativeCandidate.startsWith(`..${sep}`) || isAbsolute(relativeCandidate)) return undefined;
		const targets = extname(candidate) ? [candidate] : [candidate, `${candidate}.html`, join(candidate, 'index.html')];
		return targets.find((target) => existsSync(target) && !statSync(target).isDirectory());
	}

	function checkReference(source, rawReference, kind) {
		if (!rawReference || /^(?:[a-z]+:|\/\/)/i.test(rawReference)) return;

		const [pathAndQuery, rawFragment] = rawReference.split('#', 2);
		const [pathname] = pathAndQuery.split('?', 1);
		const target = pathname ? resolveTarget(source, pathname) : source;
		if (!target) {
			failures.push(`${relative(siteRoot, source)} -> ${rawReference} (${kind})`);
			return;
		}

		if (rawFragment && extname(target) === '.html') {
			let fragment;
			try {
				fragment = decodeURIComponent(rawFragment);
			} catch {
				failures.push(`${relative(siteRoot, source)} -> ${rawReference} (malformed anchor)`);
				return;
			}
			if (fragment !== '_top' && !htmlIds.get(target)?.has(fragment)) {
				failures.push(`${relative(siteRoot, source)} -> ${rawReference} (missing anchor)`);
			}
		}
	}

	for (const source of htmlFiles) {
		const html = activeHtml(readFileSync(source, 'utf8'));
		for (const match of html.matchAll(/\bhref=["']([^"']+)["']/g)) checkReference(source, match[1], 'link');
		for (const match of html.matchAll(/\bsrc=["']([^"']+)["']/g)) checkReference(source, match[1], 'asset');
		for (const match of html.matchAll(/\bposter=["']([^"']+)["']/g)) checkReference(source, match[1], 'poster asset');
		for (const match of html.matchAll(/\bsrcset=["']([^"']+)["']/g)) {
			for (const candidate of match[1].split(',')) checkReference(source, candidate.trim().split(/\s+/, 1)[0], 'srcset asset');
		}
		for (const match of html.matchAll(/\burl\(\s*["']?([^"')]+)["']?\s*\)/g)) checkReference(source, match[1], 'inline style asset');
	}

	for (const source of cssFiles) {
		const css = readFileSync(source, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
		for (const match of css.matchAll(/\burl\(\s*["']?([^"')]+)["']?\s*\)/g)) checkReference(source, match[1], 'stylesheet asset');
	}

	return { failures, htmlCount: htmlFiles.length };
}

function selfTest() {
	const fixtureRoot = mkdtempSync(join(tmpdir(), 'showmesh-link-check-'));
	const siteRoot = join(fixtureRoot, 'dist');
	try {
		mkdirSync(join(siteRoot, 'assets'), { recursive: true });
		writeFileSync(join(fixtureRoot, 'outside.txt'), 'not deployed');
		writeFileSync(join(siteRoot, '..asset.txt'), 'unusual but deployed');
		writeFileSync(join(siteRoot, 'assets', 'present.png'), 'fixture');
		writeFileSync(join(siteRoot, 'styles.css'), `
			/* Retired example: url("/not-an-active-asset.png") */
			.broken { background: url("/missing-background.png"); }
		`);
		writeFileSync(join(siteRoot, 'index.html'), `
			<h1 id="present">Fixture</h1>
			<a href="#present">Valid anchor</a>
			<a href="#comment-only">Missing comment-only anchor</a>
			<a href="#script-only">Missing script-only anchor</a>
			<a href="/..asset.txt">Valid dotted filename</a>
			<img src="/assets/present.png" alt="Fixture">
			<a href="../outside.txt">Escaped path</a>
			<video poster="/missing-poster.png"></video>
			<!-- <div id="comment-only"><img src="/commented-out.png" alt="Inactive"></div> -->
			<script>const example = '<div id="script-only"><img src="/script-string.png"></div>';</script>
		`);

		const { failures } = checkSite(siteRoot);
		for (const expected of ['../outside.txt', 'missing-poster.png', 'missing-background.png', '#comment-only', '#script-only']) {
			if (!failures.some((failure) => failure.includes(expected))) throw new Error(`Link checker self-test missed: ${expected}`);
		}
		for (const ignored of ['..asset.txt', 'not-an-active-asset.png', 'commented-out.png', 'script-string.png']) {
			if (failures.some((failure) => failure.includes(ignored))) throw new Error(`Link checker self-test produced a false positive: ${ignored}`);
		}
	} finally {
		rmSync(fixtureRoot, { recursive: true, force: true });
	}
}

selfTest();
console.log('Link and asset checker negative self-test passed.');

if (!existsSync(root)) {
	console.error('dist/ does not exist. Run npm run build before checking links.');
	process.exit(1);
}

const { failures, htmlCount } = checkSite(root);
if (failures.length > 0) {
	console.error(`Found ${failures.length} broken internal reference${failures.length === 1 ? '' : 's'}:`);
	for (const failure of failures) console.error(`- ${failure}`);
	process.exit(1);
}

console.log(`Checked links, anchors, and local assets in ${htmlCount} generated HTML files.`);
