---
title: Resolume control or recovery failed
description: Diagnose configuration, composition identity, action confirmation, participation, blackout, and restore evidence.
pageType: troubleshooting
maturity: experimental-active
---

ShowMesh supports one Resolume instance. Identify whether the failure is reachability, composition identity, action confirmation, Show participation, or recovery before retrying.

## Record current state

```sh
showmeshctl resolume instance list
showmeshctl resolume status
showmeshctl resolume composition show
showmeshctl resolume recovery status
showmeshctl show participation get <show-id>
```

## Symptom: instance is unreachable

Confirm the base URL, network path, and Arena Web Server. Use current status and freshness, not saved configuration, to establish reachability.

Show Mode intentionally closes the Resolume WebSocket used for Program Mode interaction. That is not the same as the REST endpoint being unreachable.

## Symptom: composition references do not resolve

Upload the current `.avc` composition and inspect its stored identity. Re-check action bindings after changing it; ShowMesh uses named deck, layer, column, and clip references.

## Symptom: action is accepted but unconfirmed

Inspect the target evidence and latest observation. A timeout means the effect was not confirmed, not that Arena ignored it. Check Arena before retrying a non-idempotent action.

## Symptom: instance does not affect this Show

Check the Show's participation selection. Unrecorded, empty, and populated selections are different; readiness uses this choice to identify tonight's instance.

## Symptom: recovery or restore is incomplete

```sh
showmeshctl resolume recovery restore
showmeshctl resolume recovery status
```

Exit code `16` means restore was incomplete or partial. Inspect each reported step.

Automatic recovery does not prove Arena reopened a project or that a receiver or physical wall recovered. Check them directly.

## Symptom: Emergency Stop blackout is incomplete

Every Emergency Stop level sends Resolume blackout alongside FPP stop and audio-node silence. A failed blackout is an immediate-stop failure and appears as a Resolume target outcome. Inspect Arena directly when it is refused, failed, or unconfirmed.
