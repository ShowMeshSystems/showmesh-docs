---
title: Audio Node Overview
description: Understand experimental audio-node configuration, sessions, and output behavior.
pageType: procedure
maturity: experimental-testing
---

ShowMesh has experimental audio-node software for configuration, session commands, gain and output control, and LTC generation. This overview explains the model before you configure a node.

## Before you start

Have a registered native node with the audio role available, the audio assets for the intended session, and the program route names supplied by that node.

## What the audio node does

The current design and software behavior establish these boundaries:

- audio files stay local to the audio node and are never streamed as real-time PCM through MQTT or the coordinator;
- FPP remains the schedule and show-timeline authority, while audio aligns at start and explicit correction points rather than continuously changing rate;
- program audio and LTC use a declared shared clock domain where LTC is configured;
- audio-device failure fails silent rather than automatically falling back to another output;
- node readiness combines assets, routes, channel separation, clock relationship, and current engine evidence.

## What to configure

1. Add a native node and select its audio role.
2. Choose the program route and, when needed, a separate LTC route and channel.
3. Configure gain, fade, ducking, and drift behavior with the audio-node settings.
4. Synchronize the audio assets needed by the session.
5. Start and observe the session through the audio-node commands.

Audio files remain local to the node. ShowMesh coordinates the session and observes its state; it does not stream real-time PCM over MQTT or through the coordinator.

## Confirm the setup

The node should display the selected routes and current engine evidence, and the session should report the expected asset and playback state.

## Where to go next

Use [Audio Nodes](../../using-showmesh/node-types/audio-nodes/) for the full configuration model, and [SMPTE / LTC](../../integrations/smpte-ltc/) for timecode-specific behavior.
