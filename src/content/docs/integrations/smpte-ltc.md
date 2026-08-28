---
title: SMPTE / LTC
description: Experimental audio-node LTC configuration and the uncommissioned physical timing boundary.
pageType: integration
maturity: experimental-testing
---

:::caution[Physical timecode behavior is unverified]
Current source has audio-node LTC configuration and an LTC-generation path. It does not establish a commissioned physical route, a receiving-device lock, signal-loss behavior, or a supported production timing workflow.
:::

Audio settings include an LTC frame rate and start offset. An audio-node declaration can include a program route and an LTC route/channel in one declared clock domain; a program-only declaration omits the LTC route and channel. The coordinator refuses a declaration whose selected routes are not advertised by that node.

The current software contract does not prove an LTC receiver is locked. Keep timing and recovery decisions inside the system that owns the physical connection until an installation has verified frame rate, channel separation, clock relationship, signal loss, and recovery.

## What a future installation must verify

Before treating this path as operational, verify the selected frame rate and offset, program/LTC channel separation, receiver lock, signal-loss behavior, and recovery on the intended equipment. Until then, a successful configuration write or node observation is not a timing acceptance result.

Use this material as an implementation boundary, not an installation recipe. A future operating guide needs real-host acceptance evidence before it can prescribe cabling or show-time recovery.
