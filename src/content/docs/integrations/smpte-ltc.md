---
title: SMPTE / LTC
description: Configure experimental LTC output and understand its timing and receiver limits.
pageType: integration
maturity: experimental-testing
---

:::caution[Physical timecode behavior is unverified]
Current source has audio-node LTC configuration and an LTC-generation path. It does not prove a physical route, a receiving-device lock, signal-loss behavior, or a supported production timing workflow.
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

Only a Show-role audio session can start LTC. The node starts timecode from the configured or per-session offset plus the session's current playback position. It reports LTC as running only after downstream output confirmation. If LTC cannot start, program audio continues and the node reports the LTC outcome separately.

Cue activation keeps audio and timecode together: the node starts the Cue's audio asset, seeks to the observed Cue position, and derives LTC from that same session rather than a separate timing source.

Program audio can target several nodes. The coordinator selects a clock holder, reads the shared media clock once, prepares every target, and schedules one future start instant. Each node reports whether it used that instant. LTC remains on the single `program+ltc` node.

`node.clock` selects a managed, external, or FPP-provided PTP relationship and reports lock/holdover evidence. Static output-latency calibration can compensate for measured output-chain delay. Alignment runs retain program-to-LTC drift measurements. These mechanisms expose evidence; they do not prove receiver lock or acoustic alignment without physical observation.

## Rate and receiver limits

All supported rates are non-drop-frame, including `29.97`. A receiver that expects drop-frame timecode at `29.97` can drift during a long session. Choose a rate that every receiving device supports and verify that choice on the receiving device.

## What a future installation must verify

Before treating this path as operational, verify frame rate and offset, channel separation, PTP lock and holdover, output-latency calibration, scheduled multi-node starts, receiver lock, signal loss, long-run drift, and recovery on the intended equipment. Until then, a successful configuration write or node observation is not a timing acceptance result.

AES67 is the accepted target for primary program transport in a later architecture stage. The current runtime plays node-local files; do not document AES67 as the active program path.

Use this material as an implementation boundary, not an installation recipe. A future operating guide needs real-host acceptance evidence before it can prescribe cabling or show-time recovery.
