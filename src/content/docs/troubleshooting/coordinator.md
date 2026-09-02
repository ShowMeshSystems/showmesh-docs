---
title: Coordinator unavailable or not ready
description: Separate a stopped HTTP process from an MQTT or SQLite readiness failure.
pageType: troubleshooting
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

## Symptom: `docker compose up` refuses to start, naming `SHOWMESH_VERSION`/`SHOWMESH_COMMIT`/`SHOWMESH_BUILD_DATE`

`deploy/docker-compose.yml` requires all three build-arg variables and refuses to build without them, because a deployed coordinator that cannot say which commit it is running is not a safe default. Do not set them by hand. Use the wrapping make target instead, run from the repository root:

```sh
make deploy-up
```

This derives all three from the checked-out git ref automatically (`make deploy-build` builds only the image, without starting the stack). After it is running, confirm the commit actually deployed:

```sh
curl -s http://localhost:8080/version
```

## Symptom: the FPP MQTT collector reports connected but no data

Preserve the collector state before restarting anything:

```sh
showmeshctl snapshot --output json
```

Look for the `fpp-mqtt` entry in the `collectors` list. A state of `connected_no_data` means the collector's broker connection is up but it has received no message on any subscribed topic for at least 30 seconds since that connection came up. This states only what was observed, never why: a silently denied broker read grant looks identical here to a genuinely idle topic.

Check, in order:

1. The topic prefix: `showmeshctl fpp-mqtt get` reports the configured prefix. The default is `falcon/player`; confirm it matches what the real FPP publishes to on this broker.
2. The host map: every MQTT host mapping in `fpp.mqtt` must refer to an FPP endpoint that exists in `fpp.endpoints`, and the mapped `HostName` must match FPP's own reported hostname exactly.
3. FPP's own MQTT publisher credential and its ACL on this broker: a broker connection that authenticates but is denied read on the relevant topics produces exactly this state.

`showmeshctl fpp-mqtt set` changes take effect without a coordinator restart; the collector follows within about ten seconds.

### Confirm recovery

Rerun `showmeshctl snapshot --output json` and confirm the `fpp-mqtt` collector's state has returned to `running`, and that at least one `fpp.*` signal from this source carries a fresh observation time.
