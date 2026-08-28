---
title: Audio Node Preview
description: Understand experimental audio-node behavior without treating it as a deployable installation path.
pageType: roadmap
maturity: experimental-testing
---

There is no supported audio-node installation path today. This page prevents a particularly dangerous documentation failure: turning experimental software into instructions that put sound on a live system.

ShowMesh has experimental audio-node software for configuration, session commands, gain/output control, and LTC generation.

## What the preview establishes

The current design and software behavior establish these boundaries:

- audio files stay local to the audio node and are never streamed as real-time PCM through MQTT or the coordinator;
- FPP remains the schedule and show-timeline authority, while audio aligns at start and explicit correction points rather than continuously changing rate;
- program audio and LTC use a declared shared clock domain where LTC is configured;
- audio-device failure fails silent rather than automatically falling back to a potentially unsafe output path;
- node readiness requires proof of assets, routes, channel separation, clock relationship, and live engine evidence—not merely that Linux lists a device.

These are the current safety and authority boundaries.

## Do not attempt these yet

Do not use preview material to:

- select a production audio interface from this page alone;
- rely on an audio session, mixing, fade, or LTC command to affect a real output;
- infer clock alignment from configuration or from two buses reporting usable;
- use a ShowMesh audio node as a fallback for a live event;
- document an installation command sequence as though it produces audio.

Any configuration or software observation establishes only that state, not playback readiness or physical LTC lock.

## What must change before this becomes an install guide

1. A supported release and installation path must be produced.
2. The remaining physical LTC limits are documented on the [SMPTE / LTC](../../integrations/smpte-ltc/) page.

Use the [Audio Nodes](../../using-showmesh/node-types/audio-nodes/) page for the software boundary and [the roadmap](../../reference/roadmap/) for the public-release work that remains.
