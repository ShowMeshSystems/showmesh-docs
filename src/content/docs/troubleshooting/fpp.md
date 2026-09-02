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

## Symptom: a Playlist reports not ready

```sh
showmeshctl fpp playlist-readiness <playlist-id>
```

Read the reported failing condition; the ten defined conditions and what each one means:

- `definition-missing`: no stored FPP playlist definition matches this binding.
- `definition-superseded`: a newer stored definition exists for the same instance and playlist name. This means the FPP playlist was edited, independent of playback.
- `entry-not-in-definition`: an entry's section and position do not exist in the stored definition.
- `entry-filename-mismatch`: an entry's expected filename does not match the definition at that position.
- `cue-not-ready`: a referenced Cue does not exist, has never been activated, or belongs to a different Show than the Playlist.
- `observation-hash-mismatch`: the latest accepted observation for this FPP instance carries a playlist hash different from the binding's. A warning rather than a failure when no observation has been received at all.
- `evidence-unavailable`: an observation exists but could not establish identity, so it carries nothing to compare. Distinct from no observation at all: this is a check that had evidence and could not conclude anything from it.
- `node-render-unassigned`: a referenced Cue declares a render output, and a node holding the relevant surface has no confirmed render assignment for it. The reported reason distinguishes a node that is not reporting at all from one that is online with no assignment, or one whose evidence has aged past its window.
- `node-catalog-stale`: a node holding a resolved output for this Playlist's Show has not acknowledged the exact catalog revision the active Show requires right now. Skipped when this Playlist's Show is not the active Show.
- `exclusive-claim-conflict`: two Cues this Show's Playlists could concurrently run hold a colliding exclusive resource claim.
- `assets-missing`: a node that must render or play a Cue in this Playlist does not hold an asset that has been uploaded and resolved to it.

Fix the named cause, then rerun `fpp playlist-readiness` and confirm it reports ready before relying on the Playlist in a show.

## Symptom: the fallback program is missing, stale, or mismatched

The coordinator's own side of the signed fallback program exists; there is no CLI for it yet, and FPP-host execution lives in the separate FPP plugin, unverified on real FPP hardware. Inspect the coordinator's record directly:

```sh
curl -fsS -H "Authorization: Bearer <token>" \
  http://<coordinator-host>:8080/api/v1/fallback-programs
curl -fsS -H "Authorization: Bearer <token>" \
  http://<coordinator-host>:8080/api/v1/fallback-programs/<fpp-instance-id>
```

The list endpoint returns metadata only, never the signed payload. The per-instance endpoint returns the full signed program the coordinator most recently published for that FPP instance, plus `acknowledgedStatus` (`fallback-program-current`, `fallback-program-stale`, `fallback-program-rejected`, or `fallback-program-unacknowledged`) and, when set, the `acknowledgedPackageId` and `acknowledgedAt` a host last reported back through `POST /api/v1/fallback-programs/{fppInstanceId}/acknowledge`. `published: false` with no `program` or `signatureBase64` means this coordinator has never successfully compiled and published a program for this host at all. Publication itself runs as a background reconciliation loop on the coordinator; these endpoints only read what that loop has already written.

Do not assume a real FPP host is actually running the program these endpoints describe: nothing in this path has been exercised against a real xLights, FPP, or the FPP plugin's own host-side execution.
