---
title: Audio Node Preview
description: Understand the intended audio-node model without treating the unmerged PR as a deployable install path.
status: planned
---

There is no supported audio-node installation path today. This page exists to prevent a particularly dangerous documentation failure: turning an unmerged design and isolated tests into instructions that put sound on a live system.

:::caution[PR #21 is changes requested, not a release candidate]
The audio implementation lives on the unmerged `track-c/audio-node` branch. The coordinator does not pass the required configuration revision to the agent, so session, gain, and output commands fail end to end. Its live LTC-generation seam is incomplete, no real audio pipeline backend is selected, no physical interface has been commissioned, and no sound has been produced.
:::

## What the preview establishes

The branch is useful evidence of the proposed boundary:

- audio files would be stored locally and played on the audio node's own clock, never streamed as real-time PCM through MQTT or the coordinator;
- FPP would remain the schedule and show-timeline authority, while audio would align at start and explicit correction points rather than continuously changing rate;
- program audio and LTC would use a shared clock domain, normally one interface with stereo program on channels 1–2 and LTC on a discrete channel;
- audio-device failure would fail silent rather than automatically fall back to a potentially unsafe output path;
- node readiness would require proof of assets, routes, channel separation, clock relationship, and live engine evidence—not merely that Linux lists a device.

These are intended safety and authority boundaries. They are not evidence that a particular ALSA, PipeWire, GStreamer, amplifier, FM path, or Resolume LTC input has been commissioned.

## Do not attempt these yet

Do not use the branch to:

- select or commission a production audio interface;
- rely on any audio session, mixing, fade, or LTC command to affect a real output;
- infer clock alignment from configuration or from two buses reporting usable;
- use a ShowMesh audio node as a fallback for a live event;
- document an installation command sequence as though it produces audio.

The current branch intentionally reports audio behavior against a fake/unavailable engine. Any apparent setup that reaches an audio configuration object is configuration only, not playback readiness.

## What must change before this becomes an install guide

1. The PR's coordinator-to-agent command contract must work end to end.
2. A real pipeline-control backend must be selected and implemented.
3. Live LTC generation must be completed and wired into the session lifecycle.
4. An audio interface and its program/LTC routing must be commissioned on hardware.
5. Program-to-LTC alignment, long-run drift, device-loss behavior, and physical output separation must be measured.
6. The Operator UI needs its promised configuration and evidence surfaces.
7. The resulting work must merge to `main` and receive a release/installation path.

Until then, use the [Audio Nodes](../../using-showmesh/node-types/audio-nodes/) page for the intended model and [the roadmap](../../getting-started/roadmap/) for the public-release work that remains.
