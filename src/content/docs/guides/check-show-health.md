---
title: Check show health
description: A short triage path for the coordinator, evidence freshness, nodes, FPP, Resolume, and assets.
pageType: procedure
maturity: available
---

Use this order when you need visibility before making a change.

## Before you start

Have the coordinator address and a configured `showmeshctl` client available. Preserve read results before restarting services or changing configuration. The readiness step can deploy stale Cue catalogs; review that step before using it during operation.

## 1. Confirm the management plane

```sh
curl -fsS http://<coordinator-host>:8080/healthz
showmeshctl snapshot --server http://<coordinator-host>:8080
```

If health fails, check the coordinator container/process. Do not infer that local FPP or Resolume playback stopped.

## 2. Find missing or stale evidence

In the Operator UI, open **Dashboard**, then **Monitor → Fleet** for nodes and participating FPP and Resolume instances. Use **Signals** for observations, **Activity** for recent events, **Capabilities** for advertised node support, and **Manifest** for required files. Prioritize collection failures and stale or unknown-age observations.

In Fleet's **Versions** section, compare the coordinator, node agents, and FPP plugins. Preserve any mismatch or unreported-version reason before changing software.

```sh
showmeshctl nodes
showmeshctl fpp
showmeshctl resolume status
showmeshctl show active
showmeshctl show participation get <show-id>
```

## 3. Check the active show, mode, and assets

```sh
showmeshctl show active
showmeshctl show mode
showmeshctl assets manifest --require-ready
```

`show mode` reports one installation-wide value. In addition to Resolume connection behavior, Show Mode pins Cue authorization to the active Show generation and catalog revision. A non-ready manifest means expected bytes are not confirmed on a node. It does not prove playback failed, and a ready manifest does not prove media can be decoded.

Check Live Control or `GET /api/v1/current-runs` for the authoritative zero-to-many playback frame. Do not infer a global next item from Playlist order. For audio targets, also inspect `audio node get`, `node-clock get`, and any current alignment warning.

## 4. Check show night status and readiness

If the installation runs a night session, check its lifecycle state and current readiness before assuming a night command will be accepted:

```sh
showmeshctl night status
showmeshctl night readiness
```

`night readiness` is rejected when no preparation epoch is open. Read every check and reason. `ready_with_warnings` permits start but preserves degraded evidence. If readiness becomes stale, `night start` runs a fresh pass and reports that result rather than trusting the older one.

## 5. Inspect recent history

```sh
showmeshctl events
showmeshctl run list --state running
```

Look for a command still waiting for evidence, a failed macro step, or a collection transition near the reported symptom.

## Before retrying a command

If Live Control reports a stopped Night or a weather banner, follow [Emergency Stop recovery](../../using-showmesh/emergency-stop/#resume-after-stop) or [Handle a weather delay](../handle-a-weather-delay/) before restarting output.

Check the target device directly. A confirmation timeout is uncertain, not a clean “nothing happened.” Repeating a start, next-item, or toggle-like operation blindly can make the state worse.
