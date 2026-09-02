---
title: Contributing
description: Build ShowMesh itself while preserving evidence, APIs, and the boundary between engineering truth and human documentation.
pageType: landing
---

This section is for people modifying ShowMesh. If you are building a client or integration against the public API, use the [Developer guide](/developer-guide/).

## Start here

1. Follow [Development setup](./development-setup/).
2. Learn the [repository structure](./repository-structure/).
3. Read [Architecture and decisions](./architecture-and-decisions/) before changing a durable constraint.
4. Run the appropriate [tests](./testing/) and report only what you observed.
5. If behavior visible to users changes, update the human docs using [Documentation guidance](./documentation/).

## Source-of-truth boundary

The main `showmesh` repository owns implementation, OpenAPI definitions, tests, engineering specifications, ADRs, research evidence, build plans, and agent/contributor guidance. This `showmesh-docs` repository translates verified behavior into task-focused documentation for operators, users, integrators, and contributors.

Public documentation may summarize architecture, but it does not supersede an ADR, specification, API description, test, or the code. Conversely, engineering notes are not copied wholesale into this site: human readers need a usable path and explicit operational boundaries.

There is no automated linked-PR or documentation release check yet. Those workflows are intentionally deferred until ShowMesh has its first release process.

## Report a problem

File a documentation issue in this repository's own issue tracker. File an implementation issue or feature request in the main `showmesh` repository's issue tracker. Report a security vulnerability through the main repository's `SECURITY.md` process, not a public issue. Public issues may be mirrored into an internal tracker for planning; internal tracker identifiers, links, and discussion must never be copied into a public issue, pull request, or documentation page.
