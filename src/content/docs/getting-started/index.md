---
title: Getting started
description: Understand ShowMesh, install the released build, and prepare your installation.
pageType: landing
maturity: experimental-active
---

ShowMesh gives one operator a coherent view of the computers and playback systems involved in a show. The released build can inventory native ShowMesh nodes, monitor and control FPP players, monitor and control one Resolume Arena instance, manage show configuration and assets, and run reusable actions and macros.

Start here in order:

1. Read [What is ShowMesh?](./what-is-showmesh/) for the problem it solves and the current limits.
2. Check [Requirements](./requirements/) before changing a show computer.
3. Follow [Installation](./installation/) to start the coordinator, broker, and Operator UI.
4. Read [Your first show](./your-first-show/) to stage configuration, verify readiness, and test playback before operating a show.
5. Use the [Reference roadmap](/reference/roadmap/) to see current development priorities and remaining release work.

:::caution[Experimental release]
These pages describe the v0.3.1 prerelease. Check `showmeshctl system versions` before following a procedure, and use Core 0.3.1 and FPP plugin 0.3.0 together. Prerelease features remain experimental; later development commits are unreleased.
:::

## What works now

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

## Before show use

HDMI output is unavailable. Test FPP Connect, audio, LTC, and render outputs on your own hardware before show use. The FPP plugin can run a signed fallback program during coordinator loss. Confirm catalog delivery and fallback behavior on your installation before relying on it; see [Recover after coordinator loss](/guides/recover-after-coordinator-loss/).

## How to read a maturity label

Available features are part of the released build. Experimental features are still changing or intended for deliberate testing. Planned pages describe work that is not yet available. Experimental features might not yet have been tested with the hardware used in your installation. [Read the complete maturity definitions](/reference/maturity/).
