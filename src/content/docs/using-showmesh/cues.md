---
title: Cues
description: Define and activate render, multi-node audio, LTC, or announcement output for one point in a Show.
pageType: concept
maturity: experimental-active
---

A **Cue** is a revisioned `show.cue` object describing what one point in a Show presents or plays. It belongs to one Show and contains at least one render, audio, LTC, or announcement output.

## Output types

- **Render** names a logical sequence in the Show.
- **Audio** names an asset, optional start offset, and optional list of target audio nodes.
- **LTC** adds a timecode offset and keeps one optional target because one installation has one LTC generator.
- **Announcement** names an asset, target nodes, and a duck, mix, or interrupt policy.

LTC requires audio. An announcement also requires audio, and one Cue cannot combine LTC with an announcement.

`outputs.audio.targets` and `outputs.announcement.targets` are lists of distinct `audio.node` IDs. Omitted or empty, the target resolves to the installation's `program+ltc` node. The deprecated singular `target` remains accepted as a one-element list, but new configuration should use `targets`. A payload containing both forms for the same output is refused.

`outputs.ltc.target` remains singular. LTC always runs on exactly one node.

## Author Cues

Open a Show and select **Cues** to create or edit Cues in the Operator UI. The target pickers expose the audio nodes that current configuration allows.

```sh
showmeshctl cue list --show <show-id>
showmeshctl cue get <cue-id>
showmeshctl cue set \
  --show <show-id> \
  --name <name> \
  --outputs-json '{"audio":{"asset":"audience-track","startOffsetMillis":0,"targets":["audio-a","audio-b"]}}' \
  <cue-id>
showmeshctl cue revisions <cue-id>
showmeshctl cue delete --confirm <cue-id>
```

Writes are full replacements and use revision preconditions by default. Every named asset and audio node must resolve when the Cue is written.

## Activate a Cue

```sh
showmeshctl cue activate <cue-id>
```

Direct activation requires `cue:activate`. Live Control uses this path for Announcements; it does not route the activation through a Playlist or an FPP observation.

For multi-node audio or announcement output, the coordinator:

1. resolves every target;
2. ensures each node holds the required asset;
3. reads the shared clock once;
4. prepares all targets before the chosen instant;
5. starts all prepared nodes at that same instant;
6. reports aligned or unaligned evidence for each node.

Unaligned means the Cue ran without verified shared-clock alignment. It is visible degraded evidence, not synchronized success. If one node lacks an asset or cannot be prepared, the result names that node instead of silently treating the group as complete.

Activation does not create a schedule or choose when FPP advances. FPP-backed Playlists and Show Night retain schedule and playhead authority.

## Show Mode

In Show Mode, Cue authorization is pinned to the active Show, generation, and catalog revision established when that Show became authorized. An edit made afterward stays staged until the show restarts. Program Mode resolves the current Cue revision live.

## Cue catalog

Each node holds a resolved **Cue catalog**:

```sh
showmeshctl cuecatalog get <node-id>
showmeshctl cuecatalog deploy <node-id>
showmeshctl cuecatalog acknowledge --show <show-id> --generation <n> <node-id> <revision>
```

Deployment requires the admin-only `cuecatalog:deploy` scope. An acknowledgement records which catalog revision the node reports holding; it is not readiness by itself.

An exclusive-claim conflict blocks deployment unless an operator explicitly overrides that conflict for the current revision. The override is deliberate and revision-specific; it is not a permanent relaxation of catalog safety.

Use Cues in [Playlists](../playlists/) for ordered playback and in [Show Night](../show-night/) for named changes around the night lifecycle.
