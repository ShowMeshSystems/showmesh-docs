---
title: Nodes
description: Understand node identity, discovery, declaration, health, capabilities, and asset inventory.
---

A node is an independently identified part of the show system. Native ShowMesh agents publish a retained hello record, ongoing health, last-will state, command results, and asset inventory through MQTT.

## Discovered and declared

- A **discovered** node has appeared through live evidence but has not been accepted into managed configuration.
- A **declared** node has an operator-managed label/notes record and participates in configuration such as surface assignment and asset readiness.

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

Node IDs accept lowercase letters, digits, and internal hyphens. The agent defaults to the OS hostname, but startup fails with a useful message if that hostname is invalid. Do not advertise `SHOWMESH_NODE_CAPABILITIES` unless the process genuinely implements them; the current generic agent does not auto-detect production media capabilities.

## Read health correctly

`controlPlane.state: offline` means the coordinator lost the agent's MQTT connection. It is not proof that the computer is powered off or local playback stopped. Check observation age, last error, and device-local state before intervening.

