---
title: Actions and Macros
description: Build reusable logical controls and inspect every step of an asynchronous macro run.
---

An **action** is one named operation that ShowMesh knows how to send to another system. Instead of placing provider-specific details throughout an operator workflow, you define them once: for example, `start-main-playlist` can mean “ask the configured FPP instance `fpp-main` to start playlist `Main Show`,” while `video-blackout` can mean “send Resolume's blackout operation.”

The action keeps a stable logical ID, operator label and description, show reference, safety class, and complete provider target. A macro can then reference `start-main-playlist` without repeating the FPP instance, primitive, or parameters. If that provider configuration changes, you revise the action while preserving the ID used by macros.

Actions are not schedules or UI buttons by themselves. In the current CLI, actions can be authored and inspected, and configured actions are executed as steps in a macro. Direct FPP and Resolume command endpoints also exist for integration-specific operation and testing.

## Available action integrations

ShowMesh currently accepts three action target types:

| Integration | What an action can describe |
| --- | --- |
| **FPP** | One of eight supported playlist or volume operations against a configured FPP instance. |
| **Resolume** | One of seven supported composition operations using named composition references rather than unstable object IDs. |
| **MQTT** | A publish to a declared integration broker, optionally followed by an expected response on another topic. |

### FPP actions

| Primitive | Operation |
| --- | --- |
| `startPlaylist` | Start a named playlist, optionally repeat it, and choose whether to refuse or replace a different active playlist. |
| `stopPlaylist` | Stop the active playlist immediately. |
| `stopPlaylistGracefully` | Ask FPP to stop gracefully, optionally after the current loop. |
| `pausePlaylist` | Pause the active playlist. |
| `resumePlaylist` | Resume a paused playlist. |
| `nextPlaylistItem` | Advance to the next playlist item. |
| `prevPlaylistItem` | Move to the previous playlist item. |
| `setVolume` | Set FPP volume to an integer from 0 through 100. |

### Resolume actions

| Action | Operation |
| --- | --- |
| `launchClip` | Launch a named clip, with optional deck/layer context and persistent behavior. |
| `clearLayer` | Clear a named layer. |
| `blackout` | Black out Resolume output. |
| `launchColumn` | Launch a named column in a named deck. |
| `selectDeck` | Select a named deck. |
| `setLayerBypass` | Set whether a named layer is bypassed. |
| `setLayerMaster` | Set the master level of a named layer. |

An MQTT action specifies a configured broker, publish topic, payload, QoS, and retain behavior. Its expected response can be `none`, `boolean`, `number`, `text`, or an exact payload `match`, with a response topic and deadline where required. This is a generic integration mechanism, not a built-in vocabulary of device commands.

The coordinator validates the target when an action revision is written. FPP instance and primitive names, MQTT broker IDs, Resolume named references, parameter shapes, and safety-class rules must resolve before the revision is accepted.

## What a macro adds

A **macro** is a saved, ordered recipe of action IDs. Each step adds a step ID and policies for failed or uncertain outcomes; the action itself supplies the provider parameters. Macros can contain up to 32 steps.

For example, a macro could reference actions that select a Resolume deck, launch a clip, and start an FPP playlist. The run dispatches those steps in order and records the outcome of each. It does not make the operations simultaneous, and acceptance of the run does not mean every device operation has completed.

The current runtime supports action execution through FPP, Resolume, and configured integration MQTT brokers. Target and parameter validation happens when configuration is written, so an invalid action should fail before showtime.

## Run safely

```sh
showmeshctl action list
showmeshctl action show <action-id>
showmeshctl action put --file <action.json> <action-id>
showmeshctl macro list
showmeshctl macro show <macro-id>
showmeshctl macro put --file <macro.json> <macro-id>
showmeshctl macro run --follow <macro-id>
```

`action put` and `macro put` write full JSON definitions and require `config:write`. Inspect an existing object with `--output json` when you need the exact accepted shape, and test provider-specific operations before placing them in a show-critical macro.

Submitting a macro returns `202 Accepted`; without `--follow`, acceptance is not completion. Inspect later with:

```sh
showmeshctl run list --macro <macro-id>
showmeshctl run show <run-id>
```

## Failure behavior

A run normally continues after an earlier step fails. A step configured with `onFailure: abort` stops dispatch after a failed outcome; `onUnconfirmed: abort` does the same only for an `unconfirmed` outcome. It does not abort for the distinct `unconfirmable` outcome, which means the provider has no confirmation mechanism. When a policy aborts the run, the remaining steps are recorded as skipped. The final record preserves each step's outcome. Review both policies when cleanup, safety actions, or later device commands depend on whether execution continues.

FPP and Resolume steps use their evidence-confirmed command paths. A confirmation timeout is an uncertain outcome: inspect the device and fresh observations before repeating a command that may already have taken effect.
