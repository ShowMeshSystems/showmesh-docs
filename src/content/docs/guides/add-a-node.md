---
title: Install a native node
description: Enroll and install a released render or audio node and verify its control-plane evidence.
pageType: procedure
maturity: experimental-active
complexity: advanced
---

Install the v0.2.0 native agent directly on a Debian 13 or newer amd64 or arm64 host. The installer obtains the runtime packages and the checksum-verified agent package, redeems an enrollment code, and starts the systemd service.

## Before you start

Have root access on the node, a working coordinator and broker, internet access for packages, and a node ID using lowercase letters, digits, and internal hyphens. `coordinator`, `fpp`, and `healthcheck` are reserved. Use the same version as the coordinator.

:::caution[Install outside the show window]
Installation or upgrade restarts the agent. Stop the show before changing a media node. Software checks do not confirm a physical audio output or projection receiver; test those outputs before using the node in a show.
:::

## 1. Create an enrollment code

In **Settings > Node enrollment**, create a code for the node ID. Copy it when shown; it cannot be read again. You can list enrollments or cancel a pending one from the same page. These operations require `node:enroll`.

From the coordinator's CLI, the equivalent commands are:

```sh
sudo showmeshctl node enroll <node-id>
sudo showmeshctl node enrollments
sudo showmeshctl node enrollments cancel <enrollment-id>
```

Use a new code if the previous code expired, was cancelled, or was already redeemed. Enrollment supplies the node's broker identity and API token; do not copy the administrator's credential onto the node.

## 2. Run the installer on the node

Download and review the bootstrap before running it as root:

```sh
curl -fL https://github.com/ShowMeshSystems/showmesh/releases/download/v0.2.0/get-showmesh.sh -o get-showmesh.sh
less get-showmesh.sh
sudo bash get-showmesh.sh --role audio
```

Choose `--role render` instead for a render node. Answer the coordinator-address and enrollment-code prompts. Using the prompts keeps the code out of shell history. For unattended installation, `--coordinator <url>` and `--code <code>` supply the same values; command arguments can be visible to other local users.

An audio node offers PTP setup. A render node offers NDI setup and accepts the separately obtained vendor SDK through `--ndi <sdk-path>`; review and accept the vendor license. The installer checks that `ndisink` resolves after installing the runtime. Continue with [Set up an audio node](../set-up-an-audio-node/) or [Set up a video node](../set-up-a-video-node/) for routing and output tests.

## 3. Verify and declare the node

The installer waits for fresh online evidence from this agent start. Inspect the local service if it fails:

```sh
sudo systemctl status showmesh-agent
sudo journalctl -u showmesh-agent -n 50
```

From the coordinator, check the node and declare it if it is not yet declared:

```sh
sudo showmeshctl nodes
sudo showmeshctl node <node-id>
sudo showmeshctl declare --label "<descriptive label>" <node-id>
```

Confirm fresh control-plane evidence and the capabilities required for its role. Declaration is required before a surface can target the node. Configure a node-reachable content base URL in [Content delivery](../../using-showmesh/settings/) before assigning assets.

## Upgrade or recover

Run the target release's bootstrap again. An enrolled node keeps its environment and state and skips enrollment unless `--reenroll` is supplied. Verify the version and fresh evidence after the restart.

- If the platform check refuses, use Debian 13 or newer on amd64 or arm64; Core has no armv7 agent package.
- If redemption fails, verify the coordinator address and create a new code.
- If the broker refuses authentication, inspect `/etc/showmesh/agent.env` and the coordinator broker configuration; preserve unrelated settings when repairing enrollment.
- If the node stays offline, check its address, firewall, broker access, and service log.
- If assets do not arrive, check content delivery and the node's API access.

For source development, build `make build-agent-native` at the selected release tag and use `deploy/node/install.sh` and `preflight.sh`. The plain `make build` agent has no audio engine. Prefer release packages for operator installations.

See [Node troubleshooting](../../troubleshooting/nodes/) for further diagnosis.
