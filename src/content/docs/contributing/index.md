---
title: Contributing
description: Build ShowMesh itself while preserving evidence, contracts, and the boundary between engineering truth and human documentation.
pageType: landing
---

This section is for people modifying ShowMesh. If you are building a client or integration against the public API, use the [Developer Guide](/developer-guide/).

## Start here

1. Follow [Development setup](./development-setup/).
2. Learn the [repository structure](./repository-structure/).
3. Read [Architecture and decisions](./architecture-and-decisions/) before changing a durable constraint.
4. Run the appropriate [tests](./testing/) and report only what you observed.
5. If behavior visible to users changes, update the human docs using [Documentation guidance](./documentation/).

## Source-of-truth boundary

The main `showmesh` repository owns implementation, OpenAPI contracts, tests, engineering specifications, ADRs, research evidence, build plans, and agent/contributor guidance. This `showmesh-docs` repository translates verified behavior into task-focused documentation for operators, users, integrators, and contributors.

Public documentation may summarize architecture, but it does not supersede an ADR, specification, contract, test, or the code. Conversely, engineering notes are not copied wholesale into this site: human readers need a usable path and explicit operational boundaries.

There is no automated linked-PR or documentation release gate yet. Those workflows are intentionally deferred until ShowMesh has its first release process.
