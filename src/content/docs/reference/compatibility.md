---
title: Compatibility
description: Interfaces and compatibility limits for the v0.3.1 prerelease.
pageType: reference
maturity: experimental-active
---

Use Core 0.3.1 and its native agents with FPP plugin 0.3.0. The pre-alpha `0.x` line makes no compatibility or migration promise between versions. Validate media hardware and vendor behavior in your installation.

## Systems and interfaces

The table identifies available interfaces and the requirements that affect their use.

| System or interface | Scope |
| --- | --- |
| Coordinator and native-agent MQTT | Mosquitto-compatible broker URLs using `tcp`, `ssl`, `tls`, `mqtt`, `mqtts`, `ws`, or `wss`. The installer’s external-broker setup accepts `tcp` or `mqtt` only. |
| FPP | HTTP observation and playlist/volume control, optional MQTT status, plugin pairing, brightness ceilings, and excluded channel ranges. FPP remains the scheduler. |
| FPP plugin | Released experimental Plugin Manager installation for FPP 9.4–9.x and 10.x. Use [plugin installation and pairing](../../integrations/fpp-plugin/) for the version-specific path. |
| Resolume Arena | REST observation/control, WebSocket change signals, and an uploaded `.avc` identity map. ShowMesh uses targeted live reads rather than full `GET /composition`. OSC is not implemented. |
| Native audio nodes | Experimental local playback, plural Cue/Night targets, shared scheduled starts, gain/output control, PTP-backed clocks, output-latency calibration, alignment runs, and one-node LTC. The native agent requires Debian 13 or newer; the plain source `make build` agent has no audio engine. |
| Native render nodes | Experimental FSEQ-to-NDI output. Several surfaces can share a node with distinct channel ranges and NDI names and matching frame timing. HDMI output is unavailable. |
| xLights FPP Connect | Experimental native-node ingestion and channel-range reporting. See [xLights / FPP Connect](../../integrations/xlights/) for setup and file-transfer behavior. |
| Signed FPP fallback | The plugin can run a held program during coordinator loss. The coordinator leaves that player’s Cue activation to the plugin until its playlist ends. See [Recover after coordinator loss](../../guides/recover-after-coordinator-loss/) for delivery prerequisites and recovery. |
| External clients | HTTP API version 1 and Server-Sent Events. Clients must tolerate unknown response fields. |

:::note[Test experimental outputs]
Software configuration and fresh status do not establish physical output, timing alignment, or live-show reliability. Test audio, PTP, LTC, NDI, FPP Connect, and fallback operation on the exact hardware and software versions you intend to use. No public hardware matrix covers every combination.
:::

An NDI configuration alone is not evidence of output. Confirm a prepared render node, ready node-local FSEQ content, applied surfaces, a working transport probe, and fresh pipeline status.

## Component versions and API negotiation

Use `showmeshctl system versions` to inspect the coordinator, native-agent, and FPP plugin versions. Core 0.3.1 agents match the coordinator; FPP plugin 0.3.0 is the matching plugin. Follow [Upgrade and restore ShowMesh](../../guides/upgrade-and-restore-showmesh/) when changing versions.

Use `showmeshctl version` to compare the CLI and coordinator API. API v1 is additive within its major version; the API number does not identify the product release. Do not assume compatibility between `0.x` releases or with unreleased development commits.

Companion report upload/read support requires Core 0.4.0 or newer, which is not yet published. The [Companion integration guide](../../integrations/showmesh-companion/) identifies the available source-build path. Documentation version selection is not available.
