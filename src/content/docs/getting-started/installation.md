---
title: Install the coordinator
description: Build and start the current coordinator appliance, establish an administrator, and protect its state.
pageType: procedure
maturity: experimental-active
complexity: advanced
---

This is the supported installation path for the current source-built development version. It starts three services on one host: the coordinator, an authenticated Mosquitto broker, and the Operator UI. Native nodes run elsewhere; add them only after this host is healthy.

:::caution[Start on an isolated show-management network]
The default bundle publishes MQTT on `1883`, the coordinator API on `8080`, and the Operator UI on `8081`. The read API is open to every machine that can reach it, and ShowMesh does not terminate TLS. Do not expose this default stack directly to the public internet.
:::

## 1. Choose the coordinator host

Use a host that can run Docker and remains powered for the whole operating window. Before installing, decide:

- which trusted VLAN or firewall zone will contain the coordinator, UI, broker, FPP players, and native nodes;
- which host will retain the coordinator's persistent Docker volumes and backups;
- whether operators will use the Operator UI locally, through a trusted management network, or through an operator-managed TLS reverse proxy.

The coordinator must reach configured FPP and Resolume hosts. Each native node must reach the MQTT broker. Keep `1883`, `8080`, and `8081` limited to the systems that genuinely need them.

## 2. Obtain the source and verify Docker

Install Git, Docker Engine or Docker Desktop, and the Docker Compose v2 plugin. Then obtain the ShowMesh revision you intend to run:

```sh
git clone https://github.com/ShowMeshSystems/showmesh.git
cd showmesh
git rev-parse --short HEAD
docker compose version
```

There are no published coordinator images yet. The first start builds the coordinator and UI locally, so the host needs access to the source dependencies while building. See [Requirements](../requirements/) for the current platform boundaries.

## 3. Create installation-specific broker credentials

The bundled broker requires credentials. From the source checkout, make the local environment file and generate the broker material **before** starting Compose:

```sh
cd deploy
cp .env.example .env
./mosquitto/generate-credentials.sh
```

This command creates the gitignored password and access-control files, writes the coordinator and broker-healthcheck credentials into `deploy/.env`, and prints the dedicated FPP publisher password once. Save that FPP password in the appropriate FPP configuration when you set up MQTT; it is not printed again.

Do not create broker users by hand in the repository. Use the bundled scripts so the password file and access-control list stay consistent.

## 4. Start and verify the stack

```sh
make -C .. deploy-up
docker compose ps
curl -fsS http://localhost:8080/healthz
curl -fsS http://localhost:8080/readyz
```

`docker compose up -d --build`, run directly instead of through `make -C .. deploy-up`, refuses to start: `deploy/docker-compose.yml` requires `VERSION`, `COMMIT`, and `BUILD_DATE` build arguments and names the `make` targets in its error rather than falling back to placeholder values. `make -C .. deploy-up` sets them from the source checkout and starts the stack; `make -C .. deploy-build` builds the same image without starting it.

Open `http://<coordinator-host>:8081` from the trusted management network. The expected first result is:

- `coordinator`, `mosquitto`, and `ui` are running;
- `/healthz` succeeds, which proves the HTTP process is serving;
- `/readyz` succeeds, which additionally proves the coordinator can reach its SQLite store and MQTT broker;
- the Operator UI loads, even if it later reports that the coordinator is disconnected.

The UI container deliberately has no dependency on coordinator health. A UI page that loads is not evidence that the coordinator is ready; use `/readyz` for that question.

## 5. Create the first administrator

The coordinator writes a one-time bootstrap code into its persistent data volume. Use the Operator UI bootstrap flow, or claim it locally from the coordinator container:

```sh
docker compose exec coordinator showmesh-coordinator bootstrap \
  -name "<administrator name>"
```

The command reads the code from the mounted data volume by default and prompts for a password. The code expires after 24 hours and is deleted after a successful claim; it is deliberately never written to logs.

After creating the administrator, issue a token for a local CLI or automation identity. The token is displayed once, so store it in an appropriate secret manager:

```sh
docker compose exec coordinator showmesh-coordinator issue-token \
  -principal "<administrator name>" \
  -label "local showmeshctl"
```

Build the CLI from the source root and point it at the coordinator:

```sh
cd ..
make build
export SHOWMESH_SERVER=http://<coordinator-host>:8080
export SHOWMESH_CTL_TOKEN='<issued token>'
./bin/showmeshctl nodes
```

Writes require an authenticated principal with the named scope. Reads are open by default; set `SHOWMESH_API_CLOSE_READS=true` in `deploy/.env` before starting the stack if read access must also require authentication.

## 6. Configure integrations without restarting

Use the Operator UI or `showmeshctl` to configure FPP endpoints and the one supported Resolume Arena instance. These settings are held in the coordinator's store and take effect without a coordinator restart.

- Continue with [FPP](../../integrations/fpp/) to add players and, if wanted, configure FPP MQTT.
- Continue with [Resolume Arena](../../integrations/resolume/) to add Arena and import a composition identity map.
- Continue with [Install a native node](../../guides/add-a-node/) only after the broker and first administrator are working.

Before assigning any ShowMesh asset to a separate native node, configure `assets.settings.contentBaseUrl` to the HTTP(S) coordinator URL that node can reach. It is empty by default, so asset transfer remains disabled until an administrator configures it:

```sh
./bin/showmeshctl assets settings set \
  --content-base-url http://<node-reachable-coordinator>:8080
```

Use the externally reachable coordinator hostname, never `localhost` for a separate node host. When reads are closed, give each node a dedicated, least-privilege API identity. Never copy an administrator token into a node environment:

```sh
./bin/showmeshctl principal create \
  --name "yard-left asset fetch" \
  --kind machine \
  --role viewer
# Copy the principal ID printed by the preceding command.
./bin/showmeshctl token issue \
  --label "yard-left asset fetch" \
  <principal-id>
```

Put the issued value in that node's `SHOWMESH_AGENT_API_TOKEN`. The `viewer` role supplies the `node:read` access needed for asset fetching without granting control or configuration writes.

### Confirm legacy migration before removing its environment values

:::caution[Preserve the authoritative configuration]
These environment groups are startup migration inputs, not normal configuration: `SHOWMESH_FPP_ENDPOINTS`; all `SHOWMESH_FPP_MQTT_*` variables; `SHOWMESH_RESOLUME_URL` and `SHOWMESH_RESOLUME_ID`; and the four coordinator `SHOWMESH_ASSET_*` settings (`CONTENT_BASE_URL`, `MAX_UPLOAD_BYTES`, `SYNC_INTERVAL`, and `INVENTORY_INTERVAL`). `SHOWMESH_ASSET_DIR` is not migrated and remains environment-only. A legacy group deliberately blocks store-backed edits while it is present.

Remove a migrated group only after the coordinator reports that its environment value **matches the active store configuration exactly**. If a request reports that startup migration was **deferred**, do **not** remove the corresponding variable: it is still the only configuration copy. Repair the coordinator data volume (for example, a full, read-only, or damaged volume) and restart; migration is retried on every boot.

If startup refuses because the environment and store configurations **disagree**, do not delete the variable merely to make startup succeed. Compare both configurations and deliberately choose the authority. To retain the environment change, record it, intentionally switch to the store-backed configuration, and then apply the recorded value through the Operator UI or CLI. To retain the store value, confirm it is correct before removing the matching legacy group. Restart once after a deliberate removal.
:::

## Secure the operating boundary

The recommended initial boundary is a trusted show-management VLAN. If operators need HTTPS from another network, put an operator-managed TLS reverse proxy in front of the Operator UI and API; the Compose bundle does not provide one. Set `SHOWMESH_API_SECURE_COOKIE=true` when that proxy terminates TLS.

Never treat the browser UI as the only recovery path. `showmeshctl` is a first-class client, and a running node or show is designed not to depend on the UI container staying up.

## Protect state before changing versions

The `showmesh-data` Docker volume holds SQLite state, bootstrap material, principal/token data, and some integration secrets. Treat it as credential-bearing data.

Before any upgrade and on a regular operating schedule:

1. Find the real Compose-prefixed volume name. Do not assume it is literally `showmesh-data`.

   ```sh
   docker volume ls --filter name=showmesh-data
   ```

2. Copy the returned volume to a protected backup location. For example, replace `<actual-volume-name>` with the name from the preceding command:

   ```sh
   docker run --rm \
     -v <actual-volume-name>:/data \
     -v "$(pwd)":/backup alpine \
     tar czf /backup/showmesh-data-$(date +%Y%m%d).tar.gz -C /data .
   ```

3. Verify the archive is non-empty with `tar tzf <archive>`. A wrong volume name can produce an empty archive with a successful exit code.

After restoring a volume backup, start the stack and invalidate restored sessions immediately:

```sh
docker compose exec coordinator showmesh-coordinator invalidate-all-sessions -yes
```

Restoring old session-generation data can otherwise revive sessions that were revoked after the backup.

## Upgrade deliberately

Current upgrades are source checkouts plus a rebuild, not image-tag changes:

```sh
git fetch --tags
git checkout <reviewed-ref>
make deploy-up
```

SQLite migrations are forward-only. Take a volume backup first: returning to an older source ref after a newer ref migrated the database requires restoring the matching pre-upgrade backup.

## First-start failures

**Mosquitto crash-loops with `Error: /mosquitto/config/passwd is not a file.`** Run `./mosquitto/generate-credentials.sh` in `deploy/`, then run `docker compose up -d` again.

**The coordinator names `SHOWMESH_API_TOKEN` and will not start.** Remove that retired variable. Use principals and issued tokens; do not replace it with another shared token.

**`/healthz` returns 200 but `/readyz` returns 503.** Read the JSON `reason`, then check the broker connection and the coordinator data volume. FPP and Resolume availability do not determine coordinator readiness.

**The Operator UI loads but says disconnected.** Check `/healthz`, `/readyz`, `docker compose ps`, and `docker compose logs coordinator`. UI health does not probe the coordinator.

For deeper failures, see [Coordinator troubleshooting](../../troubleshooting/coordinator/).
