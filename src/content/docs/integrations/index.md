---
title: Integrations
description: Connect ShowMesh to the systems it can verify today and identify planned integration work.
pageType: landing
maturity: experimental-active
---

ShowMesh has current development integrations for FPP and Resolume Arena. Some newer paths are experimental; their pages name the relevant limits directly.

- [FPP](./fpp/): REST observation/control, optional MQTT status, playlist evidence/readiness, transition gain, definition republish, and signed fallback boundaries.
- [Experimental FPP plugin](./fpp-plugin/): FPP-host macro runner, brightness Action, playlist-entry observer, and local signed-program handling with no public real-host acceptance.
- [Resolume Arena](./resolume/): composition import, observation, bounded actions, recovery controls, and Show Mode's effect on the WebSocket connection.
- [Integration MQTT](./mqtt/): advanced action publishing to explicitly configured external brokers.
- [xLights FPP Connect](./xlights/): experimental Show-bound sequence ingestion, held media, registration evidence, and channel-range outcomes.
- [SMPTE / LTC](./smpte-ltc/): one-node LTC generation alongside PTP-aware multi-node program-audio scheduling and receiver limits.
- [NDI](./ndi/): experimental render-node output.

An integration page may describe intended behavior, but only sections explicitly marked as available are runnable.
