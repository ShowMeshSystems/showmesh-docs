---
title: Show Night
description: Prepare, run, and end one night while FPP retains schedule authority.
pageType: concept
maturity: experimental-active
complexity: advanced
---

**Show Night** is the operator name for a revisioned `night.session` configuration and its lifecycle. It selects a Show, resting and end-of-night FPP Playlists, per-target timeline assets, optional background audio, and named **Transition Steps**. A Transition Step can invoke a same-Show action with an offset, fade, barrier, failure behavior, and announcement policy.

Show Night does not contain calendar dates, time zones, cron expressions, or manually entered resting durations. Writing a `night.session` that names a calendar, cron, weekday, timezone, or hand-entered rest-duration field is rejected outright: this is a rule about field names, not values, so an operator-authored label or action ID that happens to contain a date or time of day is not a violation. FPP remains responsible for schedule, playlist selection, and playhead.

## Lifecycle states

A Show Night session moves through a closed set of states:

`inactive` → `preparing` → `preshow` → `transition-to-show` → `live` → `transition-to-resting` → `resting-intershow` → `end-of-night-resting` → `fading-out` → `stopped`

## What each lifecycle command does

| Command | Effect |
| --- | --- |
| `night prepare-site` | Opens a new preparation epoch. Required before running readiness or entering pre-show. |
| `night readiness` | Runs readiness for the current preparation epoch and records the result. |
| `night preshow` | Enters the configured pre-show presentation. Requires an unconsumed preparation epoch from `prepare-site`. |
| `night start` | Authorizes the night session. Requires a completed readiness result from the same preparation epoch; a readiness result from a prior epoch is never adopted. |
| `night final-show` | Closes admission after one final complete show. Accepted even while the session is degraded. |
| `night fade-out` | Fades the active presentation out and stops FPP. Accepted even while degraded. |
| `night power-down` | Closes the session after playback and the fade have stopped. Accepted even while degraded. |
| `night end-session` | A provisional operator-recovery action: abandons the current session, reaching `stopped` without clearing its degraded record. The only lifecycle command besides the three above that is accepted while degraded. |

```sh
showmeshctl night status
showmeshctl night prepare-site
showmeshctl night readiness
showmeshctl night preshow
showmeshctl night start
showmeshctl night final-show
showmeshctl night fade-out
showmeshctl night power-down
showmeshctl night end-session
```

### Preparation epochs and readiness

Every `night prepare-site` opens a new preparation epoch. `night start` requires a readiness result recorded against that exact same epoch: a readiness result from a prior epoch, or no readiness result at all, refuses the command with exit code `26` rather than proceeding on stale evidence. Running `prepare-site` again opens a fresh epoch and discards the previous one's readiness result.

### Degraded state and recovery

A session becomes degraded when a restart or contradicting evidence leaves it in a state the coordinator cannot confirm is safe to resume from. While degraded, every lifecycle command is refused with exit code `28` except `final-show`, `fade-out`, `power-down`, and `end-session`. Those four remain the way to end the night through a degraded session. `end-session` is never withheld by an interlock and is the unconditional way to reach `stopped`.

To recover a degraded session, run `night end-session`, then `night prepare-site` to open a fresh preparation epoch and start the lifecycle over.

### Exit codes

| Exit code | Meaning |
| --- | --- |
| `26` | A lifecycle command was refused because a precondition it needs is not yet met (no open preparation epoch, or no fresh readiness result from the current epoch). Run the missing prerequisite command. |
| `27` | A lifecycle command was refused by the closed state table for the session's current state: the command is not simply early, it is not valid from here at all. |
| `28` | A lifecycle command was refused because the session is degraded. See recovery above. |

## Background audio and Transition Steps

Background audio can contain ordered items with a repeat policy (`none`, `item`, or `playlist`), a resume policy (`resume` or `restart`), and a transition (`sequential`, `gapless`, or `crossfade`). A crossfade can include its own duration and a maximum gain. The bed starts when the session enters a resting state and continues through pre-show; at the show boundary it fades toward silence (configurable `fadeOutMs`/`fadeInMs`, both required together or both omitted for an instant cut as before) rather than being cut. `GET /night/session` reports the pinned maximum gain the current configuration applies to the bed.

A background bed and an announcement can each target more than one `audio.node` at once, such as a porch zone and a garage zone both playing the same background music.

Transition Steps describe changes within the night. They are not independently revisioned Cues: use a [Cue](../cues/) for a reusable render/audio/LTC/announcement definition, and use a Transition Step for a same-Show action in the night lifecycle.

```sh
showmeshctl night list
showmeshctl night get <night-id>
showmeshctl night set <night-id> --help
```

## `night.session` shape

`GET /config/night.session/{id}` and a successful write return the fully resolved payload. The required top-level fields are `show`, `label`, `showPlaylist`, `resting`, `enterShow`, and `enterResting`. `announcementDefaultPolicy` is optional and defaults to `duck`:

```json
{
  "show": "<show-id>",
  "label": "Main night",
  "showPlaylist": { "...": "an FPP playlist binding" },
  "resting": { "...": "resting playlist, background audio, and transitions" },
  "enterShow": { "...": "the transition into a live show" },
  "enterResting": { "...": "the transition back to resting" },
  "announcementDefaultPolicy": "duck"
}
```

`siteControl` and `interlocks` are entirely optional; a deployment that omits both runs the whole night loop unchanged. Every cross-object reference this configuration carries (cue actions, the resting timeline asset, every background-audio item, every siteControl action, every interlock signal) must belong to this session's own Show.

See [Emergency Stop](../emergency-stop/) for stopping playout immediately without waiting on this lifecycle; `stop-power-down` and `hard-stop` both force this session toward `stopped` directly.
