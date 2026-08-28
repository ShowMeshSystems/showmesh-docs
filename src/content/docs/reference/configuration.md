---
title: Configuration
description: Runtime environment variables for the coordinator, native agent, and CLI.
pageType: reference
maturity: available
complexity: advanced
---

This page lists the supported runtime entry points. Secrets should come from the deployment secret mechanism, not committed environment files.

## Coordinator basics

| Variable | Default | Purpose |
|---|---|---|
| `SHOWMESH_HTTP_ADDR` | `:8080` | HTTP listen address. |
| `SHOWMESH_DATA_DIR` | `/var/lib/showmesh` | SQLite, revision data, and local coordinator state. |
| `SHOWMESH_MQTT_BROKER` | `tcp://localhost:1883` | ShowMesh control-plane broker URL. |
| `SHOWMESH_MQTT_CLIENT_ID` | `showmesh-coordinator` | Coordinator MQTT client ID. |
| `SHOWMESH_MQTT_USERNAME` | empty | Optional broker user. |
| `SHOWMESH_MQTT_PASSWORD` | empty | Optional broker password. |
| `SHOWMESH_LOG_LEVEL` | `info` | `debug`, `info`, `warn`, or `error`. |

`SHOWMESH_API_TOKEN` is retired. A non-empty value makes the coordinator refuse to start; an unset or empty value is tolerated. Remove the variable rather than relying on the empty-value compatibility behavior.

## API and identity

- `SHOWMESH_API_ALLOWED_ORIGINS`: comma-separated browser origins; empty emits no CORS headers.
- `SHOWMESH_API_CLOSE_READS`: require authentication for reads when true. Writes always require authentication.
- `SHOWMESH_API_SECURE_COOKIE`: set true when HTTPS is provided in front of ShowMesh.
- `SHOWMESH_API_TRUST_CLIENT_ADDR`: trust the forwarded client-address boundary when deliberately configured.
- `SHOWMESH_API_LOGIN_CONCURRENCY`, `SHOWMESH_API_LOGIN_QUEUE_WAIT`, `SHOWMESH_API_LOGIN_PER_SOURCE_DELAY`, `SHOWMESH_API_LOGIN_MAX_DELAY`: login cost and delay controls.

## Integrations

- `SHOWMESH_FPP_ENDPOINTS`: legacy/startup comma-separated `id=url` endpoints. The active configuration is revisioned through `fpp.endpoints`; this legacy value blocks store-backed edits until its migration is deliberately resolved.
- `SHOWMESH_FPP_MQTT_BROKER_URL`, `SHOWMESH_FPP_MQTT_USERNAME`, `SHOWMESH_FPP_MQTT_PASSWORD`, `SHOWMESH_FPP_MQTT_TOPIC_PREFIX`, `SHOWMESH_FPP_MQTT_HOSTS`: legacy/startup FPP MQTT configuration. The default topic root is `falcon/player`; the whole group blocks store-backed edits until its migration is deliberately resolved.
- `SHOWMESH_INTEGRATION_BROKERS`: named brokers used by configured integration actions.
- `SHOWMESH_RESOLUME_URL`, `SHOWMESH_RESOLUME_ID`: legacy/startup Resolume instance; the default ID is `resolume` when an instance URL is present. This pair blocks store-backed edits until its migration is deliberately resolved.
- `SHOWMESH_RESOLUME_POLL_INTERVAL`, `SHOWMESH_RESOLUME_WEBSOCKET_DISABLED`: Resolume collection tuning.
- `SHOWMESH_RESOLUME_RECOVERY_SETTLE`: recovery settle delay, default `8s`, maximum `60s`. The default is a ShowMesh hypothesis, not a measured production value.

## Revisioned media configuration

Some newer media settings are revisioned API configuration, not environment variables. Use the API or `showmeshctl` to inspect the exact schema in the binary you run:

- `fppconnect.settings`: enablement and storage limits for experimental node-side FPP Connect ingestion.
- `render.settings`: render-node defaults and limits.
- `audio.settings` and `audio.node`: experimental local-audio/LTC settings and node output declarations.
- `show.mode`, `show.cue`, `show.playlist`, and `night.session`: development-state show operation configuration.

These records do not establish that physical media paths or FPP-host packaging have been commissioned. Do not invent environment variables for them; the OpenAPI schema and compiled CLI help are authoritative.

## Assets

- `SHOWMESH_ASSET_DIR`: coordinator asset-byte root; on the agent, node-local asset root (agent default `./assets`).
- `SHOWMESH_ASSET_MAX_UPLOAD_BYTES`: legacy/startup upload size ceiling.
- `SHOWMESH_ASSET_CONTENT_BASE_URL`: legacy/startup base URL agents use to fetch content.
- `SHOWMESH_ASSET_SYNC_INTERVAL`: legacy/startup coordinator sync interval; default `5m`.
- `SHOWMESH_ASSET_INVENTORY_INTERVAL`: legacy/startup inventory cadence; default `2m`.

The four `SHOWMESH_ASSET_*` settings above migrate as one group into revisioned `assets.settings`; when any is set, store-backed asset edits are blocked. `SHOWMESH_ASSET_DIR` does **not** migrate and remains environment-only. See [Install the Coordinator](../../getting-started/installation/#confirm-legacy-migration-before-removing-its-environment-values) for the deferred-migration and disagreement procedure.

## Native agent

| Variable | Default | Purpose |
|---|---|---|
| `SHOWMESH_NODE_ID` | OS hostname | Stable node ID. |
| `SHOWMESH_NODE_LABEL` | empty | Human-readable label. |
| `SHOWMESH_NODE_CAPABILITIES` | empty | Explicit `id` or `id:version` overrides, comma-separated. |
| `SHOWMESH_MQTT_BROKER` | `tcp://localhost:1883` | Control-plane broker. |
| `SHOWMESH_MQTT_CLIENT_ID` | derived from node ID | Must be unique. |
| `SHOWMESH_ASSET_DIR` | `./assets` | Node-local downloaded assets. |
| `SHOWMESH_AGENT_API_TOKEN` | empty | Bearer token for asset reads when reads are closed. |
| `SHOWMESH_ASSET_INVENTORY_INTERVAL` | `2m` | Periodic inventory publication. |

The agent also accepts the shared MQTT username, password, and log-level variables listed above.

## CLI

- `SHOWMESH_SERVER`: coordinator base URL; default `http://localhost:8080`.
- `SHOWMESH_CTL_TOKEN`: principal bearer token. Prefer it to `--token`, which can be visible in the process list.
