---
title: Install the coordinator
description: Build and start the current coordinator appliance, establish an administrator, and protect its state.
pageType: procedure
maturity: experimental-active
complexity: advanced
---

This is the supported installation path for the current pre-release. It starts three services on one host: the coordinator, an authenticated Mosquitto broker, and the Operator UI. Native nodes run elsewhere; add them only after this host is healthy.

The primary path pulls the published coordinator and Operator UI images at a pinned release version. Building from source remains supported as a secondary path, for example when contributing to ShowMesh itself.

:::caution[Start on an isolated show-management network]
The default bundle publishes MQTT on `1883`, the coordinator API on `8080`, and the Operator UI on `8081`. The read API is open to every machine that can reach it, and ShowMesh does not terminate TLS. Do not expose this default stack directly to the public internet.
:::

## 1. Choose the coordinator host

Use a host that can run Docker and remains powered for the whole operating window. Before installing, decide:

- which trusted VLAN or firewall zone will contain the coordinator, UI, broker, FPP players, and native nodes;
- which host will retain the coordinator's persistent Docker volumes and backups;
- whether operators will use the Operator UI locally, through a trusted management network, or through an operator-managed TLS reverse proxy.

The coordinator must reach configured FPP and Resolume hosts. Each native node must reach the MQTT broker. Keep `1883`, `8080`, and `8081` limited to the systems that genuinely need them.

## 2. Obtain the deployment bundle and verify Docker

Install Git, Docker Engine or Docker Desktop, and the Docker Compose v2 plugin. The `deploy/` directory (the Compose files, the Mosquitto configuration, and `generate-credentials.sh`) lives in the ShowMesh repository, so the deployment bundle and the source are the same clone. Check out the release tag you intend to run:

```sh
git clone https://github.com/ShowMeshSystems/showmesh.git
cd showmesh
git checkout v<release-version>
docker compose version
```

`v<release-version>` is the pushed release tag, for example `v0.1.0`, matching a version published as GHCR images (see [Releasing ShowMesh Core](https://github.com/ShowMeshSystems/showmesh/blob/main/docs/RELEASING.md) for what a release tag produces). See [Requirements](../requirements/) for the current platform boundaries.

Building the coordinator and UI locally instead of pulling published images remains supported, for example when contributing to ShowMesh itself: skip step 4's `docker-compose.published.yml` override and run `make -C .. deploy-up` alone, which builds both images from this checkout before starting them.

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

Run the bundle from the published images, at the release version you checked out (without the leading `v`, for example `0.1.0`):

```sh
make -C .. deploy-up-published SHOWMESH_RELEASE_VERSION=<release-version>
docker compose ps
curl -fsS http://localhost:8080/healthz
curl -fsS http://localhost:8080/readyz
```

`make -C .. deploy-up-published` adds `docker-compose.published.yml` as a Compose override, which replaces the coordinator and Operator UI `build:` blocks with `image:` references pinned to `SHOWMESH_RELEASE_VERSION` and pulls them from GHCR instead of building. `SHOWMESH_RELEASE_VERSION` must be passed on the `make` command line as shown; setting it only in `deploy/.env` is read by a direct `docker compose` invocation but not by this `make` target's own precondition check, and the command exits with an error naming the variable before it reaches Compose. To build from source instead, run `make -C .. deploy-up` in place of the command above. Bypassing both and running `docker compose up -d --build` directly refuses to start: `deploy/docker-compose.yml` requires `VERSION`, `COMMIT`, and `BUILD_DATE` build arguments and names the `make` targets in its error rather than falling back to placeholder values.

Open `http://<coordinator-host>:8081` from the trusted management network. The expected first result is:

- `coordinator`, `mosquitto`, and `ui` are running;
- `/healthz` succeeds, which proves the HTTP process is serving;
- `/readyz` succeeds, which additionally proves the coordinator can reach its SQLite store and MQTT broker;
- the Operator UI loads, even if it later reports that the coordinator is disconnected.

The UI container deliberately has no dependency on coordinator health. A UI page that loads is not evidence that the coordinator is ready; use `/readyz` for that question.

## 5. Create the first administrator

The coordinator writes a one-time bootstrap code into its persistent data volume, never to a log. Claim it either from the Operator UI, which needs no CLI or build tooling, or from the coordinator container.

**From the Operator UI:** open `http://<coordinator-host>:8081`. An unclaimed coordinator shows a bootstrap form asking for the code, an administrator name, a password, and a label for this device. The coordinator image ships no shell, so copy the code file out with `docker compose cp` rather than `exec`-ing into the container:

```sh
docker compose cp coordinator:/var/lib/showmesh/bootstrap-code.txt ./bootstrap-code.txt
cat ./bootstrap-code.txt
```

Paste that code into the form along with your chosen name, password, and device label, and submit it. A browser submitting this form always carries the header the coordinator requires (below), so nothing further is needed.

**From the coordinator container**, claim it without a browser at all:

```sh
docker compose exec coordinator showmesh-coordinator bootstrap \
  -name "<administrator name>"
```

The command reads the code from the mounted data volume by default and prompts for a password. This path claims the code directly against the data volume rather than over HTTP, so it is unaffected by the header requirement below.

Either path expires the code after 24 hours and deletes it after a successful claim; a second claim attempt fails because no code remains.

### The claim endpoint requires a same-origin request

`POST /api/v1/bootstrap` is unauthenticated by construction (no administrator exists yet to authenticate as), so it is instead gated to same-origin callers to close cross-site forgery against it. The check (shared with `POST /api/v1/session`) reads two browser-set headers, checked in order, and a request carrying neither is refused:

1. If the request carries a `Sec-Fetch-Site` header, the request is accepted only when its value is exactly `same-origin`.
2. Otherwise, if the request carries an `Origin` header, the request is accepted only when that origin's host matches the `Host` the request was addressed to.
3. A request with neither header is refused.

A refused request gets `403 Forbidden` with a `CSRF check failed` problem body. A browser submitting the Operator UI's own bootstrap form always satisfies this, so the UI path above needs no extra step. Scripting the same call with `curl` needs the header added explicitly, since `curl` sends neither by default:

```sh
curl -sS -X POST http://<coordinator-host>:8080/api/v1/bootstrap \
  -H 'Content-Type: application/json' \
  -H 'Sec-Fetch-Site: same-origin' \
  -d '{"code":"<code from bootstrap-code.txt>","name":"<administrator name>","password":"<password>","deviceLabel":"<device label>"}'
```

After creating the administrator, issue a token for a local CLI or automation identity (optional; skip this if you only need the Operator UI). The token is displayed once, so store it in an appropriate secret manager:

```sh
docker compose exec coordinator showmesh-coordinator issue-token \
  -principal "<administrator name>" \
  -label "local showmeshctl"
```

Building `showmeshctl` needs Go tooling; this is not required for a Docker-and-browser-only installation. Skip to step 6 and use the Operator UI if you do not need the command line. Otherwise, build the CLI from the source root and point it at the coordinator:

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

On the published-image path, upgrading or rolling back is a pinned-version change: take a volume backup first (see above), then set `SHOWMESH_RELEASE_VERSION` to the reviewed target version and re-run:

```sh
make -C .. deploy-up-published SHOWMESH_RELEASE_VERSION=<reviewed-version>
```

On the from-source path, upgrading or rolling back is a source checkout plus a rebuild:

```sh
git fetch --tags
git checkout <reviewed-ref>
make deploy-up
```

Either way, SQLite migrations are forward-only: returning to an older version after a newer one migrated the database requires restoring the matching pre-upgrade backup, not just pointing at the older version or ref again.

## First-start failures

**Mosquitto crash-loops with `Error: /mosquitto/config/passwd is not a file.`** Run `./mosquitto/generate-credentials.sh` in `deploy/`, then run `docker compose up -d` again.

**The coordinator names `SHOWMESH_API_TOKEN` and will not start.** Remove that retired variable. Use principals and issued tokens; do not replace it with another shared token.

**`/healthz` returns 200 but `/readyz` returns 503.** Read the JSON `reason`, then check the broker connection and the coordinator data volume. FPP and Resolume availability do not determine coordinator readiness.

**The Operator UI loads but says disconnected.** Check `/healthz`, `/readyz`, `docker compose ps`, and `docker compose logs coordinator`. UI health does not probe the coordinator.

For deeper failures, see [Coordinator troubleshooting](../../troubleshooting/coordinator/).
