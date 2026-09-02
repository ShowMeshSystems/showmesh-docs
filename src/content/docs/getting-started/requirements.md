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

The native agent is a Go binary. `make build` produces a `CGO_ENABLED=0` agent with no audio engine at all. A node that plays audio or generates LTC needs the separate `make build-agent-native` build instead, which links go-gst (GStreamer) and libltc and also shells out to the `gst-launch-1.0` and `gst-discoverer-1.0` command-line tools.

The audio-capable (`build-agent-native`) build has a measured platform floor: **Debian 13 (trixie) or newer**. Its cgo build fails on Debian 12 because that release's GLib is missing symbols the build depends on. `deploy/node/install.sh` and `deploy/node/preflight.sh` both check the host's `/etc/os-release` and refuse on an older release rather than producing a confusing link failure.

NDI output is not part of this build or its install path. The GStreamer `ndisink` element comes from a separately built gst-plugins-rs NDI plugin that this project does not build, vendor, or ship; a render node that needs NDI output must build that plugin itself and point `GST_PLUGIN_PATH` at it.

Each agent needs a valid lowercase node ID, its own broker credential, a writable asset directory, and network access to the broker and, when asset downloads are used, the coordinator. `make package-node-agent` builds a platform-named, distributable tarball of the native agent plus its install files; because it is a cgo build linking host C libraries, a tarball can only target the platform it was built on. An arm64 tarball built this way has been installed on a Raspberry Pi 3B+ as a program-only audio node; that is the only hardware install on record for this build.

Nodes run natively rather than in the coordinator bundle so they can use local GPUs, displays, audio devices, and NDI runtimes. `deploy/node/install.sh` installs the binary, creates the `showmesh` system user, and installs a systemd unit; it is idempotent and safe to re-run for an upgrade. The [native-node installation guide](../../guides/add-a-node/) provides a reviewed starting unit and verification path.

## Supported integrations in this snapshot

- FPP is implemented through REST polling/control and optional MQTT status collection.
- Resolume Arena is implemented through its REST API and WebSocket update stream, with polling fallback.
- The render-node/NDI path is on current `main` but experimental. It requires a user-installed NDI runtime and a source-built GStreamer NDI element.
- Audio playback and LTC generation have experimental software paths.
- xLights/FPP Connect ingestion is experimental. HDMI does not currently have a runtime output path.
