---
title: Diagnostics, health, and logs
description: Collect the evidence needed to distinguish process, broker, device, and authorization failures.
pageType: reference
maturity: available
---

Use these checks before changing configuration. They separate “the process is serving,” “the coordinator can operate,” and “a device was observed healthy”—three different facts in ShowMesh.

## Health endpoints

```sh
curl -i http://localhost:8080/healthz
curl -i http://localhost:8080/readyz
curl -s http://localhost:8080/version
```

- `/healthz` is liveness only. It returns `200` while the process serves HTTP, even when MQTT is unavailable.
- `/readyz` returns `200` only when both the MQTT broker connection and the SQLite store are ready. A broker or store failure returns `503` with a reason.
- `/version` reports the coordinator version, commit, build date, and Go version.

FPP or Resolume being down does not make `/readyz` fail. Inspect those resources separately.

## Capture state and history

```sh
showmeshctl snapshot --output json
showmeshctl events --output json
showmeshctl audit --output json
```

The snapshot is authoritative for the current view. Event history is ordered by its durable sequence number, but retained history can have a gap. The audit log requires the `audit:read` scope.

For live changes:

```sh
showmeshctl watch
```

After any interruption, `watch` fetches a new snapshot before applying changes. The underlying event stream has no resumable cursor.

## Read structured errors

API failures use `application/problem+json`. Preserve the response `type`, `detail`, and status. The CLI maps common conditions to distinct exit codes; run `showmeshctl help` for the complete table.

Common distinctions:

- Exit `2`: coordinator could not be reached.
- Exit `3`: no valid credential authenticated.
- Exit `7`: the credential authenticated but lacks a scope.
- Exit `9`: a command completed its request path but its effect was not confirmed by evidence.
- Exit `10`: the coordinator deliberately refused the operation because current state conflicts with it.
- Exit `14`: a follow operation went idle; the macro may still be running.
- Exit `20`: the active show's asset manifest is not ready.
- Exit `21`: no asset is proven missing, but at least one node's readiness is unknown.

## Logs

For the Compose deployment, collect logs from the coordinator, UI, and Mosquitto services around the same timestamp. Do not publish environment files, bearer tokens, passwords, session cookies, or complete URLs containing credentials.

Increase `SHOWMESH_LOG_LEVEL` to `debug` only for a bounded diagnostic window. Accepted levels are `debug`, `info`, `warn`, and `error`.
