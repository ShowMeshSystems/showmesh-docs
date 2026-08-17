---
title: Coordinator unavailable or not ready
description: Separate a stopped HTTP process from an MQTT or SQLite readiness failure.
---

## Symptom: connection refused or timeout

1. Run `curl -i http://localhost:8080/healthz` from the coordinator host.
2. If local health succeeds, check the hostname, port, proxy, and firewall from the client host.
3. Confirm `SHOWMESH_HTTP_ADDR`; the default listener is `:8080`.
4. Inspect coordinator logs for startup validation errors.

The coordinator deliberately refuses to start if the retired `SHOWMESH_API_TOKEN` variable has a non-empty value. An unset or empty value is tolerated, but remove the variable rather than relying on that compatibility behavior. Use principal tokens with `SHOWMESH_CTL_TOKEN` in the CLI instead.

## Symptom: `/healthz` is 200 but `/readyz` is 503

Read the JSON `reason` from `/readyz`. Current readiness depends on both the MQTT broker connection and the coordinator's SQLite store. For broker failures, check `SHOWMESH_MQTT_BROKER`, broker availability, the network path, and optional MQTT credentials. For store failures, inspect the reason and coordinator logs, then check the data directory, permissions, and available storage.

Do not diagnose FPP or Resolume from `/readyz`: those integrations expose their own health and observations and do not control coordinator readiness.

## Symptom: reads work but writes return 401 or 403

- `401` means the request did not authenticate. Confirm `SHOWMESH_CTL_TOKEN` is set to a current principal token.
- `403` means authentication succeeded but the principal lacks the required scope. Run `showmeshctl session` and have an administrator adjust the role if appropriate.

Reads are open by default unless `SHOWMESH_API_CLOSE_READS=true`; writes always require authentication.
