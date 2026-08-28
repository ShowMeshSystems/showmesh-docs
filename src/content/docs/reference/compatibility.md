---
title: Compatibility
description: What the captured development build is known to integrate with—and what it does not yet provide.
pageType: reference
maturity: experimental-active
---

This is a development-state compatibility boundary, not a release support matrix.

## Implemented interfaces

- Coordinator and native agent communicate through Mosquitto-compatible MQTT broker URLs using `tcp`, `ssl`, `tls`, `mqtt`, `mqtts`, `ws`, or `wss` schemes.
- FPP is observed through its HTTP API and optionally FPP MQTT topics; eight playlist/volume commands are implemented with evidence-based outcomes.
- Native nodes have experimental xLights FPP Connect ingestion and report per-node channel-range outcomes.
- Native audio nodes have experimental configuration and command paths for local playback, gain/output control, and LTC generation.
- Resolume Arena is observed and controlled through its REST API, with a WebSocket used only as a change signal. Composition metadata is uploaded from an `.avc` file.
- External clients use HTTP API version 1 and Server-Sent Events.

## Important limits

- No runtime path should call Resolume's full `GET /composition`; ShowMesh uses an uploaded `.avc` map and targeted live reads.
- Resolume OSC is not implemented.
- The experimental NDI render path supports NDI output; HDMI output is not available.
- FPP Connect is experimental. Its page names the deployment limitation.
- Audio and LTC have software configuration and command paths. See [SMPTE / LTC](../../integrations/smpte-ltc/) for timing and receiver limits.
- `showmesh-fpp-plugin` is experimental and does not yet have a supported packaged installation.

## Not currently available

- HDMI surface output.
- A supported public audio/LTC operating path.
- A supported FPP Connect deployment path.
- A supported FPP plugin/provider development kit or packaged plugin installation.
- Documentation version selection.

The presence of a surface configuration is not evidence that a renderer is producing output. NDI requires a prepared render node, a ready node-local FSEQ asset, an applied surface, a working transport probe, and fresh pipeline evidence.

## Version negotiation

Use `showmeshctl version` to compare the CLI and coordinator API. API v1 is additive within the major version; clients must tolerate unknown response fields. No promise is made yet about compatibility across unreleased development commits.
