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

`showmeshctl fpp playlist-readiness <playlist-id>` is a read-only preflight for one FPP-backed Playlist. It does not start playback or change FPP. It checks these conditions in order and reports the first one that fails:

| Condition | What it means when reported |
| --- | --- |
| `definition-missing` | No stored FPP playlist definition matches the binding. |
| `entry-not-in-definition` | An entry's section and position do not exist in the stored definition. |
| `entry-filename-mismatch` | An entry's expected filename does not match the definition at that position. |
| `definition-superseded` | A newer definition has been imported for the same instance and playlist name. |
| `cue-not-ready` | The referenced Cue is missing, never activated, or belongs to another Show. |
| `observation-hash-mismatch` | The latest FPP observation carries a different playlist hash than the binding. |
| `evidence-unavailable` | An observation exists but could not establish identity. |
| `node-render-unassigned` | The node holding the surface has no confirmed render assignment for the entry. |
| `node-catalog-stale` | The node has not acknowledged the catalog revision the active Show requires. |
| `exclusive-claim-conflict` | Two Cues that could run concurrently hold the same exclusive resource claim. |
| `audio-ltc-emitter-ambiguous` | More than one `audio.node` holds the `program+ltc` role. |
| `audio-target-unbound` | A Cue output names a target node with no `audio.node` object. |
| `audio-target-unresolved` | A Cue output names no target and no single node can be resolved for it. |
| `assets-missing` | A node that must render or play a Cue does not hold the required asset. |

The same conditions are explained with remedies in [FPP troubleshooting](../../troubleshooting/fpp/).

## What a Playlist does not do

A Playlist defines order and runner-specific behavior. It does not become a calendar or replace FPP's schedule. Use [Show Night](../show-night/) to define a night lifecycle around selected Playlists, and let FPP retain its scheduling and playhead role.
