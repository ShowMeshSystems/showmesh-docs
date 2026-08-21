---
title: Events and live state
description: Bootstrap from a snapshot, consume Server-Sent Events, and recover correctly after every interruption.
pageType: reference
maturity: available
complexity: advanced
---

Connect to `GET /api/v1/stream` using a Server-Sent Events client.

## Required client sequence

1. Open the stream.
2. Receive `stream.start`, which carries `snapshotRequired: true`.
3. Fetch `GET /api/v1/snapshot`.
4. Apply subsequent change frames.
5. On any disconnect, reconnect and fetch a fresh snapshot again.

The stream emits no `id:` field, ignores `Last-Event-ID`, and is not resumable. Per-connection `seq` values are not durable cursors. This differs from the durable sequence on event-history records.

## Event names

Current event names are:

- `stream.start`
- `node.changed`
- `fpp.changed`
- `event.recorded`
- `macroRun.changed`
- `resolume.changed`
- `resolumeRecovery.changed`
- `stream.reset`

With the exact query `?deltas=1`, the stream may also emit `fpp.observations.changed`. Any other `deltas` value behaves as though the option were absent. A delta-aware client must still process `fpp.changed`, because structural FPP changes use that event.

Ignore unknown event names for forward compatibility. Ignore `: keepalive` comments; they contain no event data.

## Known v1 gap

The stream does not announce deletion of an entire node or FPP resource. The `removed` list in `fpp.observations.changed` only removes observations from an FPP instance that still exists. Periodic resnapshotting or a resnapshot after any interruption prevents deleted resources from remaining indefinitely in a client model.

The stream ends without a terminating event, including during orderly coordinator shutdown.
