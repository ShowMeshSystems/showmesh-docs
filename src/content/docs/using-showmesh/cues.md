---
title: Cues
description: Define the render, audio, LTC, or announcement output for one point in a Show.
pageType: concept
maturity: experimental-active
---

A **Cue** is a revisioned `show.cue` object that describes what one point in a Show presents or plays. It belongs to one Show and can contain render output, audio output, LTC output, or an announcement. A Cue must contain at least one output.

## What a Cue can contain

- **Render** names a logical sequence for the Show.
- **Audio** names an asset from the same Show and an optional start offset.
- **LTC** adds a timecode offset to the Cue's audio output.
- **Announcement** plays audio over an existing source with a duck, mix, or interrupt policy.

LTC requires audio. Announcements also require audio, and one Cue cannot combine LTC and an announcement. These limits keep one Cue's audio behavior clear.

Each of `outputs.audio`, `outputs.ltc`, and `outputs.announcement` also accepts an optional `target` naming an `audio.node` id. Omitted, a target resolves later to the installation's single `program+ltc` audio node, which keeps a one-node installation's Cues unchanged. A `target` naming an `audio.node` that does not exist is refused at write time. See [Audio Nodes](../node-types/audio-nodes/) for node roles.

Use the UI or the CLI to manage Cues:

```sh
showmeshctl cue list --show <show-id>
showmeshctl cue get <cue-id>
showmeshctl cue set <cue-id> --help
showmeshctl cue revisions <cue-id>
```

## What activation does

Activating a Cue applies its selected outputs to the node or runner that receives it. For an audio Cue, the node prepares the configured asset, starts it, seeks to the observed Cue position, and uses that same audio session when LTC is configured.

Activation does not create a schedule or choose when FPP advances. A Playlist or Show Night provides that larger sequence; FPP remains the schedule and playhead authority for FPP-backed playback.

While [Show Mode](../show-mode/) is `show`, a Cue's activation authorization is pinned to the active Show, generation, and catalog revision at the moment show mode began authorizing that Show. A Cue edited after that point stays staged: the edit does not reach any node until the show restarts. `program` mode keeps resolving Cue authorization live.

## Cue catalog

A node's **Cue catalog** is the coordinator's resolved set of Cues for that node, deployed and acknowledged separately from readiness:

```sh
showmeshctl cuecatalog get <node-id>
showmeshctl cuecatalog acknowledge <node-id> <revision> --show <show-id> --generation <n>
showmeshctl cuecatalog deploy <node-id>
```

`deploy` pushes the coordinator's current resolved catalog to a node and requires the `cuecatalog:deploy` scope (admin only). `acknowledge` records which catalog revision a node reports holding; it requires `node:observe`, not a readiness scope, and acknowledging a revision is not itself evidence that a show is ready to run. Use [Playlists](../playlists/)'s readiness check for that.

## Use Cues with other Show objects

Add Cues to a [Playlist](../playlists/) when they need a defined order. Use them in [Show Night](../show-night/) Transition Steps when a night needs a named change at a specific point. Keep a Cue scoped to the Show that owns its assets and actions so the reader of a configuration can see its dependencies directly.
