---
title: Actions and macros
description: Author reusable integration operations and inspect every step of an asynchronous macro run.
pageType: concept
maturity: available
complexity: advanced
---

An **action** is one named operation against FPP, Resolume, an integration MQTT broker, or ShowMesh audio. A **macro** is an ordered list of action IDs with explicit failure policies. Both belong to a Show and keep revision history.

The Operator UI's Show workspace can create, edit, check, delete, and directly invoke actions, and can create and run macros. `showmeshctl` exposes the same configuration and execution model for scripts and diagnostics.

## Action integrations

| Integration | What an action describes |
| --- | --- |
| **FPP** | One of eight playlist or volume primitives against a configured FPP instance. |
| **Resolume** | One of seven composition operations using stable named references. |
| **MQTT** | A publish to a configured integration broker, optionally with response evidence. |
| **Audio** | One audio session, gain, or output command for one or more configured audio nodes. |

FPP primitives are start, immediate stop, graceful stop, pause, resume, next item, previous item, and volume. Resolume operations are launch clip, clear layer, blackout, launch column, select deck, layer bypass, and layer master.

MQTT actions declare a broker, topic, payload, QoS, retain behavior, and optional response contract. Publish success does not prove the external device changed state unless the action also has meaningful response evidence.

Audio actions use one of these operation names:

- `audio.session.apply`, `prepare`, `start`, `pause`, `resume`, `seek`, `advance`, `stop`, or `clear`;
- `audio.gain.set` or `audio.gain.fade`;
- `audio.output.mute` or `audio.output.unmute`.

An audio target names an audio session and one node ID or a list of node IDs. Multi-node Night and announcement consumers use every listed node; other direct consumers dispatch to the first listed node. Gain parameters are decibels: `gainDb` for set and `targetGainDb` for fade.

## Validation and safety

The coordinator validates action targets when a revision is written. It rejects unresolved FPP instances, MQTT brokers, Resolume references, audio nodes, unsupported operation names, invalid parameters, or safety-class conflicts before the action becomes active.

An action can declare whether it is idempotent. This tri-state value is primarily consumed by Show Night's first-outward-cue gate:

- omitted or `null`: not declared;
- `true`: retrying with the same effect is safe;
- `false`: retrying may not be safe.

## Author actions

Open a Show, select **Automation**, and use the Actions section to create or edit an action. The page shows whether the current principal may author, check, invoke, or run the selected objects.

```sh
showmeshctl action list --show <show-id>
showmeshctl action show <action-id>
showmeshctl action put --file <action.json> <action-id>
showmeshctl action delete --confirm <action-id>
```

Writes are full replacements and use revision preconditions by default. Deletion creates a tombstone and preserves server-side history, although this CLI group does not yet expose a revisions reader. Deleting an action does not rewrite a macro or Night Session that referenced it, so check those bindings before showtime.

## Check and invoke directly

Checking resolves stored targets without dispatching:

```sh
showmeshctl action check <action-id>
showmeshctl action check --show <show-id>
```

Exit code `29` means at least one checked binding is broken. An `unknown` result is distinct: the check could not establish an answer.

Direct invocation uses the action's stored target:

```sh
showmeshctl action invoke <action-id>
```

It requires `show:action:invoke`. Use `--revision` when a durable caller must execute an exact revision rather than whichever revision is active at invocation time.

## Build and run macros

A macro contains up to 32 ordered steps. Each step names an action and chooses what to do after failed or uncertain evidence. The run dispatches steps in order; it is not a simultaneity mechanism.

```sh
showmeshctl macro list
showmeshctl macro show <macro-id>
showmeshctl macro put --file <macro.json> <macro-id>
showmeshctl macro delete --confirm <macro-id>
showmeshctl macro run --follow <macro-id>
```

Submitting a run returns `202 Accepted`. Without `--follow`, acceptance is not completion. Inspect retained runs with:

```sh
showmeshctl run list --macro <macro-id>
showmeshctl run list --show <show-id>
showmeshctl run show <run-id>
```

`run list` contains summaries; `run show` contains every step's command and outcome evidence.

## Failure behavior

A macro normally continues after a failed step. `onFailure: abort` stops after failure; `onUnconfirmed: abort` stops after an unconfirmed outcome. The separate `unconfirmable` outcome means the provider has no confirmation mechanism and is not treated as `unconfirmed`.

FPP and Resolume use evidence-confirmed command paths. A timeout may mean the operation happened but confirmation arrived late. Inspect fresh device and coordinator evidence before retrying a non-idempotent action.
