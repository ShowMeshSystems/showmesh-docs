---
title: Documentation guidance
description: Write human-operable documentation from verified behavior without copying engineering notes or inventing workflows.
---

## Decide where the change belongs

- Put ADRs, architecture specifications, research, protocol contracts, tests, implementation plans, and agent instructions in the main `showmesh` repository.
- Put human task guides, operator procedures, integration usage, troubleshooting, and public reference in `showmesh-docs`.

## Verify the claim

Engineering docs are leads, not automatic truth. Check code, tests that genuinely constrain it, `api/openapi.yaml` for HTTP contracts, compiled CLI help for commands, and captured running-system evidence. When sources disagree, do not average them together or select the newest prose without verification.

## Write the working path first

For a procedure, state:

1. What the reader will accomplish.
2. Prerequisites and safety boundaries.
3. The shortest ordered steps.
4. What success looks like.
5. Likely symptoms and immediate remedies.
6. Deeper explanation afterward.

Never use a bare `TODO` page. A future-facing landing page must explain the section's purpose, what works today, and what is expected later.

## Label maturity

Use the shared [status vocabulary](../statuses/). Planned architecture may be described, but a procedure may only direct readers through behavior present in the documented build.

## Current process

Update documentation deliberately when behavior changes, but do not add linked-PR enforcement, release gates, or automated docs-update workflows yet. That process will be designed with the first ShowMesh release/versioning system.
