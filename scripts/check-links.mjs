import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { extname, join, relative, resolve } from 'node:path';

const root = resolve('dist');

if (!existsSync(root)) {
	console.error('dist/ does not exist. Run npm run build before checking links.');
	process.exit(1);
}

const walk = (directory) => readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
	const path = join(directory, entry.name);
	return entry.isDirectory() ? walk(path) : [path];
});

const htmlFiles = walk(root).filter((file) => extname(file) === '.html');
const failures = [];

for (const source of htmlFiles) {
	const html = readFileSync(source, 'utf8');
	const links = [...html.matchAll(/\bhref=["']([^"']+)["']/g)].map((match) => match[1]);

	for (const rawLink of links) {
		if (/^(?:[a-z]+:|\/\/)/i.test(rawLink) || rawLink.startsWith('#')) continue;
		const [pathname] = rawLink.split(/[?#]/, 1);
		if (!pathname) continue;
		const cleanPath = decodeURIComponent(pathname);
		const candidate = cleanPath.startsWith('/') ? join(root, cleanPath) : resolve(source, '..', cleanPath);
		const targets = extname(candidate) ? [candidate] : [candidate, `${candidate}.html`, join(candidate, 'index.html')];
		if (!targets.some(existsSync)) failures.push(`${relative(root, source)} -> ${rawLink}`);
	}
}

if (failures.length > 0) {
	console.error(`Found ${failures.length} broken internal link${failures.length === 1 ? '' : 's'}:`);
	for (const failure of failures) console.error(`- ${failure}`);
	process.exit(1);
}

console.log(`Checked internal links in ${htmlFiles.length} generated HTML files.`);
