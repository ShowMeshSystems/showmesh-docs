---
title: Getting started
description: Understand ShowMesh, install it, and prepare your first show.
pageType: landing
maturity: experimental-active
---

ShowMesh gives one operator a coherent view of the computers and playback systems involved in a show. The current development build can inventory native ShowMesh nodes, monitor and control FPP players, monitor and control one Resolume Arena instance, manage show configuration and assets, and run reusable actions and macros.

Start here in order:

1. Read [What is ShowMesh?](./what-is-showmesh/) for the problem it solves and the current limits.
2. Check [Requirements](./requirements/) before changing a show computer.
3. Follow [Installation](./installation/) to start the coordinator, broker, and Operator UI.
4. Follow [Your first show](./your-first-show/) to author show objects and check the complete path.
5. Use the [Roadmap](/reference/roadmap/) to distinguish available, in-development, and upcoming work.

:::caution[Development-state documentation]
ShowMesh does not yet publish version-selected documentation. Check `showmeshctl version` before following an experimental procedure.
:::

## Included in ShowMesh

- A Docker Compose coordinator appliance with Mosquitto and a separate Operator UI.
- Native node agents that advertise identity, health, and asset inventory over MQTT.
- FPP REST and MQTT observation, plus eight evidence-confirmed playlist and volume controls.
- Resolume composition import, observation, actions, and optional recovery.
- Experimental render nodes that turn node-local FSEQ data into an NDI source on the tested Debian 13 amd64 path.
- Revisioned Shows, surfaces, actions, macros, Cues, runner-backed Playlists, local-audio media playlists, and Show participation selection.
- A runner-neutral current-runs projection for concurrent FPP and ShowMesh-audio playback.
- An installation-wide operating mode (`program`/`show`), direct Cue activation, and Emergency Stop across FPP, audio nodes, and Resolume.
- Show Night preparation, readiness with warnings, pre-show, live, final-show, fade-out, power-down, and degraded recovery.
- Experimental xLights FPP Connect ingestion for node-targeted sequence content.
- Experimental audio-node and LTC paths with plural Cue/Night targets, shared scheduled starts, `node.clock`, calibrated output latency, and alignment runs.

:::note[Experimental media paths]
HDMI output and coordinator-to-node fallback execution are not available. FPP Connect, NDI, audio, and LTC are experimental and must be tested on the intended show hardware.
:::

[Read the maturity definitions](/reference/maturity/) for how experimental and planned work is labelled.
