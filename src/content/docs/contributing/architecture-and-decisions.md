---
title: Architecture and decisions
description: Change durable constraints through ADRs and keep public explanations subordinate to engineering truth.
pageType: concept
---

ShowMesh records durable engineering constraints as Architecture Decision Records in the main repository. If implementation work contradicts an accepted decision, write a superseding ADR; do not silently edit history until it appears consistent.

## Core boundaries to preserve

These are decision constraints, not a list of available product capabilities. Their presence here means implementations must preserve the boundary; it does not claim that every related system or integration is implemented or supported.

- FPP remains the calendar scheduler.
- Desired state and observed evidence are separate.
- The coordinator is not in the real-time media or timing path.
- The public API is an interface, not a UI convenience.
- Nodes are described by capabilities, not hardware categories.
- Operators invoke logical actions; integration adapters own protocol details and confirmation.
- SQLite/configuration internals and MQTT topics are not public client APIs.

These are summaries for orientation. The ADR register and engineering specifications in the main repository remain authoritative.

## Evidence before explanation

Repository documents can contradict one another during active development. Resolve the claim against the implementation, tests that would fail if the behavior vanished, the OpenAPI description for public HTTP behavior, and captured running-system evidence. If uncertainty remains, label it rather than choosing the most polished prose.
