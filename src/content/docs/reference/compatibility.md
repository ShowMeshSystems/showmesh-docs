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
- Resolume Arena is observed and controlled through its REST API, with a WebSocket used only as a change signal. Composition metadata is uploaded from an `.avc` file.
- External clients use HTTP API version 1 and Server-Sent Events.

## Verified boundaries

- FPP container integration tests exercise a real containerized `fppd`, but this does not establish show-hardware or network readiness.
- Resolume behavior was exercised against Arena on a development laptop. That is not verification of the production playout host.
- No runtime path should call Resolume's full `GET /composition`; ShowMesh uses an uploaded `.avc` map and targeted live reads.
- Resolume OSC is not implemented.
- The experimental NDI render path has sender evidence on Debian 13 amd64. Its real FSEQ-to-wall timing, pacing, recovery, arm64, and Ubuntu boundaries are not yet verified.

## Not currently available

- HDMI surface output.
- Audio playback, mixing, or LTC generation.
- xLights/FPP Connect ingestion.
- A supported SDK or plugin/provider development kit.
- Documentation version selection.

The presence of a surface configuration is not evidence that a renderer is producing output. NDI requires a prepared render node, a ready node-local FSEQ asset, an applied surface, a working transport probe, and fresh pipeline evidence.

## Version negotiation

Use `showmeshctl version` to compare the CLI and coordinator API. API v1 is additive within the major version; clients must tolerate unknown response fields. No promise is made yet about compatibility across unreleased development commits.
