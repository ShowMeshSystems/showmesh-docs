---
title: Nodes
description: Understand node identity, discovery, declaration, health, capabilities, and asset inventory.
pageType: concept
maturity: available
---

A **node** is a computer running the native ShowMesh agent. Nodes are the machines ShowMesh can identify, monitor through its MQTT control plane, and keep synchronized with show assets.

The node record answers practical questions such as:

- Which machine checked in, and which agent version and boot is it running?
- Is its ShowMesh control-plane connection present?
- When did its hello, heartbeat, and last-will evidence arrive?
- Which capabilities did the agent advertise?
- Which asset hashes does the agent report on disk?
- Has an operator accepted this machine into the installation's managed inventory?

An FPP instance or Resolume host is not automatically a ShowMesh node merely because ShowMesh integrates with it. The node inventory specifically represents native ShowMesh agents. A computer may run both an agent and another integrated application, but ShowMesh keeps those records and their evidence separate.

## Node roles and capabilities

ShowMesh does not assign each node one fixed class. Nodes advertise versioned capabilities, and those capabilities determine which workloads the node can support. The approved media-node roles are:

- [Render nodes](../node-types/render-nodes/), which turn node-local FSEQ data into a video surface. This role is experimental.
- [Audio nodes](../node-types/audio-nodes/), which have experimental local-audio, mixing, and LTC software paths.

See [Node types](../node-types/) for the shared agent foundation, why roles can eventually compose on one machine, and which ShowMesh components are not nodes.

## What a node does today

The bundled agent publishes a retained hello record, ongoing health, last-will state, command results, and asset inventory through MQTT. It can receive asset-fetch commands, download content from the coordinator, verify its SHA-256 hash, store it in the configured asset directory, and publish the updated inventory.

A node without an applied media role does **not** render a surface, play an asset, or automatically gain production media capabilities. A healthy node therefore means the ShowMesh agent and its control-plane path are healthy, not that a configured video or future-audio path is working. Render-node readiness additionally needs local FSEQ assets, a working transport probe, an applied surface, and fresh pipeline evidence.

## Discovered and declared

- An **observed** node exists because the coordinator received live agent evidence. It may be unfamiliar or temporary and is not automatically trusted as part of the installation.
- A **declared** node is an operator's durable statement that the machine belongs to this installation. Its declaration carries managed label/notes data and remains even while the agent is offline.

Declaration matters. A surface can only name a declared node, and show-targeted asset readiness is evaluated for declared nodes. Discovery helps find candidates; declaration is the step that admits one into managed configuration.

Use the Operator UI node inventory, or run:

```sh
showmeshctl nodes
showmeshctl node <node-id>
showmeshctl discover
showmeshctl declare <node-id>
```

Discovery and declaration are writes and require `config:write`.

## Agent configuration

Each bundled-broker agent needs its own credential:

```sh
cd deploy
./mosquitto/add-agent-credential.sh <node-id>
```

The installer writes this node's agent environment to `/etc/showmesh/agent.env` (created from `deploy/node/agent.env.example` only if it does not already exist) and installs the `showmesh-agent.service` systemd unit. Edit the installed `/etc/showmesh/agent.env`, not the template, then restart the service:

```sh
systemctl restart showmesh-agent
```

See [Install a native node](../../guides/add-a-node/) for the full installation path. At minimum, set `SHOWMESH_NODE_ID` and the broker credentials issued by `add-agent-credential.sh`.

Node IDs accept lowercase letters, digits, and internal hyphens. The agent defaults to the OS hostname, but startup fails with a useful message if that hostname is invalid.

Capabilities are versioned claims advertised by the agent, optionally with attributes. The current agent probes its usable GStreamer/NDI path after connecting to MQTT and republishes refreshed hello evidence. Restart the agent after changing the runtime or plugin. Do not set `SHOWMESH_NODE_CAPABILITIES` merely to describe intended hardware: an override disables automatic probing, and a manually advertised capability must still correspond to real, working implementation.

For a separate node to receive ShowMesh assets, an administrator must also configure `assets.settings.contentBaseUrl` to an HTTP(S) coordinator URL reachable from that node. The default is empty, so asset-fetch dispatch is disabled until this value exists:

```sh
showmeshctl assets settings set \
  --content-base-url http://<node-reachable-coordinator>:8080
```

`assets settings set` changes only the flags you pass; an omitted flag leaves its stored or default value alone. Use the coordinator's network hostname rather than `localhost` for a separate node. If the coordinator closes anonymous API reads, create a separate `machine` principal with the `viewer` role and issue a token for that node; place that token in `SHOWMESH_AGENT_API_TOKEN`. Do not reuse a human administrator token: the viewer role has the `node:read` permission the asset endpoint needs. [Install a native node](../../guides/add-a-node/) includes the exact issuance commands.

## Read health correctly

`controlPlane.state: offline` means the coordinator lost the agent's MQTT connection. It is not proof that the computer is powered off or local playback stopped. Check observation age, last error, and device-local state before intervening.

Likewise, `discoveryState` is one of four values: `present` (the most recent complete discovery run saw this declared node), `not_seen` (a completed discovery run did not see it), `unknown` (the available run did not establish presence or absence, including when no complete run is available), or `not_applicable` (the node is not declared at all). Do not promote `not_seen` or `unknown` into a claim about playback.
