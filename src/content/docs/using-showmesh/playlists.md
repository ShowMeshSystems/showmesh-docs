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

## Import FPP playlist definitions

An FPP-backed Playlist binds to an imported playlist definition rather than reading FPP live on every check. Import and inspect that definition, and the entry observations the coordinator has reconciled against it, with:

```sh
showmeshctl fpp playlist-definitions list
showmeshctl fpp playlist-definitions get <instance-id> <playlist-hash>
showmeshctl fpp playlist-definitions entries <instance-id> <playlist-hash>
showmeshctl fpp playlist-entry-observations list
showmeshctl fpp playlist-entry-observations reconciliation <instance-id>
```

These are read-only.

## What readiness does

`showmeshctl fpp playlist-readiness <playlist-id>` checks an FPP-backed Playlist and reports the first of these conditions that fails, in order: the imported definition is present (`definition-missing`); the entry's position and filenames still match that definition (`entry-not-in-definition`, `entry-filename-mismatch`); the stored definition itself has not been superseded by a newer import (`definition-superseded`); the Cue behind the entry is ready (`cue-not-ready`); the latest FPP observation's playlist hash still matches the bound hash (`observation-hash-mismatch`); fresh evidence exists at all (`evidence-unavailable`); the assigned render node actually holds the entry's render assignment (`node-render-unassigned`); the node's Cue catalog is current (`node-catalog-stale`); no conflicting exclusive claim exists (`exclusive-claim-conflict`); the installation's LTC emitter is unambiguous (`audio-ltc-emitter-ambiguous`); and an audio output's `target` resolves to a real, bound node (`audio-target-unbound`, `audio-target-unresolved`) with its assets present (`assets-missing`). This is a read-only preflight result. It does not start playback or change FPP.

## What a Playlist does not do

A Playlist defines order and runner-specific behavior. It does not become a calendar or replace FPP's schedule. Use [Show Night](../show-night/) to define a night lifecycle around selected Playlists, and let FPP retain its scheduling and playhead role.
