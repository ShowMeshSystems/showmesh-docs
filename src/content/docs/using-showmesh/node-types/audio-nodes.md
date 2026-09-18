---
title: Audio nodes
description: Node-local audio routing, PTP clocks, scheduled starts, LTC, latency, and recovery evidence.
pageType: concept
maturity: experimental-testing
---

An **audio node** plays complete assets locally. The coordinator distributes content, schedules operations, and records results; it does not stream program audio. GStreamer with PipeWire or ALSA provides output.

## Roles

| Role | Meaning |
| --- | --- |
| `program` | Main program audio without LTC. |
| `program+ltc` | Main program audio and the installation's only LTC output. |
| `zone` | A named independent speaker zone, never main program or LTC. |

Only one node can use `program+ltc`. Program audio can target several nodes; LTC remains single-node.

## Choose routes and outputs

An `audio.node` selects:

- an advertised program route and ordered program channels;
- an optional discrete LTC channel on the same route;
- `alsasink` or `pipewiresink`;
- a PipeWire target node when PipeWire owns the device;
- a declared clock-domain name and its provenance;
- an optional calibrated static output latency.

The coordinator refuses routes the node has not advertised. An interface appearing in inventory does not prove readiness.

When using PipeWire, let it own the card and configure ShowMesh to target its node.

## Node clocks and PTP

`node.clock` is separate revisioned configuration. It chooses one provider:

- **managed**: ShowMesh manages the node's PTP service;
- **external**: another service owns PTP and ShowMesh reads its management evidence;
- **FPP**: an FPP 10 host supplies the clock relationship.

Clock reports distinguish synchronized, holdover, and unavailable. The holdover limit determines when lost lock becomes unsynchronized. Requested hardware timestamping is reported, not assumed.

## Scheduled starts

A single-node start can use `scheduledAtNs`. For several nodes, aligned start prepares every target and schedules them for one shared instant.

Cues, Night beds, announcements, and resumes use this behavior. Each target reports aligned or unaligned operation.

Output-latency calibration offsets known output-chain delay and records its method, configuration, timestamp, and confidence.

## Sessions and media

The node supports Show, background, announcement, and manual sessions, including ordered media playlists, repeat/resume policy, gain, fades, duck/mix/interrupt behavior, and completion evidence.

Required media must already exist on every target node. A multi-node activation names a target that lacks an asset instead of reporting the group ready.

## LTC and alignment

Program audio and LTC use separate channels on one declared clock domain. LTC uses one target and supports the rates documented in [SMPTE / LTC](../../../integrations/smpte-ltc/).

Alignment runs record program-to-LTC drift. Their warning threshold supports pre-show checks, but does not replace receiver-lock, listening, and long-run physical tests.

## Recovery

Device loss fails silent. ShowMesh does not move audio to another node or back to FPP. Recovery restores the route, channels, clock, assets, gain, and session position.

A session waiting for a usable binding reports `restore_pending` and retries with bounded backoff.

Use [Set up an audio node](../../../guides/set-up-an-audio-node/) for the procedure and [Audio and clock sync](../../../troubleshooting/audio-and-clock-sync/) for diagnosis.
