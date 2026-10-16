---
title: Set up dashboard previews
description: Show low-rate live video of render node NDI output, Resolume Arena NDI output, and RTSP cameras on the Operator UI Dashboard.
pageType: procedure
maturity: experimental-testing
complexity: advanced
---

This guide adds a **Live previews** section to the Operator UI Dashboard. Each tile shows a small, low-rate picture of one NDI source or one RTSP camera, so you can see what a projection or a camera is showing without walking to it.

Previews come from the **preview gateway**, a separate container that runs beside the coordinator. It receives the video and hands browsers a small stream. Nothing in the show depends on the gateway: if it stops, the tiles say so and the show keeps running.

Previews are for looking, not measuring. A tile can lag the real output by a second or more, and ShowMesh does not analyze the picture.

## Before you start

You need:

- a coordinator installed or upgraded with the 0.4.0 installer, on a host that can see the NDI sources and cameras on the local network;
- `sudo` on the coordinator host;
- an Operator UI login that holds `config:write`, such as an administrator, or `showmeshctl` on the coordinator host;
- for NDI tiles, the NDI runtime library `libndi.so.6` for the host's architecture, from the NDI SDK for Linux;
- for camera tiles, each camera's `rtsp://` or `rtsps://` address.

ShowMesh does not include the NDI runtime. Without it the gateway still shows RTSP cameras, and NDI tiles report that NDI is not available.

:::caution[Secrets]
The gateway token and each camera address are secrets. A camera address often carries a user name and password. The token is stored in `/opt/showmesh/coordinator/.env`, which only root can read. Use files rather than typing either secret on a command line, where it can stay in shell history.
:::

## 1. Place the NDI runtime

Skip this step if you only want camera tiles.

Copy `libndi.so.6` for the host's architecture (`x86_64` or `aarch64`) from the NDI SDK into its own directory:

```sh
sudo mkdir -p /opt/ndi
sudo cp <sdk-path>/lib/<architecture>/libndi.so.6 /opt/ndi/
```

Replace `<sdk-path>` with the directory where you unpacked the SDK and `<architecture>` with the folder that matches the host. The gateway mounts this directory read-only.

## 2. Create a gateway token

```sh
openssl rand -hex 32 | sudo tee /etc/showmesh/preview-gateway.token > /dev/null
sudo chmod 600 /etc/showmesh/preview-gateway.token
```

The coordinator and the gateway must hold the same token. You give it to both in the next steps.

## 3. Turn on the gateway in the coordinator's settings

Add three lines to `/opt/showmesh/coordinator/.env`:

```sh
cd /opt/showmesh/coordinator
echo "COMPOSE_PROFILES=preview" | sudo tee -a .env > /dev/null
echo "SHOWMESH_PREVIEW_GATEWAY_TOKEN=$(sudo cat /etc/showmesh/preview-gateway.token)" | sudo tee -a .env > /dev/null
echo "SHOWMESH_NDI_RUNTIME_DIR=/opt/ndi" | sudo tee -a .env > /dev/null
```

`COMPOSE_PROFILES=preview` tells the coordinator's Compose bundle to run the gateway. Because it lives in `.env`, a later installer upgrade starts the matching gateway version along with the coordinator. The installer keeps lines it did not write.

If you skipped step 1, leave out the `SHOWMESH_NDI_RUNTIME_DIR` line. The gateway then looks in `/opt/ndi`, finds nothing, and serves cameras only.

## 4. Start the gateway

```sh
cd /opt/showmesh/coordinator
sudo docker compose -f docker-compose.yml -f docker-compose.published.yml up -d preview-gateway
sudo docker compose -f docker-compose.yml -f docker-compose.published.yml ps preview-gateway
```

The `ps` output shows the container as `healthy` within about a minute. The gateway uses the host's network directly, because NDI discovery uses mDNS and browsers receive the video over UDP.

If the container exits at once, read its log:

```sh
sudo docker compose -f docker-compose.yml -f docker-compose.published.yml logs preview-gateway
```

A message that port `8555` is in use means another program holds the WebRTC port. Add `SHOWMESH_PREVIEW_GATEWAY_WEBRTC_PORT=<free-port>` to `.env` and start the gateway again.

## 5. Open the gateway's ports

Skip this step if the host has no active firewall. The installer's firewall setup does not open these ports.

| Port | Protocol | Who connects |
| --- | --- | --- |
| `8095` | TCP | The coordinator, to control the gateway. |
| `8555` | TCP and UDP | Browsers that show the Dashboard, for the video. |
| `5353` | UDP | NDI senders answering discovery. |

For example, with `ufw`:

```sh
sudo ufw allow 8095/tcp
sudo ufw allow 8555
sudo ufw allow 5353/udp
```

## 6. Point the coordinator at the gateway

In the Operator UI, open **Settings**, then the **Dashboard** tab:

1. In **Gateway address**, enter `http://<coordinator-host>:8095`, using the host's LAN address.
2. In the token field, paste the token from `/etc/showmesh/preview-gateway.token`.
3. Select **Save dashboard settings**.

Use the LAN address even though the gateway runs on the same host. The coordinator runs in its own container, where `localhost` is the coordinator itself, not the host.

With `showmeshctl` on the coordinator host, the same step reads the token from its file. Run `showmeshctl` there with `sudo`, because the installer saved its login where only root can read it.

```sh
sudo showmeshctl preview gateway set --url http://<coordinator-host>:8095 --token-file /etc/showmesh/preview-gateway.token
```

An address must be only the scheme, host, and port. The coordinator refuses a path, a query, or a fragment.

## 7. Add cameras

Optional. In **Settings**, **Dashboard**, select **Add a camera**, then fill in:

- **Camera id**: 1 to 64 lowercase letters, digits, or hyphens, such as `driveway`. It cannot change later.
- **Name**: what the tile shows, such as `Driveway`.
- The camera's address, starting with `rtsp://` or `rtsps://`.
- **Stream this camera**: clear it to keep the camera saved without showing a picture.

Select **Save dashboard settings**. After saving, the page shows only the address's scheme, host, and port. The full address is never shown again.

With `showmeshctl`, put the address in a file first:

```sh
sudo showmeshctl preview camera add driveway --name Driveway --url-file <address-file>
```

## 8. Check the result

Open the **Dashboard**. A **Live previews** section appears after **System health**, with one tile per NDI source the gateway can see and one per camera. New sources are added at the end.

From a terminal:

```sh
sudo showmeshctl preview list
```

Expected output, abbreviated:

```text
gateway: reachable
KEY                        LABEL                  STATE  HIDDEN  MESSAGE
ndi:NODE-01 (matrix-main)  NODE-01 (matrix-main)  live           -
camera:driveway            Driveway               live           -
```

A render node's NDI source is labeled with the node and surface it belongs to when the coordinator can match them. Other NDI sources show their NDI name.

## Arrange the tiles

Drag a tile, or use its earlier, later, and hide buttons. Hidden tiles are listed under **Hidden tiles**, where you can show them again. Arranging tiles needs `dashboard:write`, which the operator and administrator roles hold. Viewing previews needs `observation:read`.

The same changes from a terminal:

```sh
sudo showmeshctl preview layout move <key> --to <index>
sudo showmeshctl preview layout hide <key>
sudo showmeshctl preview layout show <key>
```

`<key>` is the value in the `KEY` column of `showmeshctl preview list`. `<index>` counts from 0.

If two people arrange tiles at the same time, the second save is refused and the Dashboard asks you to reload, so neither change is silently lost.

## Read a tile

Each tile shows a state word. The message under it, when there is one, names the next step.

| State | Meaning |
| --- | --- |
| Live | The picture is current. The caption shows how many seconds ago the last frame arrived. |
| Stale | No new frame for 10 seconds. The last picture stays, with its age, until the gateway reports why. |
| Connecting | The gateway is starting this stream. |
| Idle | The stream is set up, and no video has started because nobody is watching it. |
| Not found | The NDI source is no longer announced, or the camera did not answer. |
| Disabled | The camera is saved with **Stream this camera** cleared. |
| Error | The stream could not start. Check the gateway log. |

The Dashboard connects only the tiles on screen. When a browser cannot receive video directly, the tile falls back to a still picture every 2 seconds.

## Troubleshoot

**Every tile says the gateway cannot be reached.** Check, in order:

1. The container is `healthy` (step 4).
2. The address in **Settings**, **Dashboard** uses the host's LAN address, not `localhost`.
3. The token in `.env` matches the one saved in **Settings**. To replace it, set a new one in both places, then restart the gateway with the step 4 command.
4. Port `8095/tcp` is open (step 5).

**NDI tiles say NDI is not available.** Confirm `libndi.so.6` is in the directory named by `SHOWMESH_NDI_RUNTIME_DIR` and matches the host's architecture. Then restart the gateway:

```sh
sudo docker compose -f docker-compose.yml -f docker-compose.published.yml restart preview-gateway
```

**An NDI source you expect has no tile.** The gateway finds sources with mDNS, which does not cross routers. Put the coordinator host on the same network segment as the sender, and check that `5353/udp` is open. A sender that stopped without announcing it can keep its tile until its mDNS record expires.

**A camera tile is slow to show a picture.** A still picture waits for the camera's next keyframe. Set the camera to send a keyframe every 1 to 2 seconds.

**Tiles stay on still pictures and never show live video.** The browser cannot reach port `8555` on the host. Open it for TCP and UDP. If browsers reach the host through a different address than the host's own, such as through a VPN, add `SHOWMESH_PREVIEW_GATEWAY_WEBRTC_CANDIDATES=<address>` to `.env` and restart the gateway.

## Turn previews off

1. In **Settings**, **Dashboard**, clear **Gateway address** and save. The **Live previews** section disappears from the Dashboard.
2. Stop the gateway:

   ```sh
   cd /opt/showmesh/coordinator
   sudo docker compose -f docker-compose.yml -f docker-compose.published.yml stop preview-gateway
   ```

3. Remove the `COMPOSE_PROFILES=preview` line from `.env` so a later upgrade does not start it again.

Your cameras and tile layout stay saved, so turning previews back on restores them.

## Run the gateway on another host

The gateway can also run on its own Linux host, for example one closer to the NDI senders. The [preview gateway README](https://github.com/ShowMeshSystems/showmesh/tree/main/deploy/preview-gateway) in the ShowMesh repository describes that layout. Point the coordinator at that host's address in step 6.
