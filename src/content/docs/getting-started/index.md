---
title: Getting Started
description: Understand ShowMesh, install the current development build, and learn where the usable path ends today.
---

**Status: Experimental — Active Development**

ShowMesh gives one operator a coherent view of the computers and playback systems involved in a show. The current development build can inventory native ShowMesh nodes, monitor and control FPP players, monitor and control one or more Resolume Arena instances, manage show configuration and assets, and run reusable actions and macros.

Start here in order:

1. Read [What is ShowMesh?](./what-is-showmesh/) for the problem it solves and the current limits.
2. Check [Requirements](./requirements/) before changing a show computer.
3. Follow [Installation](./installation/) to start the coordinator, broker, and Operator UI.
4. Read [Your First Show](./your-first-show/) before authoring show objects. It explains which parts of that workflow are usable and which are not yet a playback pipeline.

:::caution[Development-state documentation]
These pages describe ShowMesh commit `d3a19fde2a31f8e504a7606cf1e92febe293a940`. There is no stable release or versioned documentation yet. Validate the system on a non-show network before relying on it during an event.
:::

## What works now

- A Docker Compose coordinator appliance with Mosquitto and a separate Operator UI.
- Native node agents that advertise identity, health, and asset inventory over MQTT.
- FPP REST and MQTT observation, plus eight evidence-confirmed playlist and volume controls.
- Resolume composition import, observation, actions, and optional recovery.
- Revisioned shows, surfaces, logical actions, macros, an active-show pointer, and an asset store.

## What does not work yet

ShowMesh does not currently render surfaces, emit NDI or HDMI, ingest an xLights FPP Connect upload, generate or play media, or drive synchronization from SMPTE/LTC. Configuration models for some of those concepts exist, but configuration is not runtime output.
