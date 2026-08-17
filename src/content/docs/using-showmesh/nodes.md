---
title: Nodes
description: Understand node identity, discovery, declaration, health, capabilities, and asset inventory.
---

A **node** is a computer running the native ShowMesh agent. Nodes are the machines ShowMesh can identify, monitor through its MQTT control plane, and keep synchronized with show assets.

The node record answers practical questions such as:

- Which machine checked in, and which agent version and boot is it running?
- Is its ShowMesh control-plane connection currently present?
- When did its hello, heartbeat, and last-will evidence arrive?
- Which capabilities did the agent advertise?
- Which asset hashes does the agent report on disk?
- Has an operator accepted this machine into the installation's managed inventory?

An FPP instance or Resolume host is not automatically a ShowMesh node merely because ShowMesh integrates with it. The node inventory specifically represents native ShowMesh agents. A computer may run both an agent and another integrated application, but ShowMesh keeps those records and their evidence separate.

## Node roles and capabilities

ShowMesh does not assign each node one fixed class. Nodes advertise versioned capabilities, and those capabilities determine which workloads the node can support. The currently approved media-node roles are:

- [Render nodes](../node-types/render-nodes/), which turn node-local FSEQ data into a video surface. This role is in active development and entering hardware testing.
- [Audio nodes](../node-types/audio-nodes/), which will play node-local audio, mix show sources, and generate LTC. This role is planned and not implemented.

See [Node Types](../node-types/) for the shared agent foundation, why roles can eventually compose on one machine, and which ShowMesh components are not nodes.

## What a node does today

The bundled agent publishes a retained hello record, ongoing health, last-will state, command results, and asset inventory through MQTT. It can receive asset-fetch commands, download content from the coordinator, verify its SHA-256 hash, store it in the configured asset directory, and publish the updated inventory.

The current generic agent does **not** render a surface, play an asset, or automatically detect production media capabilities. A healthy node therefore means the ShowMesh agent and its control-plane path are healthy, not that video or sequence playback is working.

## Discovered and declared

- An **observed** node exists because the coordinator received live agent evidence. It may be unfamiliar or temporary and is not automatically trusted as part of the installation.
- A **declared** node is an operator's durable statement that the machine belongs to this installation. Its declaration carries managed label/notes data and remains even while the agent is offline.

Declaration matters. A surface can only name a declared node, and show-targeted asset readiness is evaluated for declared nodes. Discovery helps find candidates; declaration is the step that admits one into managed configuration.

Use the UI's node inventory or:

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

Set that node's agent environment:

```sh
export SHOWMESH_NODE_ID=yard-left
export SHOWMESH_NODE_LABEL='Yard left player'
export SHOWMESH_MQTT_BROKER=tcp://coordinator-host:1883
export SHOWMESH_MQTT_USERNAME=yard-left
export SHOWMESH_MQTT_PASSWORD='<printed password>'
export SHOWMESH_ASSET_DIR=/var/lib/showmesh/assets
./bin/showmesh-agent
```

Node IDs accept lowercase letters, digits, and internal hyphens. The agent defaults to the OS hostname, but startup fails with a useful message if that hostname is invalid.

Capabilities are versioned claims advertised by the agent, optionally with attributes. They are intended to tell the coordinator what a node can actually do. Do not set `SHOWMESH_NODE_CAPABILITIES` merely to describe intended hardware; the current generic agent does not auto-detect production media capabilities, and a manually advertised capability must correspond to real implementation.

## Read health correctly

`controlPlane.state: offline` means the coordinator lost the agent's MQTT connection. It is not proof that the computer is powered off or local playback stopped. Check observation age, last error, and device-local state before intervening.

Likewise, `discoveryState: not_seen` means a completed discovery run did not see a declared node. `unknown` means the available run did not establish presence or absence, including when no complete run is available. Neither verdict should be silently promoted into a claim about playback.
