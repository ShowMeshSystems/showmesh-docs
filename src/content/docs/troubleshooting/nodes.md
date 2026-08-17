---
title: Node missing or stale
description: Check broker connectivity, identity, declaration state, and evidence age in that order.
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
`SHOWMESH_NODE_CAPABILITIES` is an explicit testing/operator override. The current agent does not perform production capability detection, and an empty capability list is valid.
:::
