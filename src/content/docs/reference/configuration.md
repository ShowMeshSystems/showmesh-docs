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
- `show.mode`: the installation-wide operating mode (`program` or `show`).
- `show`, `show.surface`, `show.cue`, `show.playlist`, `show.action`, `show.macro`, and `show.active`: show authoring objects and the active-show pointer.
- `show.emergencystop`: each emergency-stop level's optional follow-up action list.
- `night.session` and `night.session.active`: Show Night session objects and the active-session pointer.

Do not invent environment variables for these records; use the OpenAPI schema (`api/openapi.yaml`) and compiled CLI help.

## Assets

- `SHOWMESH_ASSET_DIR`: coordinator asset-byte root; on the agent, node-local asset root (agent default `./assets`).
- `SHOWMESH_ASSET_MAX_UPLOAD_BYTES`: legacy/startup upload size ceiling.
- `SHOWMESH_ASSET_CONTENT_BASE_URL`: legacy/startup base URL agents use to fetch content.
- `SHOWMESH_ASSET_SYNC_INTERVAL`: legacy/startup coordinator sync interval; default `5m`.
- `SHOWMESH_ASSET_INVENTORY_INTERVAL`: legacy/startup inventory cadence; default `2m`.

The four `SHOWMESH_ASSET_*` settings above migrate as one group into revisioned `assets.settings`; when any is set, store-backed asset edits are blocked. `SHOWMESH_ASSET_DIR` does **not** migrate and remains environment-only. See [Install the Coordinator](../../getting-started/installation/#confirm-legacy-migration-before-removing-its-environment-values) for the deferred-migration and disagreement procedure.

## Native agent

The agent has no config file and no command-line flags: every setting is an environment variable, read once at process start (`internal/agent/config/config.go`).

| Variable | Default | Purpose |
|---|---|---|
| `SHOWMESH_NODE_ID` | OS hostname | Stable node ID (lowercase letters, digits, internal hyphens). Must equal the broker username provisioned for this node. |
| `SHOWMESH_NODE_LABEL` | empty | Human-readable label shown alongside the node ID. |
| `SHOWMESH_NODE_CAPABILITIES` | empty | Explicit `id` or `id:version` overrides, comma-separated. When set, the agent skips its own capability probing and advertises exactly this list; leave it unset in production so the agent probes its real GStreamer/NDI/audio support on every connect. |
| `SHOWMESH_MQTT_BROKER` | `tcp://localhost:1883` | Control-plane broker. |
| `SHOWMESH_MQTT_CLIENT_ID` | `showmesh-agent-<node-id>` | Must be unique; two agents sharing a client ID disconnect each other. |
| `SHOWMESH_ASSET_DIR` | `./assets` | Node-local downloaded assets and the agent's own durable state (render assignments, audio sessions). Set this explicitly; the default is relative to the process's working directory. |
| `SHOWMESH_AGENT_API_TOKEN` | empty | Bearer token this agent sends to the coordinator. Required on any node that will ever receive an FPP Connect upload: registering the resulting asset is a write gated by `asset:write`, and this listener binds on every node regardless of the coordinator's read policy. Also needed for `asset.fetch`'s own read from the coordinator when the coordinator has closed anonymous reads (`SHOWMESH_API_CLOSE_READS=true`); a node with reads left open needs no token for that half. Only the `admin` role currently carries `asset:write`. |
| `SHOWMESH_ASSET_INVENTORY_INTERVAL` | `2m` | Periodic asset-inventory publication. |
| `SHOWMESH_RENDER_REPORT_INTERVAL` | `15s` | Render-report publication cadence. |
| `SHOWMESH_AUDIO_REPORT_INTERVAL` | `15s` | Audio-report publication cadence. |
| `SHOWMESH_MULTISYNC_LISTEN_ADDR` | `:32320` | Local `host:port` the MultiSync listener binds (FPP's fixed control port). |
| `SHOWMESH_MULTISYNC_INTERFACE` | every suitable interface | Restrict the MultiSync multicast join to one named network interface. |
| `SHOWMESH_FPPCONNECT_LISTEN_ADDR` | `:80` | Listen address for the node's FPP Connect compatibility listener. It binds on every node; port 80 is what xLights expects, which is why the service unit grants `CAP_NET_BIND_SERVICE`. |
| `SHOWMESH_LOG_LEVEL` | `info` | `debug`, `info`, `warn`, or `error`. |

The agent also accepts the shared `SHOWMESH_MQTT_USERNAME`/`SHOWMESH_MQTT_PASSWORD` variables listed above.

### Render-node diagnostic output

These variables draw a moving diagnostic bar on a named surface as soon as the agent starts, with no coordinator, broker, FPP master, or assigned sequence required:

- `SHOWMESH_RENDER_DIAGNOSTIC_SURFACE`: names the surface. Empty (the default) disables the feature entirely; it never takes a surface a real assignment already owns.
- `SHOWMESH_RENDER_DIAGNOSTIC_WIDTH`, `SHOWMESH_RENDER_DIAGNOSTIC_HEIGHT`, `SHOWMESH_RENDER_DIAGNOSTIC_FRAME_RATE`: geometry and tick rate, default `1920`x`1080` at `40` fps. Setting any of these without `SHOWMESH_RENDER_DIAGNOSTIC_SURFACE` is refused at startup.
- `SHOWMESH_RENDER_DIAGNOSTIC_NDI_SOURCE_NAME`: the NDI source name it sends on. Left empty, the pipeline still runs into a fake sink and reports that honestly in its render report.

### GStreamer and tooling overrides

Only needed on the `build-agent-native` (cgo) build, and only when the binary is not on `PATH` under its normal name or a test needs to substitute a non-hardware sink:

- `SHOWMESH_GST_LAUNCH`, `SHOWMESH_GST_DISCOVERER`: override the resolved `gst-launch-1.0`/`gst-discoverer-1.0` paths.
- `GST_PLUGIN_PATH`: only needed on a render node that also needs the NDI output element (`ndisink`), which this project does not build or ship; set it to the directory holding a separately built `libgstndi.so`.
- `SHOWMESH_GST_AUDIO_SINK_FACTORY`: substitutes a non-hardware GStreamer sink factory (for example `fakesink`) for the production `alsasink`. Test and bench use only; setting this on a real node makes it report audio success without opening a real device.

`SHOWMESH_HW_ALSA_DEVICE`, `SHOWMESH_HW_CHANNELS`, and `SHOWMESH_HW_RATE` are not agent configuration. They gate one manual, opt-in Go test (`go test -tags showmesh_hwdevice`) that opens a real ALSA device and are not read by the agent binary itself.

## CLI

- `SHOWMESH_SERVER`: coordinator base URL; default `http://localhost:8080`.
- `SHOWMESH_CTL_TOKEN`: principal bearer token. Prefer it to `--token`, which can be visible in the process list.
