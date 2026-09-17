---
title: Current runs
description: Consume ShowMesh's runner-neutral, zero-to-many playback projection correctly.
pageType: reference
maturity: experimental-active
complexity: advanced
---

`GET /api/v1/current-runs` is the authoritative projection of playback that is current now. It is runner-neutral and returns zero to many runs: FPP is optional, and FPP plus ShowMesh-audio runs can appear concurrently.

Do not reconstruct this view from local Playlist order, raw FPP observations, or an assumed single global playhead.

## Projection responsibilities

The coordinator combines:

- active Show and generation context;
- runner identity and status;
- current item, position, duration, and freshness when available;
- FPP definition and observation reconciliation;
- Cue activation information;
- per-target render or audio evidence;
- an authoritative next item only when the runner provided one.

`next` is nullable by design. A client must not infer it from configuration when the runner has not established what will happen next.

## Full-frame updates

The `currentRuns.changed` server-sent event carries a complete replacement frame, not a patch. Replace the local current-runs collection as one unit.

The event is an optional prompt and has no resumable cursor. After an SSE reconnect, fetch `GET /current-runs` again. Do not assume a frame received before disconnect remains authoritative.

## State handling

Preserve distinctions among:

- no current run;
- runner evidence not yet observed;
- stale evidence;
- failed collection;
- unavailable integration;
- disconnected streaming transport;
- a current run with `next: null`.

Collapsing these into one “offline” or “idle” state removes information operators need during a show.

## Consumer sequence

1. Fetch the authenticated snapshot required by your client.
2. Fetch `/current-runs` for the full playback frame.
3. Connect to `/stream`.
4. Replace the frame when `currentRuns.changed` arrives.
5. After reconnect, refetch `/current-runs` before trusting the stream again.

The Operator UI applies this replacement and reconnect behavior. API consumers should follow the same contract rather than relying on UI implementation details.
