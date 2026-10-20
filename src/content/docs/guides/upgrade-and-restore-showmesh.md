---
title: Upgrade and restore ShowMesh
description: Check component versions, preserve state, upgrade outside the show window, and recover from a failed upgrade.
pageType: procedure
maturity: experimental-active
complexity: advanced
---

Upgrade an installer-managed coordinator and its native nodes outside the show window, then confirm their versions and readiness. Use Core 0.3.1 with FPP plugin 0.3.0. Core includes the coordinator, Operator UI, and native agents; the plugin versions separately.

:::caution[Stop the show and protect credentials]
An upgrade restarts services. Stop the night before proceeding and retain native controls for FPP and Resolume. Backups include credentials and integration secrets; store them with restricted access. The experimental `0.x` line makes no compatibility or migration promise between versions.
:::

## Before you start

You need administrator access to the coordinator and each node, protected storage for backups, and the reviewed release packages. Identify whether the installation uses the installer or manual Compose; follow the matching path below. Keep local FPP and Resolume controls available during the maintenance window.

## 1. Check the installed components

Run these commands on the installer-managed coordinator. `sudo` lets the installed CLI wrapper read its protected credential file:

```sh
sudo showmeshctl version
sudo showmeshctl system versions
sudo showmeshctl night status
```

`version` compares the CLI and coordinator API. `system versions` lists reported coordinator, agent, and FPP plugin versions and the cached newest-release result. Check every node, including nodes that are offline; a missing report does not establish compatibility. For Core 0.3.1, every native agent must also run 0.3.1; plugin 0.3.0 is the matching plugin even though its patch number differs.

Choose a published release and read its release notes before downloading. Confirm its [artifacts and checksums](../../reference/release-artifacts/) exist. A version recorded on the source default branch does not prove its downloads are published.

The coordinator checks GitHub every six hours by default. A disabled or failed check is not proof that your installation is up to date. An administrator can inspect or change the check without installing anything:

```sh
sudo showmeshctl release settings get
sudo showmeshctl release settings set --interval 6h
```

Use `--enabled=false` to disable it. The interval accepts `5m` through `168h`. Check the last-check time and any reported problem before relying on the cached answer.

## 2. Stop the night and preserve state

Finish the active show using the [Show Night controls](../../using-showmesh/show-night/). Confirm `night status` reports `inactive` or `stopped`. Do not use the installer's `--force` option to bypass a running show.

Before an installer-managed coordinator upgrade, the installer copies the coordinator's data, environment, and broker files to `/var/backups/showmesh/<timestamp>-<old-version>/`. It writes `RESTORE.txt` and keeps the newest five backups. Media is copied while the coordinator keeps running, and a file unchanged since the previous backup is hardlinked to it rather than copied again. The coordinator stops only for a final pass that copies the database and anything uploaded during the first pass. Without `rsync`, the installer copies everything with the coordinator stopped. The upgrade stops if the copy fails; check free space under `/var/backups/showmesh`, then run the install command again. Keep a separate protected copy for longer retention, and preserve any asset storage you configured outside the coordinator data directory.

Record the installed versions and preserve custom deployment files and each node's `/etc/showmesh/agent.env` and durable asset/state directory. Copying configuration is not a substitute for retaining the release packages and images needed to restore it.

## 3. Upgrade the coordinator

For the released Core 0.3.1 baseline, download and review the bootstrap, then run it on the coordinator:

```sh
curl -fL https://github.com/ShowMeshSystems/showmesh/releases/download/v0.3.1/get-showmesh.sh -o get-showmesh.sh
less get-showmesh.sh
sudo bash get-showmesh.sh
```

For another reviewed release, substitute that release's exact tag in the download URL. The installer uses its saved role and preserves existing configuration, broker logins, and CLI credentials. It refuses if a night is running or the coordinator cannot report its night state.

Check the backup path printed by the installer. If it stops, preserve the error and inspect `/var/log/showmesh-install.log` locally. Repair the named cause before retrying; redact credentials before sharing diagnostic material.

## 4. Upgrade nodes and the FPP plugin

Run each node upgrade command printed by the coordinator installer on the named node. Alternatively, download and review the same Core release's bootstrap on each node and rerun it there. Enrolled nodes preserve their settings and state and skip enrollment; `--reenroll` rotates enrollment credentials and is not an ordinary upgrade step.

A node upgrade refuses a known running night but only warns when it cannot reach the coordinator. Confirm playback is stopped yourself before continuing after that warning.

Install the matching [FPP plugin release](../../integrations/fpp-plugin/) on every player. For Core 0.3.1, use plugin 0.3.0. Follow each component's release notes rather than assuming independently versioned components always share the same number.

## 5. Confirm recovery before the next show

```sh
curl -fsS http://<coordinator-host>:8080/readyz
sudo showmeshctl version
sudo showmeshctl system versions
sudo showmeshctl nodes
```

Replace `<coordinator-host>` with the coordinator address. Confirm store and broker readiness, the intended coordinator/agent versions, fresh online evidence from every required node, and the expected plugin version from each player. Open the Operator UI and confirm it connects. Run the next night's readiness check, then test the actual audio, render, FPP, and Resolume outputs before returning to show operation.

If a node stays offline, inspect `systemctl status showmesh-agent` and `journalctl -u showmesh-agent -n 50` on that node. If `/readyz` fails, use [Coordinator troubleshooting](../../troubleshooting/coordinator/). A successful version check alone does not establish device output or show readiness.

## Restore an installer backup

:::caution[Restoring replaces newer state]
A restore replaces database contents, configuration, and broker credentials with the backup's values. Preserve a separate copy of the failed installation before restoring. Forward-only SQLite migrations mean selecting an older image alone is not a rollback; restore the database backup that matches that older version.
:::

1. Stop the night and all affected output paths. Find the backup for the version you intend to restore.
2. Review its `RESTORE.txt` and confirm the deployment directory, Docker volume, and saved release version match your installation. Do not run restore instructions for another host or volume.
3. Follow that file's commands to stop the stack, replace its data and environment, restore broker files, and start the saved version.
4. Invalidate restored browser sessions immediately:

   ```sh
   cd /opt/showmesh/coordinator
   sudo docker compose -f docker-compose.yml -f docker-compose.published.yml exec coordinator \
     /usr/local/bin/showmesh-coordinator invalidate-all-sessions -yes
   ```

5. Sign in again and repeat the version, node, readiness, and output checks. Reconcile node credentials if a node was enrolled or reenrolled after the backup; restored broker files might no longer match that node's credentials.

Restoring old session-generation data can revive sessions revoked after the backup. Keep the failed-state copy until the restored installation is accepted.

## Manual Compose deployments

Use your deployment's Compose files and environment, rather than the installer's directory assumptions. Do not use `docker compose down -v`.

1. From your deployment directory, identify the actual data volume:

   ```sh
   docker volume ls --filter name=showmesh-data
   ```

2. Stop the coordinator using your deployment's normal Compose configuration. Confirm it is stopped before copying SQLite files.
3. Copy the volume to a protected backup directory. Replace `<actual-volume-name>` with the volume you identified and `<backup-directory>` with an existing absolute directory owned by the administrator:

   ```sh
   sudo docker run --rm \
     -v <actual-volume-name>:/data:ro \
     -v <backup-directory>:/backup alpine \
     tar czf /backup/showmesh-data.tar.gz -C /data .
   ```

4. Verify `tar tzf <backup-directory>/showmesh-data.tar.gz` lists the expected database and state files. An empty archive can indicate the wrong volume even when the copy command succeeds. Restrict access to the archive, then preserve `.env`, broker files, external asset storage, Compose files, and the old image versions or digests beside it.
5. Restart the coordinator and check `/readyz` before beginning the upgrade. If the copy fails, repair the backup first; do not upgrade without a usable backup.

For a published-image deployment, select the reviewed target version from the source checkout and start it with:

```sh
make deploy-up-published SHOWMESH_RELEASE_VERSION=<reviewed-version>
```

For a source deployment, check out the reviewed ref and run `make deploy-up`. After either change, perform the same readiness and output checks. To return to an older version after a schema migration, restore its matching data backup and configuration before starting it, then invalidate restored sessions. Keep a written restore procedure for your deployment and test it on an isolated host before depending on it.
