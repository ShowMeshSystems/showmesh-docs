---
title: Show Night
description: Configure and understand one operating night while FPP retains scheduling authority.
pageType: concept
maturity: experimental-active
complexity: advanced
---

**Show Night** combines revisioned `night.session` configuration with its operating lifecycle. It selects the Show, FPP Playlists, optional audio beds, transitions, announcements, site actions, and interlocks.

FPP remains responsible for calendar scheduling, Playlist selection, and playhead position.

## Lifecycle

`inactive` → `preparing` → `preshow` → `transition-to-show` → `live` → `transition-to-resting` → `resting-intershow` → `end-of-night-resting` → `fading-out` → `stopped`

| Command | Effect |
| --- | --- |
| `night prepare-site` | Opens a new preparation epoch; preserves FPP playback unless `--stop-fpp-playback` is supplied. |
| `night readiness` | Runs readiness for the current epoch. |
| `night preshow` | Enters the configured pre-show presentation. |
| `night start` | Authorizes the night after current-epoch readiness. |
| `night final-show` | Stops admitting new shows after one final complete show. |
| `night fade-out` | Fades the presentation and stops FPP; during a show, waits until that show ends. |
| `night power-down` | Closes the session after playback and fade stop. |
| `night end-session` | Abandons the session to `stopped` without stopping devices, preserving degraded evidence. |
| `night resume-show` | Clears a Stop hold and starts the show playlist from its first song. |

## Preparation and readiness

Every `prepare-site` creates a new epoch. Earlier readiness results do not apply.

The **Prepare site** dialog starts with its stop-FPP option checked. Leave it off when FPP's own schedule started playback that must continue. The CLI preserves playback unless you pass `--stop-fpp-playback`.

`night start` requires current-epoch readiness. It reruns a stale result automatically and refuses to start when the fresh check fails.

Readiness can be:

- `ready`: required checks passed;
- `ready_with_warnings`: starting is allowed, but degraded evidence remains visible;
- refused or failed: the night cannot start until the named condition is resolved.

Readiness checks only the FPP and Resolume instances selected for the active Show.

ShowMesh can deploy stale Cue catalogs. Exclusive-claim conflicts require an explicit, revision-specific override.

## Background audio

Background audio can be inline or reference a media playlist. It supports order, repeat/resume policy, transitions, gain limits, and show-boundary fades.

A bed can target several audio nodes. ShowMesh prepares them for one shared instant and reports alignment per node.

Show Night and `showmeshctl night status` list the configured background audio before the night starts, and identify speakers that should be playing but are not, with the reason. After an agent restart or host reboot, a node can rejoin the running bed at the other speakers’ track and position. A node waiting for its file joins when the file arrives. An operator’s deliberate stop is respected.

Announcements can likewise target several nodes and start at one shared instant. LTC remains a one-node output.

The end-of-night resting playlist repeats only when the session sets `endOfNightRepeat`. Check that setting before relying on continued resting playback.

## Transition Steps

A Transition Step invokes a same-Show action with timing and failure policy. Use a [Cue](../cues/) for reusable show output and an [Action](../actions-and-macros/) for a reusable provider operation.

The first outward-facing step can require stored retry-safety policy.

## Presentation timing

Author the definition under **Shows → your Show → Night Session**; use **Show Night** to operate it. The resting sequence's length sets the resting cycle duration. Select the sequence and target that match the intended resting output.

Blackout hold and blackout-after-show set transition timing. Optional lights fade-out finishes as the resting sequence ends before a show; lights fade-in begins when resting playback starts after a show. Leaving either fade empty disables that fade. Check the selected enter-show and return-to-resting steps before starting.

The **Start night** dialog can skip the lead-in. An announcement Cue still plays when this option is selected.

## Stop and weather holds

[Emergency Stop](../emergency-stop/) holds the active Night against automatic playback restart. Resume requires a deliberate command and starts the show playlist from its first song. A [weather delay](../../guides/handle-a-weather-delay/) also inhibits output starts; its Resume and cancellation recovery have separate behavior.

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

A restart or contradictory evidence can mark the session degraded and block forward transitions. Closing commands remain available.

To restart the operating flow after `end-session`, open a new preparation epoch and run readiness again.

Use [Run a Show Night](../../guides/run-a-show-night/) for the operating procedure, [Show Night troubleshooting](../../troubleshooting/show-night/) for refusals, and [Emergency Stop](../emergency-stop/) for immediate FPP/audio/Resolume intervention.
