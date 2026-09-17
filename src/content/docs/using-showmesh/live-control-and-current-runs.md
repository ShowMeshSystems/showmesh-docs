---
title: Live Control and current runs
description: Read current playback, direct-fire Cues, and operate show controls without inventing state.
pageType: concept
maturity: experimental-active
---

Live Control presents what the coordinator currently knows about playback and exposes actions appropriate to the signed-in principal. Its current-runs model is zero-to-many: FPP and ShowMesh audio can be active concurrently, and several targets can contribute evidence to one logical run.

## Read the frame

Each run identifies its runner, Show/generation context, current item, timing and freshness when known, reconciliation state, and per-target evidence. `next` appears only when the runner supplied an authoritative next item. A blank next item does not mean the Playlist ended.

Treat stale, unavailable, unobserved, failed, and disconnected evidence as different conditions. The page refetches the full current-runs frame after reconnect instead of applying old stream updates to a possibly changed baseline.

## FPP and audio authority

FPP remains the schedule and playhead authority for FPP-backed playback. ShowMesh reconciles its playlist definition and entry observations rather than inventing position from configured order.

ShowMesh-audio runs report node-local session and target evidence. Multi-node output includes aligned or unaligned status per target; one node's success is not the group's success.

## Direct Cue activation

The Announcements control uses direct Cue activation. It requires `cue:activate` and fires the stored Cue outside FPP observation-driven playback. Multi-node announcements are prepared and scheduled for one shared instant when clock evidence permits.

Use direct activation only for Cues intended for operator invocation. The result names missing assets, target failures, or unaligned starts instead of collapsing them into an accepted request.

## Emergency controls

Emergency Stop affects all three immediate target kinds: FPP, declared audio nodes, and configured Resolume instances. See [Emergency stop](../emergency-stop/) before show operation; the higher levels also alter the active Night lifecycle.

## Before acting

Confirm:

- the active Show and generation;
- which FPP and Resolume instances participate in that Show;
- evidence freshness;
- the exact target rows affected by the control;
- whether the result is confirmed, unconfirmed, refused, failed, or unaligned.

An HTTP acceptance or button acknowledgement is not device-effect evidence.
