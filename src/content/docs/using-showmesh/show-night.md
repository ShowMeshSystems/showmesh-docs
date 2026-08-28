---
title: Show Night
description: Prepare, run, and end one night while FPP retains schedule authority.
pageType: concept
maturity: experimental-active
complexity: advanced
---

**Show Night** is the operator name for a revisioned `night.session` configuration and its lifecycle. It selects a Show, resting and end-of-night FPP Playlists, per-target timeline assets, optional background audio, and named **Transition Steps**. A Transition Step can invoke a same-Show action with an offset, fade, barrier, failure behavior, and announcement policy.

Show Night does not contain calendar dates, time zones, cron expressions, or manually entered resting durations. FPP remains responsible for schedule, playlist selection, and playhead.

## What starting a night does

The lifecycle provides these named operations:

1. Prepare the site.
2. Run readiness.
3. Start pre-show.
4. Start the night.
5. Request the final show.
6. Fade out the night.
7. Power down the presentation.
8. End the session.

If the session is degraded, the safe ending operations remain available while other lifecycle commands are refused. This gives an operator a controlled way to end the night without claiming that the system is healthy.

## Background audio and Transition Steps

Background audio can contain ordered items with a repeat policy (`none`, `item`, or `playlist`), a resume policy (`resume` or `restart`), and a transition (`sequential`, `gapless`, or `crossfade`). A crossfade can include its own duration and a maximum gain.

Transition Steps describe changes within the night. They are not independently revisioned Cues: use a [Cue](../cues/) for a reusable render/audio/LTC/announcement definition, and use a Transition Step for a same-Show action in the night lifecycle.

```sh
showmeshctl night list
showmeshctl night get <night-id>
showmeshctl night set <night-id> --help
showmeshctl night status
```
