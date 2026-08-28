---
title: Audio Nodes
description: Experimental audience-audio settings, sessions, routes, and output behavior.
pageType: concept
maturity: experimental-testing
---

An **audio node** is the ShowMesh authority for node-local audience-audio playback on configured outputs. Current source includes session, gain, output, routing, and LTC command/configuration paths. It holds complete audio files locally, rather than carrying real-time PCM through the coordinator or MQTT.

See [SMPTE / LTC](../../../integrations/smpte-ltc/) for timecode rates, receiver limits, and the remaining physical-output warning.

## Current software responsibilities

The audio-node role provides configuration and command paths for:

- node-local playback of exact ShowMesh asset hashes;
- media probing before a file is admitted to a playback session;
- background, show, announcement, and manual audio sources;
- ordered playlists, looping, resume/restart policy, and natural-completion evidence;
- gain ceilings, fades, and configured mix, duck, or interrupt behavior;
- stereo program routing and a discrete LTC output from one clock domain;
- playback position, drift, device, route, mix, gain, LTC, and readiness evidence;
- explicit command outcomes for start, stop, pause, resume, seek, restart, fades, and source changes;
- safe supervision and manual recovery when a device or pipeline fails.

Linux is the reference platform. GStreamer performs media decoding and rendering while ShowMesh owns session state, synchronization policy, supervision, health, and operator-visible evidence.

## Configure an audio node

Audio settings set the engine-wide drift threshold, fade curve and duration, background gain ceiling, announcement duck target, LTC frame rate, and default LTC start offset. Audio-node settings choose a program route and ordered program channels, then optionally a separate LTC channel on that same route with a declared clock-domain name and provenance.

```sh
showmeshctl audio settings get
showmeshctl audio settings set --help
showmeshctl audio node list
showmeshctl audio node set <node-id> --help
```

The node must advertise the selected program and LTC routes. A program-only node omits the LTC route and channel. Writes replace the full settings object, so read the current values before changing them.

## Data-flow boundary

1. ShowMesh synchronizes exact audio assets to the node before a session begins.
2. The engine probes the local file and checks the required advertised route/output capabilities.
3. FPP remains the schedule and show-timeline authority. The node performs local audio work; it does not receive a continuous media stream from ShowMesh.
4. Program audio and LTC are configured as separate outputs in one declared clock domain where LTC is used.
5. The node publishes session and output evidence for the selected role.

## Failure behavior

Audio-device loss is designed to **fail silent**. ShowMesh will not automatically return audience audio to FPP or select a standby node. Recovery restores the intended route, gain, channel separation, clock relationship, required assets, and current session position before sound resumes.

A running local session is intended to survive coordinator or broker loss when all required media and state are already present. A later transition that requires unavailable authority should fail visibly rather than guess.

## Role and output capabilities

The audio role is broader than any single connector. Local program output, FM feed, LTC, and possible future transports are separate capabilities with their own readiness evidence. Dante is not a requirement for the initial role, and a possible future Dante bridge is not currently a supported node type.

Likewise, an audio-capable machine should not be considered ready merely because Linux lists an interface. Readiness requires decodable assets, correct channel routing, a discrete same-clock LTC output where required, supported session operations, and fresh engine evidence.

## Deliberate boundaries

- FPP owns the schedule; the audio node owns local playback and its output clock.
- The coordinator orchestrates and observes but never streams program audio.
- Resolume receives LTC through the physical audio path; “LTC generated” is not proof that Resolume received or locked to it.
- Automatic or sample-transparent failover is not promised.
- Real-time audio transport between ShowMesh nodes and real third-party synchronized-audio services are outside the initial role.
