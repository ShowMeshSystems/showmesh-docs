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
| `night fade-out` | **Fade out night**: fades the lights and projections, then stops FPP. During a show, that show becomes the final show and the fade waits for it to end. |
| `night power-down` | **Power down presentation**: stops the night without the Fade Out Night fade, then runs the [shutdown sequences](../site-power/) and end session actions. During a show, waits until that show ends. |
| `night end-session` | Abandons the session to `stopped` without stopping devices, preserving degraded evidence. Runs end session actions only when no fade out or power down was requested. |
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

## Transition Steps

A Transition Step invokes a same-Show action with timing and failure policy. Use a [Cue](../cues/) for reusable show output and an [Action](../actions-and-macros/) for a reusable provider operation.

The first outward-facing step can require stored retry-safety policy.

## Site actions

A Night Session can run actions when the site is prepared, add its own shutdown sequences to power down, and run end session actions after the night is over. [Site power and site actions](../site-power/) explains when each list runs, how failures are handled, and which list a step belongs in.

## Presentation timing

Author the definition under **Shows → your Show → Night Session**; use **Show Night** to operate it. The resting sequence's length sets the resting cycle duration. Select the sequence and target that match the intended resting output.

The **Transition timing** group sets these values. Times are in milliseconds. A fade must be between 1 second and 24 hours; leave a fade empty to turn it off.

| Setting | Effect |
| --- | --- |
| **Blackout hold (ms)** | The show starts this long after the switch point: the end of the resting sequence, or the end of the Start night lead-in for the first show. Fade Out Night and power down also wait at least this long before stopping FPP. |
| **Blackout after show (ms)** | After a show ends, the enter-resting steps start right away. The resting playlist and the lights fade-in wait this long. |
| **Lights fade-out (ms)** | The lights fade to dark, finishing at the switch point. This applies to the first show of the night as well, fading over pre-show's resting playback. |
| **Lights fade-in (ms)** | The lights go dark at the end of the blackout, then fade up once the resting playlist start is sent. |
| **Projection fade-out (ms)** | Rendered projections fade out with the same timing as the lights. Empty uses the lights fade-out time. Set only this to fade projections without fading the lights. |
| **Projection fade-in (ms)** | Rendered projections fade in with the lights. Empty uses the lights fade-in time. |
| **Fade Out Night (ms)** | How long Fade Out Night fades the lights before stopping FPP. Empty uses the lights fade-out time. Projections use this value, then the projection fade-out, then the lights fade-out. |

Projection fades apply only to surfaces a ShowMesh render node draws. They do not fade Resolume; use a [Resolume layer fade](../../integrations/resolume/#fade-a-layer) in a transition step for that. A surface left dimmed returns to full on its own two minutes after its fade ends, unless a held blackout such as a weather delay applies.

A lighting Cue with its own fade time is refused in the enter-show steps when **Lights fade-out** is set, and in the enter-resting or end-of-night steps when **Lights fade-in** is set, because both would fade the same lights.

Readiness lists each configured lights fade as healthy, and warns only when the fade-out and fade-in together are longer than the resting sequence.

### The first show

**Start night** leads the first show by the longest of the lights fade-out, the projection fade-out, and the earliest negative enter-show step offset. The fade runs over pre-show's resting playback. With none of these set, the show starts immediately.

The **Start night** dialog can skip the lead-in. The show then starts at once with no fade. An announcement Cue still plays.

### After the last show

**Request final show** makes the next normally timed show the last one. When it ends:

1. The steps chosen under **Cues after the last show** start, timed from the end of the show:
   - **Run the enter resting cues** (the default) runs the same enter-resting steps as after every other show.
   - **Run no cues** starts only the end-of-night playlist.
   - **Run end-of-night cues** runs a separate **Enter end of night** list, such as a different Resolume resting look. This option requires at least one step.
2. The night waits for **Blackout after the last show (ms)**. Leave it empty to use **Blackout after show**.
3. The **End-of-night playlist** starts. Empty uses the resting playlist. It repeats only when **Repeat the end-of-night playlist** is ticked.
4. The lights and projections fade in over their fade-in times.
5. Once FPP is seen playing the end-of-night playlist, the night enters `end-of-night-resting` and stays there until **Fade out night** or **Power down presentation**.

Readiness reports which steps will run after the last show.

### Fade out night

**Fade out night** (`night fade-out`) ends the presentation:

1. The enter-show steps run again, without announcement Cues. Use them to bring Resolume and other outputs to black.
2. Rendered projections and the lights fade to dark over the Fade Out Night time.
3. When the longest of the blackout hold and both fades has passed, ShowMesh sends FPP Stop to the resting FPP, or to the show FPP when no resting FPP is set.
4. The night reports `stopped` only after FPP is seen idle. If that does not happen within 90 seconds, the session is marked degraded and the stop is retried.

Requested during a show, **Fade out night** makes that show the final show and waits for it to end. The end-of-night steps and playlist are then skipped, and the night fades out directly.

**Power down presentation** follows the same steps without the lights and projection fades, then runs the night's [power down and end session actions](../site-power/#power-down).

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
