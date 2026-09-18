---
title: Requirements
description: System, network, and integration requirements for installing ShowMesh.
pageType: reference
maturity: experimental-active
---

Use an isolated show network while evaluating ShowMesh.

## Coordinator host

You need:

- Git to obtain the ShowMesh source.
- Docker Engine or Docker Desktop with the `docker compose` subcommand.
- Enough local storage for the coordinator's SQLite database and uploaded assets.
- TCP ports `8081` for the Operator UI and `1883` for the bundled MQTT broker, unless you override them. Port `8080` exposes the coordinator directly and is also published by the reference bundle. Firewall these ports to the show-management network.

The Compose bundle can build coordinator and UI images locally. A published-image override also exists for tags whose release workflow actually published the matching GHCR images; check the selected release and pin its version or digest before using it.

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

:::caution[Test media hardware before show use]
The repository supplies native `amd64` and `arm64` packages, but you must test the selected board, audio interface, PTP clock, NDI stack, and receiver together before using them in a show.
:::

See [Install a native node](../../guides/add-a-node/) for the installation procedure.

## Supported integrations

- FPP is implemented through REST polling/control and optional MQTT status collection.
- Resolume Arena is implemented through its REST API and WebSocket update stream, with polling fallback.
- The experimental render-node/NDI path requires a user-installed NDI runtime and a source-built GStreamer NDI element.
- Audio playback and LTC generation have experimental software paths.
- xLights/FPP Connect ingestion is experimental. HDMI has no runtime output path.
