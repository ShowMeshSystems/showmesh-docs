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
5. Use the [Reference roadmap](/reference/roadmap/) to see current development priorities and remaining release work.

:::caution[Development-state documentation]
These pages describe the current `main` development state, not a stable release or versioned documentation set. Check the source revision and `showmeshctl version` before following an experimental procedure.
:::

## What works now

- A Docker Compose coordinator appliance with Mosquitto and a separate Operator UI.
- Native node agents that advertise identity, health, and asset inventory over MQTT.
- FPP REST and MQTT observation, plus eight evidence-confirmed playlist and volume controls.
- Resolume composition import, observation, actions, and optional recovery.
- Experimental render nodes that turn node-local FSEQ data into an NDI source on the tested Debian 13 amd64 path.
- Revisioned shows, surfaces, logical actions, macros, an active-show pointer, an asset store, cues, and playlists.
- An installation-wide operating mode (`program`/`show`) and an emergency-stop command surface, reachable from the Operator UI or `showmeshctl`.
- Show Night session lifecycle commands (preparation, readiness, pre-show, start, fade-out, power-down).
- Experimental xLights FPP Connect ingestion for node-targeted sequence content.
- Experimental audio-node and LTC software paths, including a contract for more than one audio node per installation.

## What does not work yet

ShowMesh does not yet provide HDMI output or a supported FPP Connect deployment. Audio/LTC details are documented separately, including their timing and receiver limits. Signed FPP fallback programs exist on the coordinator side, but FPP-host execution of one has not been verified on a real FPP host. Multi-node audio has a contract but no installation has run more than one audio node.

## How to read a maturity label

Available features are part of the current development build. Experimental features are still changing or intended for deliberate testing. Planned pages describe work that is not yet available. Experimental features might not yet have been tested with the hardware used in your installation. [Read the complete maturity definitions](/reference/maturity/).
