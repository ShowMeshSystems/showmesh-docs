---
title: Playlists
description: Arrange Cues for FPP or ShowMesh audio and read FPP-backed readiness.
pageType: concept
maturity: experimental-active
---

A **Playlist** is a revisioned `show.playlist` object that orders one or more [Cues](../cues/) for a Show. Each entry has a unique ID. A Cue can appear more than once at different positions.

## Choose a runner

Every Playlist uses one runner:

- **FPP** binds to an FPP instance UUID, playlist name, and imported canonical playlist hash. Its entries use unique positions within each FPP section.
- **ShowMesh audio** plays through the audio-node path. It has no FPP binding and can repeat once or repeat the full Playlist.

For an FPP Playlist, choose what happens when the imported FPP definition does not match: hold the current state, black and silence, or activate a same-Show safe Cue. The safe-Cue option requires a Cue from the same Show.

```sh
showmeshctl playlist list --show <show-id>
showmeshctl playlist get <playlist-id>
showmeshctl playlist set <playlist-id> --help
showmeshctl playlist revisions <playlist-id>
```

## What readiness does

`showmeshctl fpp playlist-readiness <playlist-id>` checks an FPP-backed Playlist against the imported definition, Cue identity, current playback evidence, render assignment, and node state. It is a read-only preflight result. It does not start playback or change FPP.

## What a Playlist does not do

A Playlist defines order and runner-specific behavior. It does not become a calendar or replace FPP's schedule. Use [Show Night](../show-night/) to define a night lifecycle around selected Playlists, and let FPP retain its scheduling and playhead role.
