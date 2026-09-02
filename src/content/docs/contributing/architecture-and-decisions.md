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
- Show Mode and Program Mode are one installation-wide value. A subsystem may read the mode and change its own behavior; it may not hold a private notion of whether a show is running.
- A signed FPP fallback program lets FPP preserve a previously authorized, pre-resolved Cue path during a coordinator outage. It grants no general command authority to FPP or to a node, and normal coordination resumes only at the next scheduled-show boundary.
- An installation may declare more than one audio node, each with a role, but exactly one node may carry the program-and-LTC role. Program audio and LTC still share one clock domain.

These are summaries for orientation. The ADR register and engineering specifications in the main repository remain authoritative.

## Verify claims against the implementation

Repository documents can contradict one another during active development. Resolve the claim against the implementation, tests that would fail if the behavior vanished, the OpenAPI description for public HTTP behavior, and captured running-system evidence. If uncertainty remains, label it rather than choosing the most polished prose.
