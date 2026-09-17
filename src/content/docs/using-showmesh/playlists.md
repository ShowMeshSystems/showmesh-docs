---
title: Playlists
description: Author runner-backed Cue order and reusable local-audio media sequences.
pageType: concept
maturity: experimental-active
---

ShowMesh has two revisioned playlist kinds:

- `show.playlist` orders [Cues](../cues/) and runs through FPP or ShowMesh audio;
- `media.playlist` orders local audio assets for reusable beds and similar node-local playback.

Both appear in the Show workspace's **Playlists** tab, but they remain different objects.

## Show Playlists

Every Show Playlist chooses one runner:

- **FPP** binds to an instance UUID, playlist name, canonical imported hash, and unique positions in FPP's lead-in, main, or lead-out sections.
- **ShowMesh audio** orders Cue-backed local audio and can repeat an item or the full Playlist according to its stored policy.

```sh
showmeshctl playlist list --show <show-id>
showmeshctl playlist get <playlist-id>
showmeshctl playlist set --help
showmeshctl playlist revisions <playlist-id>
showmeshctl playlist delete --confirm <playlist-id>
```

Deletion creates a tombstone and preserves revision history. It is refused when an active Night Session still depends on the Playlist.

## Media Playlists

A media playlist orders local assets with repeat, resume, and transition settings. A Night Session can reuse it as background audio.

```sh
showmeshctl media-playlist list --show <show-id>
showmeshctl media-playlist get <playlist-id>
showmeshctl media-playlist set --help
showmeshctl media-playlist revisions <playlist-id>
showmeshctl media-playlist delete --confirm <playlist-id>
```

Assets must belong to the same Show. The Night Session supplies the target audio nodes.

## FPP definition and observation evidence

An FPP Playlist binds to an imported definition. Inspect or republish it with:

```sh
showmeshctl fpp playlist-definitions list
showmeshctl fpp playlist-definitions get <instance-id> <playlist-hash>
showmeshctl fpp playlist-definitions entries <instance-id> <playlist-hash>
showmeshctl fpp playlist-entry-observations list
showmeshctl fpp playlist-entry-observations reconciliation <instance-id>
showmeshctl fpp republish-playlist-definitions <instance-id>
```

Republish reports request acceptance. Confirm the imported definition afterward.

## Readiness

`showmeshctl fpp playlist-readiness <playlist-id>` is a read-only preflight. It does not start playback.

Readiness checks:

1. a matching stored definition exists;
2. the binding has not been superseded by a newer definition for that instance and name;
3. every referenced section and position exists;
4. filenames match;
5. every Cue resolves to this Show;
6. observation identity is available and matches;
7. render assignments, Cue catalogs, exclusive claims, audio roles and targets, and required assets are ready.

Multi-node audio clock or alignment concerns can produce readiness warnings. A warning remains visible and must not be rewritten as confirmed alignment.

## Ownership boundary

A Playlist defines content order, not a calendar. FPP remains the schedule and playhead authority for FPP playback; [Show Night](../show-night/) manages the operating lifecycle.
