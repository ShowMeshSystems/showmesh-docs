---
title: Resolume control or recovery failed
description: Diagnose configuration, composition identity, action confirmation, participation, blackout, and restore evidence.
pageType: troubleshooting
maturity: experimental-active
---

ShowMesh supports one configured Resolume instance. Separate endpoint reachability, composition identity, action confirmation, Show participation, and recovery state before retrying a control.

## Capture evidence

```sh
showmeshctl resolume instance list
showmeshctl resolume status
showmeshctl resolume composition show
showmeshctl resolume recovery status
showmeshctl show participation get <show-id>
```

## Symptom: instance is unreachable

Confirm the configured base URL, network path, and Arena Web Server. A configured instance is desired state; current status and observation freshness establish reachability.

Show Mode intentionally closes the Resolume WebSocket used for Program Mode interaction. That is not the same as the REST endpoint being unreachable.

## Symptom: composition references do not resolve

Upload the current `.avc` composition and inspect the stored composition identity. ShowMesh actions use named deck, layer, column, and clip references rather than unstable numeric object IDs.

Re-check affected action bindings after changing or re-uploading a composition.

## Symptom: action is accepted but unconfirmed

Inspect the action's per-target evidence and the latest Resolume observations. A timeout means the effect was not confirmed; it does not prove Arena ignored the request. Check Arena before retrying a non-idempotent action.

## Symptom: instance does not affect this Show

Check the Show's participation selection. Absent, explicitly empty, and populated selections are distinct. Readiness and attention views use this selection when deciding which configured instance belongs to tonight's Show.

## Symptom: recovery or restore is incomplete

```sh
showmeshctl resolume recovery restore
showmeshctl resolume recovery status
```

Exit code `16` means restore was incomplete or partial. Inspect each reported step; do not reduce a partial restore to success because the process returned a response.

Automatic recovery is limited to the configuration and evidence ShowMesh owns. It does not prove Arena reopened a project, the output reached a receiver, or the physical wall recovered.

## Symptom: Emergency Stop blackout is incomplete

Every Emergency Stop level sends Resolume blackout alongside FPP stop and audio-node silence. A failed blackout is an immediate-stop failure and appears as a Resolume target outcome. Inspect Arena directly when it is refused, failed, or unconfirmed.
