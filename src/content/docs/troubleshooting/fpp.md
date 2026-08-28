---
title: FPP unreachable or command unconfirmed
description: Distinguish collection failure, refusal, dispatch failure, and missing confirming evidence.
pageType: troubleshooting
---

## Symptom: an FPP instance is missing

```sh
showmeshctl fpp
showmeshctl config get
```

An instance must be configured in `fpp.endpoints`. Confirm its ID and base URL, then test reachability from the coordinator host. A configured but unreachable FPP instance should remain visible with collection-failure evidence; it should not disappear or make the coordinator itself unready.

## Symptom: a command returns unconfirmed

An HTTP success is not enough for ShowMesh to call a device command successful. The coordinator dispatches the command, polls observed FPP state, and confirms only when the expected change appears before the deadline.

1. Read the CLI's evidence message.
2. Run `showmeshctl fpp <id>` and inspect the relevant observation.
3. Confirm the FPP API remains reachable throughout the operation.
4. For playlist commands, check whether a different playlist or stale evidence caused a deliberate conflict.

Exit `9` means the request path worked but evidence did not confirm the effect. Exit `10` is a deliberate state conflict. They are not transport failures and should not be handled as though the coordinator vanished.

## Symptom: MQTT observations do not appear

FPP REST collection and FPP MQTT ingestion are separate. Inspect `showmeshctl fpp-mqtt get`, the broker URL, topic prefix, and host map. Every MQTT host mapping must refer to an FPP endpoint that exists.

## Symptom: FPP Connect content was not usable on a node

Inspect the node's reported channel-range result:

```sh
showmeshctl fppconnect status <node-id>
```

An explicit dropped range names why the node could not use it. An empty result can mean no surface is configured. Do not substitute a channel range manually from memory; correct the surface or source configuration, then recheck. This experimental path is not yet a supported production deployment workflow.

## Symptom: the experimental FPP plugin did not run a macro

On the FPP host, run:

```sh
showmesh-fpp-plugin status
```

`refused` means the plugin credential was rejected; `rejected` means the coordinator declined the requested macro; `unreachable` means the coordinator could not be reached or returned a server error; and `local_error` means the host could not validate its own credential, configuration, or arguments. The command reads the host-local record and does not need a working coordinator connection.

The plugin is not a supported production installation path. Do not attempt a broad FPP restart as a substitute for diagnosing its local status and credential boundary.
