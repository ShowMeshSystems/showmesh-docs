---
title: SMPTE / LTC
description: Configure experimental LTC output and understand its timing and receiver limits.
pageType: integration
maturity: experimental-testing
---

:::caution[Test the receiver before a show]
Verify frame rate, offset, channel separation, receiver lock, signal-loss behavior, drift, and recovery on the equipment used for the show. The measured results linked here cover one installation.
:::

## Configure the output

Audio settings choose the default LTC frame rate and start offset. Supported rates are `24`, `25`, `29.97`, and `30` frames per second. An audio-node declaration chooses a program route and ordered program channels, then optionally a discrete LTC channel on that same route. Omit both LTC fields for a program-only node.

The coordinator checks the selected route against the node's advertised program/LTC capabilities. It refuses a route the node has not reported and refuses an LTC route that differs from the program route.

An installation may declare more than one audio node, but exactly one may carry the `program+ltc` role: program audio and LTC share one clock domain, so there is exactly one LTC generator for the whole installation. Writing a second `audio.node` with the `program+ltc` role is refused at authoring time, naming both node IDs. Other nodes carry the `program` role (program audio only, no LTC) or the `zone` role (an independent local speaker zone, never program or LTC for the main mix).

```sh
showmeshctl audio settings get
showmeshctl audio settings set --help
showmeshctl audio node get <node-id>
showmeshctl audio node set --help
```

## What playback does

Only a Show-role audio session can start LTC. The node starts timecode from the configured or per-session offset plus the session's current playback position. A Cue with an LTC output sets its own **Start offset**, entered as `hh:mm:ss.ff`, and each song starts from its own Cue's offset, including songs started by FPP MultiSync. A Cue without an LTC output clears the offset rather than keeping the previous Cue's. It reports LTC as running only after downstream output confirmation. If LTC cannot start, program audio continues and the node reports the LTC outcome separately.

Cue activation keeps audio and timecode together: the node starts the Cue's audio asset, seeks to the observed Cue position, and derives LTC from that same session rather than a separate timing source.

On one measured installation, the LTC output stayed within two frames of program audio after a start, a seek, and a resume. See [Measured timing behavior](../../reference/measured-timing/) for the values, the conditions they apply to, and how to correct for them in a receiver.

Program audio can target several nodes. For aligned-start requests, the coordinator selects a clock holder, prepares the targets, and schedules one future instant. FPP-backed Cues start from MultiSync with a coordinator fallback; see [Audio nodes](../../using-showmesh/node-types/audio-nodes/#scheduled-starts). Each node reports its start and alignment evidence. LTC remains on the single `program+ltc` node.

`node.clock` selects a managed, external, or FPP-provided PTP relationship and reports lock/holdover evidence. Static output-latency calibration can compensate for measured output-chain delay. Alignment runs retain program-to-LTC drift measurements. These mechanisms expose evidence; they do not prove receiver lock or acoustic alignment without physical observation.

## Rate and receiver limits

All supported rates are non-drop-frame, including `29.97`. A receiver that expects drop-frame timecode at `29.97` can drift during a long session. Choose a rate that every receiving device supports and verify that choice on the receiving device.

## Recover missing timecode

Check that only the intended node has the `program+ltc` role and that its LTC channel is separate from program audio. Confirm a Show-role session is playing and inspect the node's LTC outcome. Restore the route or receiver connection before restarting playback; verify receiver lock and the actual output afterward. Follow [Audio or clock sync is wrong](../../troubleshooting/audio-and-clock-sync/) for diagnosis and [Set up an audio node](../../guides/set-up-an-audio-node/) for routing and clock configuration.
