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

```sh
showmeshctl audio settings get
showmeshctl audio settings set --help
showmeshctl audio node get <node-id>
showmeshctl audio node set <node-id> --help
```

## What playback does

Only a Show-role audio session can start LTC. The node starts timecode from the configured or per-session offset plus the session's current playback position. It reports LTC as running only after downstream output confirmation. If LTC cannot start, program audio continues and the node reports the LTC outcome separately.

Cue activation keeps audio and timecode together: the node starts the Cue's audio asset, seeks to the observed Cue position, and derives LTC from that same session rather than a separate timing source.

## Rate and receiver limits

All supported rates are non-drop-frame, including `29.97`. A receiver that expects drop-frame timecode at `29.97` can drift during a long session. Choose a rate that every receiving device supports and verify that choice on the receiving device.

## What a future installation must verify

Before treating this path as operational, verify the selected frame rate and offset, program/LTC channel separation, receiver lock, signal-loss behavior, and recovery on the intended equipment. Until then, a successful configuration write or node observation is not a timing acceptance result.

Use this material as an implementation boundary, not an installation recipe. A future operating guide needs real-host acceptance evidence before it can prescribe cabling or show-time recovery.
