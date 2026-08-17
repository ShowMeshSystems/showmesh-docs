---
title: Audio Nodes
description: Planned ShowMesh nodes for local audience-audio playback, mixing, routing, and LTC generation.
status: planned
---

An **audio node** is the planned authority for audience-facing audio playback on its assigned outputs. It will hold complete audio files locally, play them on its own stable audio clock, mix background, show, and announcement sources, and generate LTC on a discrete output in the same clock domain as program audio.

:::caution[Not currently available]
Track C is specified but has not started. The current agent does not contain an audio engine, playback sessions, audio-device discovery, mixing, LTC generation, or audio readiness checks. Uploading an asset with `mediaType: audio` only stores and synchronizes bytes; it does not make the file playable.
:::

## Planned responsibilities

The audio-node role is intended to provide:

- node-local playback of exact ShowMesh asset hashes;
- media probing before a file is admitted to a playback session;
- background, show, announcement, and manual audio sources;
- ordered playlists, looping, resume/restart policy, and natural-completion evidence;
- gain ceilings, fades, and configured mix, duck, or interrupt behavior;
- stereo program routing and a discrete LTC output from one clock domain;
- playback position, drift, device, route, mix, gain, LTC, and readiness evidence;
- explicit command outcomes for start, stop, pause, resume, seek, restart, fades, and source changes;
- safe supervision and manual recovery when a device or pipeline fails.

Linux is the reference platform for the initial role. GStreamer will perform media decoding and rendering while ShowMesh owns session state, synchronization policy, supervision, health, and operator-visible evidence.

## Planned data flow

1. ShowMesh synchronizes the exact audio assets to the node before an operating session begins.
2. The audio engine probes the local file and verifies that the required route and output capabilities are available.
3. FPP remains the schedule and show-timeline authority. The node aligns at start and at explicit correction points rather than continuously changing playback rate.
4. The node plays and mixes audio locally. Neither the coordinator nor MQTT carries real-time PCM audio.
5. Program audio and LTC leave through separate outputs backed by the same hardware clock.
6. The node publishes fresh session and output evidence for the coordinator and Operator UI.

## Failure behavior

Audio-device loss is designed to **fail silent**. ShowMesh will not automatically return audience audio to FPP or select an unverified standby node. Recovery must verify the intended route, gain, channel separation, clock relationship, required assets, and current session position before sound resumes.

A running local session is intended to survive coordinator or broker loss when all required media and state are already present. A later transition that requires unavailable authority should fail visibly rather than guess.

## Role and output capabilities

The audio role is broader than any single connector. Local program output, FM feed, LTC, and possible future transports are separate capabilities with their own readiness evidence. Dante is not a requirement for the initial role, and a possible future Dante bridge is not currently a supported node type.

Likewise, an audio-capable machine should not be considered ready merely because Linux lists an interface. The planned readiness contract also requires decodable assets, correct channel routing, a discrete same-clock LTC output where required, commissioned physical separation, supported session operations, and fresh engine evidence.

## Deliberate boundaries

- FPP owns the schedule; the audio node owns local playback and its output clock.
- The coordinator orchestrates and observes but never streams program audio.
- Resolume receives LTC through the physical audio path; “LTC generated” is not proof that Resolume received or locked to it.
- Automatic or sample-transparent failover is not promised.
- Real-time audio transport between ShowMesh nodes and real third-party synchronized-audio services are outside the initial role.
