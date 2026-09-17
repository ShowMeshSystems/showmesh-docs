---
title: Audio nodes
description: Node-local audio routing, PTP clocks, scheduled starts, LTC, latency, and recovery evidence.
pageType: concept
maturity: experimental-testing
---

An **audio node** plays complete ShowMesh assets locally. The coordinator distributes content, schedules operations, and observes results; it does not stream program PCM through MQTT or through the coordinator process.

Linux, GStreamer, and PipeWire or ALSA provide the media/output layer. ShowMesh owns session state, routing declarations, scheduled-start policy, supervision, and operator evidence.

## Roles

| Role | Meaning |
| --- | --- |
| `program` | Main program audio without LTC. |
| `program+ltc` | Main program audio and the installation's only LTC output. |
| `zone` | A named independent speaker zone, never main program or LTC. |

At most one node can hold `program+ltc`. More than one audio node can play the same Cue, announcement, or Night bed, but LTC remains singular.

## Routes and output ownership

An `audio.node` selects:

- an advertised program route and ordered program channels;
- an optional discrete LTC channel on the same route;
- `alsasink` or `pipewiresink`;
- a PipeWire target node when PipeWire owns the device;
- a declared clock-domain name and its provenance;
- an optional calibrated static output latency.

The coordinator refuses a route that the node has not advertised. A Linux interface appearing in an inventory is not sufficient readiness evidence.

PipeWire-routed installations should let PipeWire own the card. ShowMesh targets the configured PipeWire node rather than opening the hardware independently and competing for it.

## Node clocks and PTP

`node.clock` is separate revisioned configuration. It chooses one provider:

- **managed**: ShowMesh manages the node's PTP service;
- **external**: another service owns PTP and ShowMesh reads its management evidence;
- **FPP**: an FPP 10 host supplies the clock relationship.

Clock reports distinguish synchronized, holdover, and unavailable evidence. A configured holdover limit determines when lost lock becomes unsynchronized. Hardware timestamping may be requested for a managed provider, with its availability reported rather than assumed.

## Scheduled starts

A single-node start can carry `scheduledAtNs`. For several nodes, the aligned-start path prepares every target, reads the shared clock once, and schedules all prepared nodes at one instant.

Cue activation, Show Night beds, announcements, and resumes use this shared-instant behavior when multiple targets are selected. Each target reports whether it started aligned. If shared-clock evidence is unavailable, the system can degrade visibly to unaligned operation rather than claiming synchronization.

Static output-latency calibration is applied to scheduled starts so each output chain can compensate for a known delay. Calibration evidence includes method, reference, measurement configuration, timestamp, and confidence.

## Sessions and media

The node supports background, show, announcement, and manual sources; ordered media playlists; repeat and resume/restart policies; gain ceilings; fades; duck, mix, or interrupt behavior; and natural-completion evidence.

Session commands cover apply, prepare, start, pause, resume, seek, advance, stop, clear, gain, fade, mute, and unmute. Session evidence includes playback position, route, device, gain, mix, LTC, restore state, and command outcome.

Required media must already exist on every target node. A multi-node activation names a target that lacks an asset instead of reporting the group ready.

## LTC and alignment

Program audio and LTC use separate channels on one declared clock domain. LTC uses one target and supports the rates documented in [SMPTE / LTC](../../../integrations/smpte-ltc/).

Alignment runs record long-duration program-to-LTC measurements. A configured drift threshold can warn before showtime when the observed relationship exceeds the accepted bound. Repository tests and retained measurements do not replace receiver-lock, listening, and long-run validation on the installation's physical interfaces.

## Recovery

Device loss fails silent. ShowMesh does not automatically move program audio to another node or return it to FPP. Recovery restores the intended route, channels, clock relationship, assets, gain, and current session position before sound resumes.

A session waiting for a usable binding reports `restore_pending` and retries with bounded backoff. That state is visible; it is not silently presented as the last persisted running state.

Use [Set up an audio node](../../../guides/set-up-an-audio-node/) for the procedure and [Audio and clock sync](../../../troubleshooting/audio-and-clock-sync/) for diagnosis.
