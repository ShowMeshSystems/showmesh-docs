---
title: Check show health
description: A short triage path for the coordinator, evidence freshness, nodes, FPP, Resolume, and assets.
pageType: procedure
maturity: available
---

Use this order when you need visibility before making a change.

## Before you start

Have the coordinator address and a configured `showmeshctl` client available. These checks are read-only; preserve their output before restarting services or changing configuration.

## 1. Confirm the management plane

```sh
curl -fsS http://<coordinator-host>:8080/healthz
showmeshctl snapshot --server http://<coordinator-host>:8080
```

If health fails, check the coordinator container/process. Do not infer that local FPP or Resolume playback stopped.

## 2. Find missing or stale evidence

In the Operator UI, open the dashboard, then the Nodes, FPP, and Resolume pages. Prioritize collection failures and stale/unknown-age observations over cosmetic configuration differences.

```sh
showmeshctl nodes
showmeshctl fpp
showmeshctl resolume status
```

## 3. Check the active show, mode, and assets

```sh
showmeshctl show active
showmeshctl show mode
showmeshctl assets manifest --require-ready
```

`show mode` reports the installation-wide `program` or `show` mode. It is one value for the whole installation, never per-node or per-subsystem; today it changes only whether the Resolume WebSocket wake-up channel is held open (`program`) or closed (`show`). A non-ready manifest means expected bytes are not confirmed on a node. It does not prove playback has failed, and a ready manifest does not prove media can be decoded.

## 4. Check show night status and readiness

If the installation runs a night session, check its lifecycle state and current readiness before assuming a night command will be accepted:

```sh
showmeshctl night status
showmeshctl night readiness
```

`night readiness` is rejected when no preparation epoch is open. Read every check name and reason it returns before trusting it as a complete pre-flight; a plain `unknown` outcome does not by itself block a night command, but a missing or stale readiness result does.

## 5. Inspect recent history

```sh
showmeshctl events
showmeshctl run list --state running
```

Look for a command still waiting for evidence, a failed macro step, or a collection transition near the reported symptom.

## Before retrying a command

Check the target device directly. A confirmation timeout is uncertain, not a clean “nothing happened.” Repeating a start, next-item, or toggle-like operation blindly can make the state worse.
