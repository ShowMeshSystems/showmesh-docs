---
title: Install a Native Node
description: Build a native ShowMesh agent, give it one broker identity, make it survive reboot, and verify it is visible.
status: experimental-active
---

This guide installs the shared native-agent foundation used by render and future audio nodes. The agent runs directly on the node host so it can access local media hardware; it is not another Compose service.

:::note[Current distribution boundary]
ShowMesh has no published agent package or installer yet. This guide builds from source and uses a small systemd unit as a starting point. Review it against any local GPU, audio, or device-access policy before production use.
:::

## 1. Choose a stable identity and host path

Choose a node ID made from lowercase letters, digits, and internal hyphens, such as `yard-left`. The ID is both the MQTT username and the durable identity in ShowMesh, so do not reuse it for a different machine.

The bundled broker reserves `coordinator`, `fpp`, and `healthcheck`; do not use those names. Choose an absolute asset directory on local storage—for example `/var/lib/showmesh/assets`—rather than relying on the agent's relative default.

## 2. Provision one broker credential

On the coordinator source checkout, create the node's credential:

```sh
cd deploy
./mosquitto/add-agent-credential.sh yard-left
```

Copy the generated password when it is printed. It is shown once. The script also updates the broker access-control list, so do not substitute a shared credential or edit Mosquitto files by hand.

## 3. Build and place the agent on the node

On a systemd-based Linux node, create the dedicated service account first if it does not already exist:

```sh
sudo useradd --system --user-group \
  --home-dir /var/lib/showmesh --create-home \
  --shell /usr/sbin/nologin showmesh
```

Then obtain the reviewed ShowMesh source revision and build the binaries:

```sh
git clone https://github.com/ShowMeshSystems/showmesh.git
cd showmesh
make build
sudo install -d -o showmesh -g showmesh -m 0750 \
  /etc/showmesh /var/lib/showmesh/assets
sudo install -m 0755 ./bin/showmesh-agent /usr/local/bin/showmesh-agent
```

If your host manages service accounts another way, use its equivalent before running the installation commands. Ensure that account can write the asset directory and access any hardware the node role requires.

## 4. Write the node environment

Create `/etc/showmesh/agent.env`, owned by root and readable only by the service account:

```ini
SHOWMESH_NODE_ID=yard-left
SHOWMESH_NODE_LABEL=Yard left player
SHOWMESH_MQTT_BROKER=tcp://<coordinator-host>:1883
SHOWMESH_MQTT_USERNAME=yard-left
SHOWMESH_MQTT_PASSWORD=<generated password>
SHOWMESH_ASSET_DIR=/var/lib/showmesh/assets
```

Then protect it:

```sh
sudo chown root:showmesh /etc/showmesh/agent.env
sudo chmod 0640 /etc/showmesh/agent.env
```

`SHOWMESH_MQTT_BROKER` must include a supported URL scheme such as `tcp://`. A password without a username is rejected. If the coordinator closes anonymous API reads, create a dedicated machine viewer token from an administrator CLI session—do not reuse a human administrator token:

```sh
showmeshctl principal create \
  --name "yard-left asset fetch" \
  --kind machine \
  --role viewer
# Copy the principal ID printed by the preceding command.
showmeshctl token issue \
  --label "yard-left asset fetch" \
  <principal-id>
```

Add the issued value as `SHOWMESH_AGENT_API_TOKEN` in this node's environment. The viewer role has the `node:read` permission the asset endpoint needs, without administrator control or configuration access.

For any node that must receive assets, an administrator also needs to configure `assets.settings.contentBaseUrl` to an HTTP(S) coordinator URL reachable **from the node**. The default is empty, so asset synchronization is deliberately disabled until an operator sets it:

```sh
showmeshctl assets settings set \
  --content-base-url http://<node-reachable-coordinator>:8080
```

Do not use `localhost` for a separate node host.

## 5. Start under systemd

Create `/etc/systemd/system/showmesh-agent.service`:

```ini
[Unit]
Description=ShowMesh native agent
Wants=network-online.target
After=network-online.target

[Service]
Type=simple
User=showmesh
Group=showmesh
EnvironmentFile=/etc/showmesh/agent.env
ExecStart=/usr/local/bin/showmesh-agent
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

Load and start the service:

```sh
sudo systemctl daemon-reload
sudo systemctl enable --now showmesh-agent
sudo systemctl status showmesh-agent
journalctl -u showmesh-agent -f
```

The first agent log should say it connected to the broker and published its hello. Treat a running service as a local-process check only; complete the coordinator-side verification next.

## 6. Admit and verify the node

From a machine with an administrator token:

```sh
showmeshctl nodes
showmeshctl node yard-left
showmeshctl discover
showmeshctl declare -label "Yard left player" yard-left
```

The node should have fresh control-plane evidence and become declared. Declaration is required before a surface can target the node or ShowMesh can evaluate its show-targeted asset readiness.

## If the node does not appear

- **`mqtt broker rejected connection: not authorized`:** the username must exactly equal the node ID. Recheck the generated password and provision a replacement deliberately if it was lost.
- **The agent keeps retrying its broker connection:** verify the coordinator hostname, port, firewall, and `tcp://` scheme from the node host.
- **The service starts but exits:** run `journalctl -u showmesh-agent -e`; startup validation names the invalid environment variable.
- **The node becomes offline immediately:** check for a duplicate node ID or MQTT client ID. One MQTT client displaces the other.
- **Assets never become ready:** verify the asset-directory permissions and, when reads are closed, `SHOWMESH_AGENT_API_TOKEN`.

See [Nodes](../../using-showmesh/nodes/) for the evidence and declaration model, and [Node troubleshooting](../../troubleshooting/nodes/) for diagnosis after installation.
