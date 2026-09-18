---
title: Compatibility
description: Supported systems, interfaces, platforms, and unavailable output paths.
pageType: reference
maturity: experimental-active
---

Use this page to choose compatible systems and interfaces for a ShowMesh installation.

## Systems and interfaces

| System or interface | Support |
| --- | --- |
| Coordinator and native-agent MQTT | Mosquitto-compatible brokers over `tcp`, `ssl`, `tls`, `mqtt`, `mqtts`, `ws`, or `wss`. |
| FPP | REST observation and eight playlist/volume controls; optional MQTT status. |
| Resolume Arena | REST observation and control, WebSocket change signals, and uploaded `.avc` composition identity. OSC is not supported. |
| Public clients | HTTP API version 1 and Server-Sent Events. |
| Native audio nodes | Experimental local playback, multi-node Cue and Night targets, scheduled starts, PTP-backed clocks, latency calibration, alignment runs, and one-node LTC. Requires Debian 13 or newer. |
| Native render nodes | Experimental FSEQ-to-NDI output. One active surface per node; HDMI is not supported. |
| xLights FPP Connect | Experimental node-targeted ingestion and channel-range reporting. |
| FPP plugin | Experimental macro, brightness, playlist-identity, and local signed-program handling. No supported public package. |

:::note[Test experimental media paths]
Test audio, LTC, PTP, NDI, FPP Connect, and the FPP plugin on the exact show hardware and software versions before relying on them. Signed fallback activation delivery and node execution are not available.
:::

An NDI surface requires a prepared render node, a ready node-local FSEQ asset, an applied surface, a working transport probe, and fresh pipeline status.

## Version negotiation

Use `showmeshctl version` to compare the CLI and coordinator API. API v1 is additive within the major version; clients must tolerate unknown response fields.
