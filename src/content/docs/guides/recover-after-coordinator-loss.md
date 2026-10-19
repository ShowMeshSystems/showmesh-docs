---
title: Recover after coordinator loss
description: Inspect FPP fallback playback, restore the coordinator, and resolve a held player deliberately.
pageType: procedure
maturity: experimental-testing
complexity: advanced
---

Restore coordinator control without interrupting an FPP player that is already running its playlist through the ShowMesh plugin's fallback program. FPP keeps scheduling and playback authority throughout.

:::caution[Test recovery before a show]
A cached fallback program does not prove that nodes can execute it or that physical outputs remain correct. Rehearse coordinator loss and return on a separate player with the intended assets, routes, clocks, and receivers before relying on this path during a show. Do not restart working players or nodes merely because the coordinator is unavailable.
:::

## Before you start

You need a paired [FPP plugin](../../integrations/fpp-plugin/), the active Show's Cue catalog and assets on every target node, and a current signed fallback program. The player must be able to reach its target nodes directly. Nodes require the pinned coordinator key and the authorized player identity to accept fallback requests.

While the coordinator is available, use a credential with read access to inspect the program:

```sh
showmeshctl fallback list
showmeshctl fallback show <fpp-instance-uuid>
```

Use the player UUID from `fallback list`, which can differ from the configured endpoint ID. Confirm that the expected program is published and acknowledged as current. Inspect the target nodes and outputs during a separate recovery test; acknowledgement alone is insufficient.

## 1. Check playback before changing anything

1. Inspect the FPP player's own playlist and playback state. Record the playlist, current item, position, and time of the failure.
2. Check the plugin's local state on the player and the actual audio, lighting, and video outputs. Record errors before restarting any process.
3. If FPP is still playing correctly, leave it running while you restore the coordinator's service and network connection. If output is unsafe, use the installation's independent stop or power-isolation procedure. An unreachable coordinator cannot confirm a stop.

The fallback program has an expiry time. Nodes refuse new fallback activations after expiry; already started Cues can keep playing. Do not assume expiry stops physical outputs or completes a playlist safely.

## 2. Inspect the coordinator after it returns

Run the read-only commands again:

```sh
showmeshctl fallback list
showmeshctl fallback show <fpp-instance-uuid>
showmeshctl night status
```

Show Night and the CLI identify a player running on fallback and explain when the coordinator is holding it. A hold prevents new coordinator Cue starts for that player while its plugin controls the fallback playlist. It is expected during recovery, not an instruction to restart the player.

Wait for the playlist to finish and for fresh plugin reports and program acknowledgement. If the plugin stops reporting, preserve the warning and check the player's process and connection. The coordinator can release a hold when fresh FPP evidence establishes that the fallback playlist has ended; do not substitute a guessed playlist position for that evidence.

## 3. Confirm handback

1. Confirm the player's fallback playlist has ended on FPP itself.
2. Confirm `fallback show` no longer reports the coordinator holding the player, and inspect any outstanding acknowledgement or plugin-report warning.
3. Check current playback and fresh node reports. Confirm the actual outputs match the intended state before starting another playlist or resuming normal operation.

If a program is stale or rejected, restore the plugin connection and reconcile the active Show, catalog, assets, and program acknowledgement before another recovery test. If nodes refuse activations, preserve their reported reason and logs; check identity, signature, target, expiry, and local assets rather than repeatedly replaying the request.

## Release a stuck state deliberately

Use this only when you have inspected the player, confirmed the fallback run has ended, and established that its plugin cannot release the coordinator's stored state normally. Record `fallback show` output and the player's actual state first. Clearing requires `fpp:command`:

```sh
showmeshctl fallback clear --confirm <fpp-instance-uuid>
```

This forgets the coordinator's stored fallback state. It does not stop the player, clear node media, or repair the plugin. A plugin still running fallback reports again and can cause the player to be held again; clearing is not a way to take a running show away from it.

Recheck `fallback show`, Show Night, node reports, and physical outputs. If the hold returns or evidence remains missing, stop issuing new playback requests, repair the named connection or plugin fault, and retain the player UUID, program identity, timestamps, and logs for diagnosis.
