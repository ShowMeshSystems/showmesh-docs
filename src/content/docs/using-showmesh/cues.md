---
title: Cues
description: Define and activate render, multi-node audio, LTC, or announcement output for one point in a Show.
pageType: concept
maturity: experimental-active
---

A **Cue** describes what one point in a Show presents or plays. It contains at least one render, audio, LTC, or announcement output and keeps revision history.

## Output types

- **Render** names a logical sequence in the Show.
- **Audio** names an asset, optional start offset, and optional list of target audio nodes.
- **LTC** adds a timecode offset and keeps one optional target because one installation has one LTC generator.
- **Announcement** names an asset, target nodes, and a duck, mix, or interrupt policy.

LTC requires audio. An announcement also requires audio, and one Cue cannot combine LTC with an announcement.

Audio and announcement `targets` contain distinct audio-node IDs. An empty or omitted list uses the `program+ltc` node. The deprecated singular `target` remains accepted, but do not send both forms.

`outputs.ltc.target` remains singular. LTC always runs on exactly one node.

## Author Cues

Open a Show and select **Cues**. Target pickers show the audio nodes allowed by current configuration.

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

Writes fully replace the Cue and use revision checks. Every named asset and audio node must resolve.

## Activate a Cue

```sh
showmeshctl cue activate <cue-id>
```

Direct activation requires `cue:activate`. Live Control uses it for Announcements without involving a Playlist or FPP observation.

For multi-node audio or announcement output, the coordinator:

1. resolves every target;
2. ensures each node holds the required asset;
3. reads the shared clock once;
4. prepares all targets before the chosen instant;
5. starts all prepared nodes at that same instant;
6. reports aligned or unaligned evidence for each node.

`unaligned` means the Cue ran without verified shared-clock alignment. Missing assets and preparation failures are reported per node.

Activation does not schedule playback or advance FPP.

## Show Mode

Show Mode pins Cue authorization to the active Show, generation, and catalog revision. Later edits remain staged until the show restarts. Program Mode resolves the current revision.

## Cue catalog

Each node holds a resolved **Cue catalog**:

```sh
showmeshctl cuecatalog get <node-id>
showmeshctl cuecatalog deploy <node-id>
showmeshctl cuecatalog acknowledge --show <show-id> --generation <n> <node-id> <revision>
```

Deployment requires `cuecatalog:deploy`. An acknowledgement records the revision held by the node; it is not readiness by itself.

An exclusive-claim conflict blocks deployment unless an operator overrides it for that revision.

Use Cues in [Playlists](../playlists/) for ordered playback and in [Show Night](../show-night/) for named changes around the night lifecycle.
