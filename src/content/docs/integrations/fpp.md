---
title: FPP
description: Configure FPP observation and use the eight evidence-confirmed controls in the current build.
pageType: integration
maturity: experimental-testing
complexity: advanced
---

ShowMesh can poll configured FPP instances over REST, consume FPP status from MQTT, and dispatch eight primitive controls. FPP remains the scheduler and playback authority.

## Configure REST endpoints

Use the Operator UI configuration page or `showmeshctl config set`. Each endpoint has a ShowMesh ID and an HTTP base URL. The coordinator can then show playlist state, volume, MultiSync evidence, and collection health exposed by the current collector.

## Pair the plugin

After adding the endpoint, install and [pair the FPP plugin](../fpp-plugin/#pair-by-code). Use the matching plugin for your Core release; see the plugin installation instructions before upgrading.

## Configure FPP MQTT status

FPP MQTT is separate from the native ShowMesh agent control plane. Configure the broker, credentials, topic prefix, and a mapping from ShowMesh FPP IDs to FPP host names. The default topic root is `falcon/player`.

When using the bundled broker, `generate-credentials.sh` prints the dedicated `fpp` publisher password. Enter that credential in FPP's **System Configuration → MQTT** settings. The broker's access-control list also defines an optional read-only `observer` role that is never created by default; an operator who adds it can inspect FPP status topics without a credential that could publish to them.

The MQTT collector reports a distinct `connected_no_data` state when it is connected to the broker but has received no message on any subscribed FPP status topic for longer than its own silence threshold. This states only what was observed, not why: a broker that silently denies the read grant looks identical from here to a genuinely idle FPP host. Check the broker's access-control list and the FPP host's own MQTT publish configuration before assuming the FPP host is unreachable.

## Available controls

```sh
showmeshctl fpp start-playlist <id> <playlist-name>
showmeshctl fpp stop-playlist <id>
showmeshctl fpp stop-playlist-gracefully <id>
showmeshctl fpp pause-playlist <id>
showmeshctl fpp resume-playlist <id>
showmeshctl fpp next-playlist-item <id>
showmeshctl fpp prev-playlist-item <id>
showmeshctl fpp set-volume <id> <0-100>
```

These writes require `fpp:command`. ShowMesh sends FPP's own command and waits for observation evidence. A successful HTTP exchange alone is not reported as confirmed success.

## If a command times out

1. Look at the FPP device before retrying; the command may have taken effect without confirmable evidence.
2. Check the FPP instance's collection status and observation freshness.
3. Confirm the configured endpoint URL reaches the expected player.
4. For playlist operations, confirm the playlist exists and the player state permits the transition.

## Playlist evidence and readiness

The [FPP Plugin](../fpp-plugin/) posts imported playlist definitions and playlist-entry observations to the coordinator through machine-scoped API routes. ShowMesh only ever reads them back; it does not import a playlist definition on its own. Use these read-only commands to inspect what has been imported and observed:

```sh
showmeshctl fpp playlist-definitions list
showmeshctl fpp playlist-definitions get <instance-id> <playlist-hash>
showmeshctl fpp playlist-definitions entries <instance-id> <playlist-hash>
showmeshctl fpp playlist-entry-observations list
showmeshctl fpp playlist-entry-observations reconciliation <instance-id>
showmeshctl fpp playlist-readiness <playlist-id>
```

`playlist-entry-observations reconciliation` reports what the coordinator makes of one instance's latest accepted observation: `unbound`, `stale-import`, `unknown-entry`, `evidence-mismatch`, `cross-show`, or `resolved`. `playlist-readiness` reports whether one FPP-backed Playlist is ready. Neither replaces FPP's schedule or proves a playlist is runnable without current FPP and node evidence.

Two maintenance commands recover from an out-of-band change on the FPP side:

```sh
showmeshctl fpp reset-observation-sequence --confirm <instance-id>
showmeshctl fpp acknowledge-instance-uuid-change --confirm <instance-id>
```

Plugin operations sit beside the eight FPP primitives:

```sh
showmeshctl fpp set-brightness-ceiling <instance-id> <0-100>
showmeshctl fpp set-brightness-excluded-ranges <instance-id> "<start-channel>-<channel-count>"
showmeshctl fpp set-transition-gain <instance-id> <0-100>
showmeshctl fpp republish-playlist-definitions <instance-id>
```

[Brightness exclusions](../fpp-plugin/#exclude-fixture-channels-from-brightness-changes) protect selected fixture channels from brightness changes. Transition gain changes the plugin brightness multiplier and does not overwrite FPP's scheduled ceiling. Republish asks the host plugin to send definitions again; acceptance is not proof that an import arrived.

## Signed fallback program

The coordinator builds and signs a bounded map from known playlist-entry keys to pre-resolved Cue activations. The plugin can cache that program and send authorized activations directly to its target nodes when the coordinator is unavailable. The nodes verify the program and player signatures before executing. On return, the coordinator holds new Cue starts for that player while its fallback playlist runs. Follow [Recover after coordinator loss](../../guides/recover-after-coordinator-loss/) for readiness checks, handback, and recovery. Test the complete path on your installation before relying on it during a show.

## FPP-host plugin

The experimental [FPP Plugin](../fpp-plugin/) submits ShowMesh macro runs from an FPP host and leaves a host-local status record. Install it through FPP Plugin Manager and pair by code. It leaves FPP as the scheduler.
