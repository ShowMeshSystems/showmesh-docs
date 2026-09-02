# ShowMesh documentation

This repository contains the human-facing documentation for ShowMesh: operating guidance, integrations, task-based guides, troubleshooting, public developer material, reference, and contributor orientation.

The main `ShowMeshSystems/showmesh` repository remains authoritative for implementation specifications, architecture decision records, internal contracts, tests, and agent guidance. Claims in this site must be checked against implementation and tests; repository prose is useful evidence, but not sufficient proof when it conflicts with code.

## Local development

Requires Node.js 22.12 or newer.

```sh
npm ci
npm run dev
```

Open `http://localhost:4321`. Before opening a pull request, run:

```sh
npm run check
```

That command builds the production site, generates Pagefind search data, and checks generated internal links.

## Reporting a documentation problem

Use the [documentation issue form](https://github.com/ShowMeshSystems/showmesh-docs/issues/new/choose). Product bugs and feature requests belong in the [main ShowMesh repository](https://github.com/ShowMeshSystems/showmesh/issues/new/choose). Security reports follow [SECURITY.md](SECURITY.md).

## Content

Pages live in `src/content/docs`. The sidebar is intentionally limited to eight top-level sections. Use Starlight components for standard notes, cautions, cards, and tabs.

MDX pages can import the maturity components:

```mdx
import StatusBadge from '../../../components/StatusBadge.astro';
import StatusNote from '../../../components/StatusNote.astro';

<StatusBadge status="available" />

<StatusNote status="planned">
  This behavior is design-approved but is not present in the documented build.
</StatusNote>
```

Page frontmatter uses a required `pageType`, an applicable `maturity`, and optional `complexity: advanced`. Inline status notes use `available`, `experimental-active`, `experimental-testing`, `planned`, or `deprecated`. Their meanings are governed by the documentation standard, not by individual pages.

## Cloudflare Pages

The site is a static Astro build and does not require a runtime adapter.

- Production branch: `main`
- Build command: `npm run build`
- Build output directory: `dist`
- Node.js version: `22.12` or newer

The site builds and deploys to https://docs.showmesh.systems automatically when changes land on `main`. Do not store Cloudflare credentials in this repository. `wrangler.toml` records the output directory for local Cloudflare tooling.

## Versioning

The MVP documents the current development state only. Documentation versioning is intentionally deferred until ShowMesh has a prerelease/release model to follow.
