---
title: Requirements
description: What the current source-built ShowMesh stack needs before installation.
pageType: reference
maturity: experimental-active
---

The current installation is built from source. Use a non-production host or isolated show network first.

## Coordinator host

You need:

- Git to obtain the ShowMesh source.
- Docker Engine or Docker Desktop with the `docker compose` subcommand.
- Enough local storage for the coordinator's SQLite database and uploaded assets.
- TCP ports `8081` for the Operator UI and `1883` for the bundled MQTT broker, unless you override them. Port `8080` exposes the coordinator directly and is also published by the reference bundle. Firewall these ports to the show-management network.

The Compose bundle builds the coordinator and UI locally; there is no published-image install path in this captured build.

## Show network

- The coordinator must reach configured FPP REST endpoints.
- The coordinator must reach Resolume Arena's REST/WebSocket service when that integration is enabled.
- Native agents and FPP MQTT output must reach their configured broker.
- Keep the API/UI on a trusted network. Reads are open by default, writes require a principal, and ShowMesh does not provide TLS.

## Native node hosts

The native agent is a Go binary built by `make build`. There is no published package or vendor-provided service unit yet. Each agent needs a valid lowercase node ID, its own broker credential, a writable asset directory, and network access to the broker and—when asset downloads are used—the coordinator.

Nodes run natively rather than in the coordinator bundle so they can use local GPUs, displays, audio devices, and NDI runtimes. Use a host service manager such as systemd to keep the agent running after reboot. The [native-node installation guide](../../guides/add-a-node/) provides a reviewed starting unit and verification path.

## Supported integrations in this snapshot

- FPP is implemented through REST polling/control and optional MQTT status collection.
- Resolume Arena is implemented through its REST API and WebSocket update stream, with polling fallback.
- The render-node/NDI path is on current `main` but experimental. It requires a user-installed NDI runtime and a source-built GStreamer NDI element.
- Audio playback and LTC generation have experimental software paths.
- xLights/FPP Connect ingestion is experimental. HDMI does not currently have a runtime output path.
