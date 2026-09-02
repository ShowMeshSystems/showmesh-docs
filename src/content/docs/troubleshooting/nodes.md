---
title: Node missing or stale
description: Check broker connectivity, identity, declaration state, and evidence age in that order.
pageType: troubleshooting
---

## Symptom: the node does not appear

```sh
showmeshctl nodes
showmeshctl snapshot --output json
```

On the node, verify that `SHOWMESH_NODE_ID` is valid and unique. If unset, the agent uses the operating-system hostname. Also verify `SHOWMESH_MQTT_BROKER` and that each agent has a unique MQTT client ID; the default is derived from the node ID.

The node agent is a native process, not part of the coordinator Compose bundle. Confirm that it is running and can reach Mosquitto.

## Symptom: the node appears but is stale or offline

ShowMesh treats freshness as evidence. A retained hello can restore inventory after coordinator restart, but old evidence does not become healthy merely because it exists. Check broker connectivity and the agent process before changing the node declaration.

## Symptom: asset readiness is unknown

The agent periodically publishes its asset inventory. Check `SHOWMESH_ASSET_DIR`, broker connectivity, and `SHOWMESH_ASSET_INVENTORY_INTERVAL`. If reads are closed, the agent also needs a valid `SHOWMESH_AGENT_API_TOKEN` to fetch asset bytes.

:::note
`SHOWMESH_NODE_CAPABILITIES` is an explicit testing/operator override that disables automatic GStreamer/NDI probing. An empty capability list is valid on a host where that path is unavailable.
:::

## Symptom: `install.sh` refuses to install

- **`refusing to install on Debian <version>`:** the agent's cgo build requires Debian 13 (trixie) or newer; it fails against Debian 12's older GLib. There is no supported workaround on Debian 12; install onto a Debian 13+ host.
- **A warning that `/etc/os-release` reports a non-Debian `ID`, or is missing entirely:** the installer proceeds, but the platform is unverified. Review the warning before continuing.
- **`refusing to adopt existing account 'showmesh'`:** a `showmesh` account already exists but does not match the shape `install.sh` creates (a system UID, a nologin-equivalent shell, home at `/var/lib/showmesh`). This is a deliberate refusal, not a bug: adopting a mismatched account would hand the agent that account's UID, supplementary groups, and home directory. The error names exactly which field mismatches. Either rename or remove the colliding account, or change `SERVICE_USER`/`SERVICE_GROUP` in `install.sh` and re-run.

## Symptom: agent logs `mqtt broker rejected connection: not authorized`

The broker's access-control list trusts the connecting username to equal the node ID exactly. Confirm `SHOWMESH_MQTT_USERNAME` in `agent.env` matches the node ID given to `deploy/mosquitto/add-agent-credential.sh`, and that `SHOWMESH_MQTT_PASSWORD` is the value that script printed. Provision a fresh credential deliberately if the original password was lost; do not guess at a replacement.

## Symptom: FPP Connect upload is accepted but never registers

xLights reports the upload as accepted, but the sequence never becomes usable on the node. Check the node's own upload evidence:

```sh
cat /var/lib/showmesh/assets/fppconnect-uploads/index.json
```

Look at the affected entry's `registrationState`: `skipped`, `pending`, `registered`, or `failed`, with a `registrationReason` field alongside it. A `failed` state, or one that stays `pending` indefinitely, most often means this node has no `SHOWMESH_AGENT_API_TOKEN` set, or the token it has does not carry the `asset:write` scope. The node's FPP Connect HTTP listener accepts, assembles, and hashes every upload it receives regardless of this credential; only registration (`POST /api/v1/assets`) is gated, so a missing token produces no visible error at upload time.

Provision a machine principal and an admin-role token from the coordinator, set `SHOWMESH_AGENT_API_TOKEN` in `/etc/showmesh/agent.env`, then restart the agent:

```sh
sudo systemctl restart showmesh-agent
```

### Confirm recovery

Re-upload, or wait for the agent's own capped retry loop, then recheck `index.json`. Recovery is confirmed only when the entry's `registrationState` reads `registered`.

## Symptom: a render surface shows black and reports `Drawing: stale`

The MultiSync timeline has moved on to a sequence this surface holds no assignment for; ShowMesh draws black rather than continuing to show the previous, now-wrong content. Run `showmeshctl render status <node-id>` and check the reported drawing state for the affected surface. This recovers on its own once the node receives and applies an assignment for the sequence the timeline is actually playing; it is not evidence of a failed pipeline. A `Drawing: failure` state is a different condition (a channel-extraction error) and is reported separately.
