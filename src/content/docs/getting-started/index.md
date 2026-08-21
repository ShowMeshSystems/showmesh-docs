---
title: Getting Started
description: Understand ShowMesh, install the current development build, and learn where the usable path ends today.
pageType: landing
maturity: experimental-active
---

ShowMesh gives one operator a coherent view of the computers and playback systems involved in a show. The current development build can inventory native ShowMesh nodes, monitor and control FPP players, monitor and control one Resolume Arena instance, manage show configuration and assets, and run reusable actions and macros.

Start here in order:

1. Read [What is ShowMesh?](./what-is-showmesh/) for the problem it solves and the current limits.
2. Check [Requirements](./requirements/) before changing a show computer.
3. Follow [Installation](./installation/) to start the coordinator, broker, and Operator UI.
4. Read [Your First Show](./your-first-show/) before authoring show objects. It explains which parts of that workflow are usable and which are not yet a playback pipeline.
5. Read the [Roadmap](./roadmap/) for the distinction between usable development features, hardware commissioning, and day-0 release work.

:::caution[Development-state documentation]
These pages track the current `main` development state, not a stable release or versioned documentation set. Check the source revision and `showmeshctl version` before following an experimental procedure, and validate the system on a non-show network before relying on it during an event.
:::

## What works now

- A Docker Compose coordinator appliance with Mosquitto and a separate Operator UI.
- Native node agents that advertise identity, health, and asset inventory over MQTT.
- FPP REST and MQTT observation, plus eight evidence-confirmed playlist and volume controls.
- Resolume composition import, observation, actions, and optional recovery.
- Experimental render nodes that turn node-local FSEQ data into an NDI source on the tested Debian 13 amd64 path.
- Revisioned shows, surfaces, logical actions, macros, an active-show pointer, and an asset store.

## What does not work yet

ShowMesh does not yet provide a production-commissioned render path, HDMI output, xLights/FPP Connect ingestion, audience-audio playback, or verified SMPTE/LTC operation. The NDI render path needs real-installation commissioning; the audio-node material is a Planned, non-deployable preview.
