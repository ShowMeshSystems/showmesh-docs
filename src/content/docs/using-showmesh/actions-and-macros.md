---
title: Actions and macros
description: Author reusable integration operations and inspect every step of an asynchronous macro run.
pageType: concept
maturity: available
complexity: advanced
---

An **action** is one named FPP, Resolume, MQTT, or audio operation. A **macro** runs actions in order with stored failure policies. Both belong to a Show and keep revision history.

Use the Show workspace to author and run them, or `showmeshctl` for scripts and diagnostics.

## Action integrations

| Integration | What an action describes |
| --- | --- |
| **FPP** | One of eight playlist or volume primitives against a configured FPP instance. |
| **Resolume** | One of seven composition operations using stable named references. |
| **MQTT** | A publish to a configured integration broker, optionally with response evidence. |
| **Audio** | One audio session, gain, or output command for one or more configured audio nodes. |

FPP supports playlist transport and volume. Resolume supports clip, layer, column, deck, and blackout operations. MQTT actions define a publish and optional response contract; publish success alone does not prove an external effect.

Audio actions use one of these operation names:

- `audio.session.apply`, `prepare`, `start`, `pause`, `resume`, `seek`, `advance`, `stop`, or `clear`;
- `audio.gain.set` or `audio.gain.fade`;
- `audio.output.mute` or `audio.output.unmute`.

An audio target names a session and one or more nodes. Night and announcement consumers use every listed node; other direct consumers use the first. Gain values are decibels.

## Validation and safety

The coordinator validates targets and parameters before activating a revision. Invalid or unresolved bindings are rejected.

An action can declare whether it is safe to repeat. Show Night uses this for the first outward-facing step:

- omitted or `null`: not declared;
- `true`: retrying with the same effect is safe;
- `false`: retrying may not be safe.

## Author actions

Open a Show and select **Automation** to create or edit an action. The page reflects the current principal's permissions.

```sh
showmeshctl action list --show <show-id>
showmeshctl action show <action-id>
showmeshctl action put --file <action.json> <action-id>
showmeshctl action delete --confirm <action-id>
```

Writes are full replacements protected by revision checks. Deletion preserves history but does not update macros or Night Sessions that reference the action. Check those bindings before showtime.

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

Invocation requires `show:action:invoke`. Use `--revision` when the caller must execute an exact revision.

## Build and run macros

A macro contains up to 32 ordered steps, each with policies for failed or uncertain evidence. Macros are sequential, not simultaneous.

```sh
showmeshctl macro list
showmeshctl macro show <macro-id>
showmeshctl macro put --file <macro.json> <macro-id>
showmeshctl macro delete --confirm <macro-id>
showmeshctl macro run --follow <macro-id>
```

Submitting returns `202 Accepted`, not completion. Use `--follow` or inspect the retained run:

```sh
showmeshctl run list --macro <macro-id>
showmeshctl run list --show <show-id>
showmeshctl run show <run-id>
```

`run list` returns summaries; `run show` returns step evidence.

## If a run fails

A macro normally continues after failure. `onFailure: abort` or `onUnconfirmed: abort` changes that behavior. `unconfirmable` means the provider has no confirmation mechanism; it is distinct from `unconfirmed`.

A timeout can mean the operation happened but confirmation arrived late. Inspect fresh evidence before retrying a non-idempotent action.
