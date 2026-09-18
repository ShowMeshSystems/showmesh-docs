---
title: Live Control and current runs
description: Read current playback, direct-fire Cues, and operate show controls without inventing state.
pageType: concept
maturity: experimental-active
---

Live Control shows current playback and the actions available to the signed-in principal. FPP and ShowMesh audio can run at the same time, and one run can contain evidence from several targets.

## Read the frame

Each run identifies its runner, Show and generation, current item, freshness, and target evidence. `next` appears only when the runner supplied it; a blank value does not mean the Playlist ended.

Treat stale, unavailable, unobserved, failed, and disconnected as different conditions. After reconnecting, the page fetches a fresh full frame.

## Who controls playback

FPP remains the schedule and playhead authority for FPP-backed playback. ShowMesh reports observed position rather than inferring it from configured order.

ShowMesh-audio runs report each node's session and alignment evidence. One node's success is not group success.

## Direct Cue activation

Announcements use direct Cue activation and require `cue:activate`. Multi-node announcements use one shared start instant when clock evidence permits.

Use direct activation only for operator-triggered Cues. Check the result for missing assets, target failures, or unaligned starts.

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
