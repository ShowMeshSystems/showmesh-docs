---
title: Page-type contracts
description: Minimum content contracts for each kind of ShowMesh documentation page.
pageType: reference
maturity: available
---

Every page declares one of the following `pageType` values. A contract defines information the reader must receive, not mandatory heading text. Combine sections when that improves the page, but do not omit the underlying requirement.

## Procedure

Use `procedure` when the reader follows steps to reach an operational outcome.

Include:

- The outcome and supported scope.
- Prerequisites, permissions, and safety boundaries.
- Ordered actions for the common path.
- Expected observations at consequential steps.
- An end-to-end success check.
- Likely failures and immediate remedies.
- A rollback, stop, or recovery boundary when the task changes durable or show-visible state.

Put explanation after the working path unless readers need it to make a safe choice.

## Troubleshooting

Use `troubleshooting` when the reader starts from a symptom or failed outcome.

Include:

- The exact symptom or failed observation.
- Evidence to preserve before restarting or changing state.
- Diagnostics ordered from low risk and broad signal toward narrower intervention.
- Cause-to-remedy guidance rather than an undifferentiated command list.
- A way to confirm recovery.
- The information to collect before escalation when local recovery is not possible.

## Integration

Use `integration` for a supported or intended connection between ShowMesh and another system.

Include:

- Supported maturity, versions, or platform boundaries that affect use.
- Which system owns configuration, identity, playback, and recovery.
- Network, authentication, and safety prerequisites.
- The configuration path.
- A verification path that distinguishes connection from successful effect.
- Recovery behavior and manual fallback.
- Unsupported behavior and compatibility limits.

A Planned integration documents its boundary and present alternative. It does not provide runnable steps for the future implementation.

## Concept

Use `concept` to explain a product model or help readers interpret behavior.

Include:

- The question or model the page explains.
- The current mental model and its important invariants.
- The boundary between implemented behavior and future intent.
- A concrete example when it clarifies the model.
- Links to the procedures and references readers need next.

Do not bury a complete operational workflow inside a concept page.

## Reference

Use `reference` when readers already know what they need and want exact information.

Include the applicable syntax, defaults, constraints, permissions, errors, exit behavior, compatibility, and deprecation information. Name the normative upstream contract when the page summarizes rather than owns it.

Prefer generated or linked normative material over a copied inventory that can silently drift.

## Landing

Use `landing` to orient an audience and route it to more specific pages.

State who the section serves, what is usable now, where to start, and where known boundaries lie. A landing page is not a link dump and must not be a bare placeholder.

## Roadmap

Use `roadmap` for a present-versus-future capability view.

Separate what works, what is experimental, what requires commissioning, and what is planned. Never turn planned architecture into runnable instructions. Link readers back to the available path.
