---
title: Installation
description: Start the current source-built coordinator appliance and verify its health.
---

This procedure starts the coordinator, bundled Mosquitto broker, and Operator UI from the ShowMesh source tree.

## Prerequisites

- The ShowMesh source at the documented snapshot or a deliberately reviewed newer commit.
- Docker with Compose support.
- A terminal on the coordinator host.

## Start the stack

From the ShowMesh repository:

```sh
cd deploy
cp .env.example .env
./mosquitto/generate-credentials.sh
docker compose up -d --build
```

Credential generation is required before the first start. It creates the broker password and generated access-control files, puts coordinator and healthcheck credentials in `deploy/.env`, and prints the FPP publisher password once.

Check the containers and coordinator health:

```sh
docker compose ps
curl -fsS http://localhost:8080/healthz
```

Then open `http://localhost:8081` for the Operator UI.

## Expected result

- `coordinator`, `mosquitto`, and `ui` are running.
- The health request exits successfully.
- The UI loads. A disconnected state is possible while the coordinator is unavailable; the UI container intentionally starts independently.

## First administrator

The coordinator creates a one-time bootstrap code in its data directory. The UI presents the bootstrap flow when required. The API also supports `POST /api/v1/bootstrap`; scripted requests must pass the same-origin guard by sending either `Sec-Fetch-Site: same-origin` or an `Origin` header whose host, including the port, matches the request host. The schemes may differ when TLS terminates at a proxy.

## Immediate failures

**Mosquitto is crash-looping and reports `passwd is not a file`.** Run `./mosquitto/generate-credentials.sh`, then run `docker compose up -d` again.

**The coordinator refuses to start and names `SHOWMESH_API_TOKEN`.** Remove that retired variable. Use principals and API tokens; set `SHOWMESH_API_CLOSE_READS=true` if reads must require authentication.

**The UI loads but reports disconnected.** Check `curl -fsS http://localhost:8080/healthz`, then inspect `docker compose ps` and coordinator logs. UI health alone does not contact the coordinator.

:::caution[Do not expose this default stack to the internet]
The default read API is open and ShowMesh terminates no TLS. Use a trusted show VLAN and your own reverse proxy/security boundary when required.
:::
