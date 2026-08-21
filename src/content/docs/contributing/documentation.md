---
title: Documentation standard
description: The canonical standard for clear, safe, human-operable ShowMesh documentation.
pageType: reference
maturity: available
---

This page is the canonical standard for public ShowMesh documentation. The shorter repository contribution notes point here; if they disagree, this page wins.

The standard is intentionally practical. It defines the information a reader needs and the checks a change must pass without forcing every page into identical prose.

## Put information in the right repository

- Put ADRs, architecture specifications, research, protocol contracts, tests, implementation plans, and agent instructions in the main `showmesh` repository.
- Put human task guides, operator procedures, integration usage, troubleshooting, and public reference in `showmesh-docs`.

Public documentation translates engineering truth into a usable path. It does not copy the main repository's engineering history or supersede its contracts.

## Verify behavioral claims during review

Engineering prose is a lead, not automatic truth. Check the source appropriate to the claim:

- HTTP behavior: `api/openapi.yaml`, implementation, and contract tests.
- CLI commands: compiled help and exercised command behavior.
- Configuration, defaults, and migrations: implementation, schemas, and migration tests.
- Runtime behavior: tests that cross the relevant process boundary or captured running-system evidence.
- Hardware or vendor behavior: observation on the named system and version.
- Durable design intent: an accepted ADR, clearly separated from available behavior.

Record that evidence in the pull request when a change adds or alters behavioral claims. Do not expose source revisions, verification dates, or test-machine details as universal public page metadata. State a platform or hardware boundary in a page only when it changes what the reader can safely do.

If authoritative sources disagree, resolve the conflict before publishing a definite claim. When resolution is not possible, document only the supported boundary and state the uncertainty where the reader encounters it.

## Classify the page

Every page declares a `pageType`. The type selects the page's minimum content contract; it is authoring metadata and is not displayed to readers.

Use the [page-type contracts](../page-types/) for procedures, troubleshooting, integrations, concepts, references, landing pages, and roadmaps. Use the [maturity and complexity vocabulary](../statuses/) when the page describes product capability.

## Write the working path first

For a task, put the outcome, prerequisites, safety boundaries, ordered steps, observable success, likely failures, and recovery before deeper implementation detail.

Completeness is not length. Include a detail when it helps the reader act, interpret a result, avoid damage, or recover. Remove history, repetition, and internals that do not change any of those things. Link to one authoritative explanation rather than copying it across several pages.

Never publish a bare `TODO`, an owner instruction, or a placeholder page. Future-facing material must explain what is available now, what is expected later, and where the working path ends.

## Follow the voice and editorial conventions

Use the [ShowMesh voice and style](../voice-and-style/). It defines the local operator voice, command and placeholder conventions, safety language, accessibility requirements, and the Google Developer Documentation Style Guide fallback.

## Keep pages ready for versioning

ShowMesh will introduce versioned documentation after the product release model exists. Until then:

- Keep internal links version-neutral and relative when practical.
- Avoid time-relative phrases such as “currently” when a maturity label or explicit development-state boundary is clearer.
- Keep release history out of operational procedures.
- Do not add release numbers to ordinary page names or paths.
- Write pages so the first released documentation set can become an immutable snapshot.

The post-release routing, maintenance, backport, search, and retirement workflow is tracked separately. Do not invent a documentation-only version scheme before the product defines one.

## Meet the review gate

Before merging a documentation change:

1. Confirm the repository, audience, and page type are correct.
2. Apply maturity and complexity labels where the vocabulary requires them.
3. Check behavioral claims against the appropriate source and record evidence in the pull request.
4. Review security, safety, data-preservation, and recovery boundaries.
5. Confirm that success and failure are observable to the reader.
6. Run `npm run check` and resolve every blocking failure.
7. Review the page as an operator; automation cannot prove factual sufficiency, good judgment, or usable prose.

Linked-PR enforcement, documentation release gates, and version archives remain deferred until the first ShowMesh release workflow exists. The editorial and review contract applies now.
