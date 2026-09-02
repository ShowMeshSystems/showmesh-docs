---
title: Install a native node
description: Build the native agent from the supported flow, install it with install.sh, give it a broker identity, and verify it is visible.
pageType: procedure
maturity: experimental-active
complexity: advanced
---

This guide installs the shared native-agent foundation used by render and audio nodes, using the packaged installer and preflight checks in `deploy/node/`. The agent runs directly on the node host so it can access local media hardware; it is not another Compose service.

:::note[Platform floor]
The agent's cgo build requires Debian 13 (trixie) or newer: Debian 12's GLib is too old and the build fails with undefined symbols rather than a clear error. `preflight.sh` and `install.sh` both refuse plainly on an older Debian. Any other distribution is unverified; the installer proceeds with a warning rather than refusing.
:::

## Before you start

Have root access on the target host, a reachable coordinator and broker, and a node ID chosen from lowercase letters, digits, and internal hyphens. `coordinator`, `fpp`, and `healthcheck` are reserved. The only hardware evidence on record is a Raspberry Pi 3B+ installed from a prebuilt arm64 tarball as a program-only audio node; nothing here is verified on any other hardware.

## 1. Provision a broker credential

From the coordinator's source checkout:

```sh
cd deploy
./mosquitto/add-agent-credential.sh <node-id>
```

This prints a password once; the broker's access-control list trusts the username to equal the node ID exactly. Copy the password now.

## 2. Build the native agent

Build on the node itself, or on a build host running the identical Debian release. The plain `make build` agent (`CGO_ENABLED=0`) has no audio engine at all; do not use it for a media node.

```sh
apt-get update && apt-get install -y \
  build-essential pkg-config \
  libgstreamer1.0-dev libgstreamer-plugins-base1.0-dev libltc-dev
# Install Go from https://go.dev/dl/ and put it on PATH; Debian 13's
# packaged golang-go is older than this project's go.mod requires.

git clone https://github.com/ShowMeshSystems/showmesh.git
cd showmesh
make build-agent-native
```

This produces `bin/showmesh-agent-native`. To build a distributable, platform-named tarball instead, run `make package-node-agent`. Because this is a cgo build linking host C libraries, the tarball can only target the platform it was built on; build on an arm64 Debian 13 host or an arm64 `debian:13` container to package for a Raspberry Pi class node.

## 3. Install the runtime packages on the node

```sh
apt-get install -y \
  alsa-utils gstreamer1.0-tools \
  gstreamer1.0-plugins-base gstreamer1.0-plugins-good gstreamer1.0-plugins-bad \
  gstreamer1.0-plugins-base-apps gstreamer1.0-alsa libltc11
```

`alsasink` ships in `gstreamer1.0-alsa`, not in `gstreamer1.0-plugins-base-apps`.

## 4. Run the installer

```sh
sudo ./install.sh /path/to/showmesh-agent-native
```

`install.sh` is idempotent. On a fresh host it:

- runs `preflight.sh --runtime-only` and refuses to continue if a runtime dependency is missing, naming the exact apt package;
- creates the `showmesh` system user and group;
- creates `/etc/showmesh` and writes `/etc/showmesh/agent.env` (mode 0600, root:root) from the template, only if that file does not already exist;
- creates `/var/lib/showmesh` as the state directory (assets, render state, audio sessions), owned by `showmesh`;
- installs the binary and the `showmesh-agent.service` unit, and enables it.

Re-running `install.sh` on an upgrade replaces the binary and unit and restarts the service; it never touches an existing `/etc/showmesh/agent.env` or anything already written under `/var/lib/showmesh`.

:::caution[The installer refuses a mismatched `showmesh` account]
If a `showmesh` account already exists but does not match the shape this installer creates (a system UID, a nologin-equivalent shell, home at `/var/lib/showmesh`), `install.sh` refuses outright rather than running the agent as an unrelated human login account. Rename or remove the colliding account, or edit `SERVICE_USER`/`SERVICE_GROUP` in `install.sh` to use a different name, then re-run.
:::

## 5. Configure and start

Edit `/etc/showmesh/agent.env`: set at minimum `SHOWMESH_NODE_ID` (the ID from step 1), `SHOWMESH_MQTT_BROKER`, `SHOWMESH_MQTT_USERNAME`, and `SHOWMESH_MQTT_PASSWORD`.

If this node will ever be an FPP Connect (xLights) upload target, also provision `SHOWMESH_AGENT_API_TOKEN` now. The node's FPP Connect HTTP listener accepts uploads unconditionally regardless of the coordinator's read policy, and registering an upload requires the `asset:write` scope. Only the admin role carries that scope in the documented build, so the issued token is a full administrative credential:

```sh
showmeshctl principal create --name "<node-id> agent" --kind machine --role admin
showmeshctl token issue --label "<node-id> agent" <principal-id>
```

Paste the printed value as `SHOWMESH_AGENT_API_TOKEN` in `/etc/showmesh/agent.env`. Skipping this is not fatal: `install.sh` and `preflight.sh` both warn rather than refuse, but every FPP Connect upload this node ever receives will accept, assemble, and hash correctly, then fail to register, permanently, with nothing visible at upload time.

```sh
sudo systemctl start showmesh-agent
sudo systemctl status showmesh-agent
sudo journalctl -u showmesh-agent -f
```

## 6. Verify the install

```sh
sudo ./preflight.sh
systemctl status showmesh-agent
journalctl -u showmesh-agent -n 50
```

`preflight.sh` is safe and read-only; re-run it any time. A healthy agent logs its broker hello publish and does not crash-loop. If it logs `mqtt broker rejected connection: not authorized`, the credential in `agent.env` does not match what `add-agent-credential.sh` provisioned.

From a machine with an administrator token, confirm the coordinator side:

```sh
showmeshctl nodes
showmeshctl node <node-id>
showmeshctl discover
showmeshctl declare --label "<descriptive label>" <node-id>
```

The node has fresh control-plane evidence and becomes declared. Declaration is required before a surface can target the node or ShowMesh can evaluate its show-targeted asset readiness.

## What this install does NOT verify

- Real audio output through a physical interface. `preflight.sh` checks that ALSA tooling and GStreamer elements exist, not that sound comes out of a real DAC.
- Real NDI output. `ndisink` element resolution is reported as informational only; this repository does not build, vendor, or verify that element. A render node that needs NDI must build the `gst-plugins-rs` NDI plugin separately and set `GST_PLUGIN_PATH` in `agent.env`, then re-run preflight.
- That the systemd unit boots correctly on real hardware. It has been checked for syntactic validity and exercised inside a container, but a container does not run systemd as PID 1, so no verification here proves the service actually starts under systemd on a real machine.

## If the node does not appear

- **`install.sh` refuses on the platform check:** the host is not Debian 13 or newer. There is no supported workaround on Debian 12.
- **`mqtt broker rejected connection: not authorized`:** the username must exactly equal the node ID. Provision a replacement credential deliberately if it was lost.
- **The agent keeps retrying its broker connection:** verify the coordinator hostname, port, firewall, and `tcp://` scheme from the node host.
- **Uploads accept but never register:** see [Node troubleshooting](../../troubleshooting/nodes/) for the `SHOWMESH_AGENT_API_TOKEN` diagnosis.
- **Assets never become ready:** verify the asset-directory permissions and, when reads are closed, `SHOWMESH_AGENT_API_TOKEN`.

See [Nodes](../../using-showmesh/nodes/) for the evidence and declaration model, and [Node troubleshooting](../../troubleshooting/nodes/) for diagnosis after installation.
