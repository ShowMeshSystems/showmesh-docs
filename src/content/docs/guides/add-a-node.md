---
title: Add a Native Node
description: Provision one node's broker credential, start its agent, and verify inventory evidence.
---

This guide adds a native agent to the bundled Mosquitto deployment.

## 1. Choose the node ID

Use lowercase letters, digits, and internal hyphens, for example `yard-left`. The ID must be stable and must not be one of the bundled broker's reserved fixed-role names.

## 2. Provision its credential

On the coordinator source checkout:

```sh
cd deploy
./mosquitto/add-agent-credential.sh yard-left
```

Copy the printed password immediately; it is displayed once.

## 3. Configure and start the agent

On the node host, after building/copying `showmesh-agent`:

```sh
export SHOWMESH_NODE_ID=yard-left
export SHOWMESH_NODE_LABEL='Yard left player'
export SHOWMESH_MQTT_BROKER=tcp://<coordinator-host>:1883
export SHOWMESH_MQTT_USERNAME=yard-left
export SHOWMESH_MQTT_PASSWORD='<printed password>'
export SHOWMESH_ASSET_DIR=/var/lib/showmesh/assets
./showmesh-agent
```

Arrange a service manager yourself after this test; the repository does not ship a production service installer yet.

## 4. Verify the result

```sh
showmeshctl nodes
showmeshctl node yard-left
```

The node should appear with fresh control-plane evidence. If your workflow uses declared nodes, run discovery and declare it in the UI or CLI.

## If it does not appear

- `not authorized` in the agent log: verify the username exactly matches the node ID and recheck the password.
- Broker connection retry: verify host, port, firewall, and the `tcp://` URL scheme.
- Startup validation failure: use the environment variable named in the error.
- Appears offline immediately: check for duplicate node/client IDs causing one MQTT client to displace another.

