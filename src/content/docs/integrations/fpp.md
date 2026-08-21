---
title: FPP
description: Configure FPP observation and use the eight evidence-confirmed controls in the current build.
pageType: integration
maturity: experimental-testing
---

ShowMesh can poll configured FPP instances over REST, consume FPP status from MQTT, and dispatch eight primitive controls. FPP remains the scheduler and playback authority.

## Configure REST endpoints

Use the Operator UI configuration page or `showmeshctl config set`. Each endpoint has a ShowMesh ID and an HTTP base URL. The coordinator can then show playlist state, volume, MultiSync evidence, and collection health exposed by the current collector.

## Configure FPP MQTT status

FPP MQTT is separate from the native ShowMesh agent control plane. Configure the broker, credentials, topic prefix, and a mapping from ShowMesh FPP IDs to FPP host names. The default topic root is `falcon/player`.

When using the bundled broker, `generate-credentials.sh` prints the dedicated `fpp` publisher password. Enter that credential in FPP's **System Configuration → MQTT** settings.

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

## Plugin status

The source builds a `showmesh-fpp-plugin` binary, but this snapshot does not provide a verified production packaging/install path for an FPP host. Do not make it part of the standard installation yet.
