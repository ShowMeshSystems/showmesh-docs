---
title: Requirements
description: Choose hosts and network access for the v0.2.0 prerelease.
pageType: reference
maturity: experimental-active
---

The released installer supports Debian 13 or newer on amd64 and arm64. It installs the coordinator from published images and native nodes from release packages. Use a non-production host or isolated show network first.

## Coordinator host

You need:

- Root access and internet access to Debian package repositories, GitHub release downloads, and GHCR for the released installer.
- Docker with Compose v2; the installer installs the Debian packages. For a manual deployment, obtain Git and Docker yourself.
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
- The published native-agent package for the host architecture, downloaded and verified by the installer. Source builds use `make build-agent-native` or `make package-node-agent` on the same platform as the node. The plain `make build` agent has no audio engine.
- Root access for `showmesh-install`, which creates the `showmesh` system user, `/etc/showmesh/agent.env`, `/var/lib/showmesh`, and the systemd unit.
- The runtime packages named by `preflight.sh`: ALSA tools, GStreamer tools and plugins, `gstreamer1.0-alsa`, and `libltc11`.
- A node ID of lowercase letters, digits, and internal hyphens, and a one-time enrollment code from Settings > Node enrollment or `showmeshctl node enroll`. Enrollment supplies the node credentials.
- Network access to the MQTT broker and, for asset downloads and FPP Connect registration, to the coordinator.
- For NDI output only: the vendor NDI runtime, which you obtain and license separately. The installer installs the packaged GStreamer NDI plugin and accepts the SDK through `--ndi`; if the agent package has no plugin, it builds one.

Hardware and integration acceptance is installation-specific. The repository supplies native `amd64` and `arm64` packaging and software tests, but a successful build is not proof that a particular board, audio interface, PTP clock, NDI stack, or receiver is supported. See [Install a native node](../../guides/add-a-node/) for the procedure.

## Supported integrations in this snapshot

- FPP is implemented through REST polling/control and optional MQTT status collection.
- Resolume Arena is implemented through its REST API and WebSocket update stream, with polling fallback.
- The render-node/NDI path is experimental. It requires a user-installed NDI runtime and a working GStreamer NDI element.
- Audio playback and LTC generation have experimental software paths.
- xLights/FPP Connect ingestion is experimental. HDMI has no runtime output path.
