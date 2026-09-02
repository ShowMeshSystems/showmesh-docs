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

Each native node needs:

- Debian 13 (trixie) or newer. The audio-capable agent build fails on Debian 12, and `install.sh` and `preflight.sh` refuse older releases.
- The `make build-agent-native` agent binary, or the tarball from `make package-node-agent`, built on the same platform as the node. The plain `make build` agent has no audio engine.
- Root access for `deploy/node/install.sh`, which creates the `showmesh` system user, `/etc/showmesh/agent.env`, `/var/lib/showmesh`, and the systemd unit.
- The runtime packages named by `preflight.sh`: ALSA tools, GStreamer tools and plugins, `gstreamer1.0-alsa`, and `libltc11`.
- A node ID of lowercase letters, digits, and internal hyphens, and its own broker credential from `add-agent-credential.sh`.
- Network access to the MQTT broker and, for asset downloads and FPP Connect registration, to the coordinator.
- For NDI output only: the vendor NDI runtime and a separately built gst-plugins-rs `ndisink` element on `GST_PLUGIN_PATH`. ShowMesh does not build or ship either.

The only hardware install on record is a Raspberry Pi 3B+ (arm64) running as a program-only audio node. See [Install a native node](../../guides/add-a-node/) for the procedure.

## Supported integrations in this snapshot

- FPP is implemented through REST polling/control and optional MQTT status collection.
- Resolume Arena is implemented through its REST API and WebSocket update stream, with polling fallback.
- The render-node/NDI path is on current `main` but experimental. It requires a user-installed NDI runtime and a source-built GStreamer NDI element.
- Audio playback and LTC generation have experimental software paths.
- xLights/FPP Connect ingestion is experimental. HDMI has no runtime output path.
