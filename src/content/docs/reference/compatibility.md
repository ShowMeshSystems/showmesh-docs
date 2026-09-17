---
title: Compatibility
description: What the captured development build is known to integrate with, and what it does not yet provide.
pageType: reference
maturity: experimental-active
---

This is a development-state compatibility boundary, not a release support matrix.

## Implemented interfaces

- Coordinator and native agent communicate through Mosquitto-compatible MQTT broker URLs using `tcp`, `ssl`, `tls`, `mqtt`, `mqtts`, `ws`, or `wss` schemes.
- FPP is observed through its HTTP API and optionally FPP MQTT topics; eight playlist/volume commands are implemented with evidence-based outcomes.
- Native nodes have experimental xLights FPP Connect ingestion and report per-node channel-range outcomes.
- Native audio nodes implement local playback, plural Cue/Night targets, shared scheduled starts, gain/output control, PTP-backed node clocks, latency calibration, alignment runs, and one-node LTC generation. Full physical-interface and live-show support remains installation-specific.
- An installation-wide operating mode (`show.mode`: `program` or `show`) and an emergency-stop command surface (`emergency-stop stop`, `stop-power-down`, and a two-step hard stop) are implemented and available at the coordinator's API and CLI.
- Signed FPP fallback programs exist on the coordinator side (`/fallback-programs*`). The separate plugin can fetch, verify, install, acknowledge, and locally resolve entries; coordinator-to-node activation delivery, public packaging, and real-host acceptance remain incomplete.
- Resolume Arena is observed and controlled through its REST API, with a WebSocket used only as a change signal. Composition metadata is uploaded from an `.avc` file.
- External clients use HTTP API version 1 and Server-Sent Events.

## Important limits

- No runtime path calls Resolume's full `GET /composition`; ShowMesh uses an uploaded `.avc` map and targeted live reads.
- Resolume OSC is not implemented.
- The experimental NDI render path supports NDI output; HDMI output is not available.
- FPP Connect is experimental. Its page names the deployment limitation.
- Audio and LTC have software configuration and command paths. See [SMPTE / LTC](../../integrations/smpte-ltc/) for timing and receiver limits.
- `showmesh-fpp-plugin` is experimental and does not yet have a supported packaged installation. It has not been installed on a real FPP host.
- The native audio-capable agent build (`make build-agent-native`) requires Debian 13 (trixie) or newer; the plain agent build has no audio engine.

## Not available

- HDMI surface output.
- A supported public audio/LTC operating path.
- A supported FPP Connect deployment path.
- A supported FPP plugin/provider development kit or packaged plugin installation.
- A publicly packaged and real-host-verified FPP plugin installation, including fallback activation delivery and execution.
- A supported multi-node audio hardware matrix and live-show acceptance. Implemented scheduling and retained measurements are narrower evidence.
- Documentation version selection.

The presence of a surface configuration is not evidence that a renderer is producing output. NDI requires a prepared render node, a ready node-local FSEQ asset, an applied surface, a working transport probe, and fresh pipeline evidence.

## Version negotiation

Use `showmeshctl version` to compare the CLI and coordinator API. API v1 is additive within the major version; clients must tolerate unknown response fields. No promise is made yet about compatibility across unreleased development commits.
