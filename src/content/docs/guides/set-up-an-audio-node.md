---
title: Audio Node Preview
description: Understand the intended audio-node model without treating planned implementation work as a deployable install path.
pageType: roadmap
maturity: planned
---

There is no supported audio-node installation path today. This page exists to prevent a particularly dangerous documentation failure: turning planned design and isolated implementation work into instructions that put sound on a live system.

:::caution[Planned — do not deploy]
ShowMesh has no released, sound-producing audio-node workflow. Implementation state alone does not establish safe routing, complete command behavior, LTC lifecycle handling, hardware support, or playback readiness. No physical interface or public operating path has been commissioned.
:::

## What the preview establishes

The planned model establishes these proposed boundaries:

- audio files would be stored locally and played on the audio node's own clock, never streamed as real-time PCM through MQTT or the coordinator;
- FPP would remain the schedule and show-timeline authority, while audio would align at start and explicit correction points rather than continuously changing rate;
- program audio and LTC would use a shared clock domain, normally one interface with stereo program on channels 1–2 and LTC on a discrete channel;
- audio-device failure would fail silent rather than automatically fall back to a potentially unsafe output path;
- node readiness would require proof of assets, routes, channel separation, clock relationship, and live engine evidence—not merely that Linux lists a device.

These are intended safety and authority boundaries. They are not evidence that a particular ALSA, PipeWire, GStreamer, amplifier, FM path, or Resolume LTC input has been commissioned.

## Do not attempt these yet

Do not use preview material to:

- select or commission a production audio interface;
- rely on any audio session, mixing, fade, or LTC command to affect a real output;
- infer clock alignment from configuration or from two buses reporting usable;
- use a ShowMesh audio node as a fallback for a live event;
- document an installation command sequence as though it produces audio.

Any preview that reaches an audio configuration object establishes configuration only, not playback readiness.

## What must change before this becomes an install guide

1. The coordinator-to-agent command contract must work end to end.
2. A real pipeline-control backend must be selected and implemented.
3. Live LTC generation must be completed and wired into the session lifecycle.
4. An audio interface and its program/LTC routing must be commissioned on hardware.
5. Program-to-LTC alignment, long-run drift, device-loss behavior, and physical output separation must be measured.
6. The Operator UI needs its promised configuration and evidence surfaces.
7. The resulting work must receive a supported release and installation path.

Until then, use the [Audio Nodes](../../using-showmesh/node-types/audio-nodes/) page for the intended model and [the roadmap](../../getting-started/roadmap/) for the public-release work that remains.
