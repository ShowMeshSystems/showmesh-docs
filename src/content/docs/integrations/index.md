---
title: Integrations
description: Connect ShowMesh to the systems it can verify today and identify planned integration work.
pageType: landing
maturity: experimental-active
---

ShowMesh has current development integrations for FPP and Resolume Arena. Some newer paths are experimental; their pages name the relevant limits directly.

- [FPP](./fpp/): REST observation/control, optional MQTT status, playlist evidence/readiness surfaces, and an experimental coordinator-side signed fallback program.
- [Experimental FPP plugin](./fpp-plugin/): FPP-host macro runner, brightness Action, and playlist-entry identity observer, tested against fakes only.
- [Resolume Arena](./resolume/): composition import, observation, bounded actions, recovery controls, and Show Mode's effect on the WebSocket connection.
- [Integration MQTT](./mqtt/): advanced action publishing to explicitly configured external brokers.
- [xLights FPP Connect](./xlights/): experimental node-targeted sequence ingestion and channel-range outcomes.
- [SMPTE / LTC](./smpte-ltc/): experimental audio-node LTC configuration, generation, and receiver limits.
- [NDI](./ndi/): experimental render-node output.

An integration page may describe intended behavior, but only sections explicitly marked as available are runnable.
