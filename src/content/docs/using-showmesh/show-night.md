---
title: Show Night
description: Configure and understand one operating night while FPP retains scheduling authority.
pageType: concept
maturity: experimental-active
complexity: advanced
---

**Show Night** is a revisioned `night.session` configuration plus its recorded lifecycle. It selects a Show, resting and end-of-night FPP Playlists, optional local-audio beds, Transition Steps, announcements, site-control actions, and interlocks.

It does not contain calendar dates, time zones, cron expressions, or manually entered resting durations. FPP remains responsible for calendar scheduling, playlist selection, and playhead position.

## Lifecycle

`inactive` → `preparing` → `preshow` → `transition-to-show` → `live` → `transition-to-resting` → `resting-intershow` → `end-of-night-resting` → `fading-out` → `stopped`

| Command | Effect |
| --- | --- |
| `night prepare-site` | Opens a new preparation epoch. |
| `night readiness` | Runs readiness for the current epoch. |
| `night preshow` | Enters the configured pre-show presentation. |
| `night start` | Authorizes the night after current-epoch readiness. |
| `night final-show` | Stops admitting new shows after one final complete show. |
| `night fade-out` | Fades the active presentation and stops FPP. |
| `night power-down` | Closes the session after playback and fade stop. |
| `night end-session` | Provisional unconditional recovery to `stopped`, preserving degraded evidence. |

## Preparation and readiness

Every `prepare-site` creates a new epoch. A prior epoch's readiness result is never adopted.

If readiness is absent, `night start` is refused. If the recorded result is stale, `night start` automatically reruns readiness for the current epoch and uses that fresh result. A failed fresh pass remains a refusal and reports its actual failing check.

Readiness can be:

- `ready`: required checks passed;
- `ready_with_warnings`: starting is allowed, but degraded evidence remains visible;
- refused or failed: the night cannot start until the named condition is resolved.

Readiness respects the active Show's selected FPP and Resolume participation. An instance that does not participate in this Show should not be treated as tonight's required target.

Before and during a night, ShowMesh can auto-deploy stale Cue catalogs. An exclusive-claim conflict requires an explicit operator override for the current catalog revision; it is never silently ignored.

## Background audio

Background audio can be stored inline or reference a `media.playlist`. It supports ordered items, repeat policy, resume/restart policy, sequential/gapless/crossfade transitions, gain limits, and fade timing around show boundaries.

A bed can name several `audio.node` targets. ShowMesh prepares all targets and schedules one shared start instant. Item changes and resume also use each node's media clock while preserving the shared transition instant. Every node reports aligned or unaligned evidence.

Announcements can likewise target several nodes and start at one shared instant. LTC remains a one-node output.

## Transition Steps

A Transition Step invokes a same-Show action with an offset, fade, barrier, failure behavior, and announcement policy. It is not a separately revisioned Cue. Use a [Cue](../cues/) for reusable render/audio/LTC/announcement output and an [Action](../actions-and-macros/) for one reusable provider operation.

The first outward-facing step can require an explicit idempotency declaration so a retry decision is made from stored policy rather than inferred during a live transition.

## Configuration commands

```sh
showmeshctl night list
showmeshctl night get <night-id>
showmeshctl night set --help
showmeshctl night revisions <night-id>
showmeshctl night revision <night-id> <revision>
showmeshctl night activate <night-id>
showmeshctl night deactivate
```

Deletion is refused while the session is active. Cross-object references must belong to the same Show.

## Degraded recovery

A restart or contradictory evidence can mark a session degraded. In that state, ordinary forward transitions are refused. `final-show`, `fade-out`, `power-down`, and `end-session` remain available so an operator can end safely.

To restart the operating flow after `end-session`, open a new preparation epoch and run readiness again.

Use [Run a Show Night](../../guides/run-a-show-night/) for the operating procedure, [Show Night troubleshooting](../../troubleshooting/show-night/) for refusals, and [Emergency Stop](../emergency-stop/) for immediate FPP/audio/Resolume intervention.
