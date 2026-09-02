---
title: Actions and capabilities
description: Keep node capability claims separate from logical show actions and integration primitives.
pageType: concept
maturity: available
complexity: advanced
---

ShowMesh uses two related but different vocabularies.

## Node capabilities

A capability is a namespaced, versioned claim advertised by a node. It describes what that node can actually perform. The current native agent probes its supported GStreamer/NDI path after connecting to MQTT and can also advertise an explicit capability override. An override disables automatic probing. An empty list is valid on a host without a detected supported path; do not infer an untested hardware role from it.

## Logical show actions

A `show.action` is a named, show-scoped operator concept that binds to an integration primitive. Macros invoke these logical actions rather than embedding protocol details.

The implemented adapters currently support FPP primitives and these Resolume actions:

- `launchClip`
- `clearLayer`
- `launchColumn`
- `selectDeck`
- `blackout`
- `setLayerBypass`
- `setLayerMaster`

Resolume references are validated against an uploaded composition. The CLI can list the current runtime vocabulary with `showmeshctl resolume action list`.

A `show.action` declares an `idempotent` field: `true` or `false` when the author has stated whether repeating the action's effect is safe, or `null` when it has never been declared. `null` is a real, distinct state, not a default of `false`; only an action bound as a night session's outward-facing enter-show cue requires a non-null value, and an ordinary action can stay undeclared indefinitely.

Invoking a stored action outside a macro run (`POST /api/v1/actions/{id}/invocations`, or `showmeshctl action invoke <id>`) requires the `show:action:invoke` scope. `showmeshctl action check [<id>] [--show <id>]` re-resolves one action's or every action's stored target against current integration state without dispatching anything; it needs no credential and exits `29` if any checked binding is broken. A binding whose target cannot currently be evaluated reports "unknown" and never causes that exit code.

## Outcome model

Dispatch and confirmation are distinct. An action can be confirmed, unconfirmed, unconfirmable, refused, or failed depending on the adapter and available evidence. A client must preserve those distinctions; “the HTTP request returned” is not an action-success signal.

## Integration guidance

- Prefer a logical action and a typed binding over embedding raw MQTT topics, REST paths, or device commands in macros.
- Use idempotency keys as the API requires. Reusing one for a different target or payload causes a conflict.
- Treat authorization refusal as a healthy coordinator declining the operation, not as coordinator loss.
- Do not advertise a node capability until the node backs the claim with runtime behavior and evidence.
