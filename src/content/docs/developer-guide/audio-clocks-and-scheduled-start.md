---
title: Audio clocks and scheduled start
description: Integrate node clocks, scheduled starts, multi-node alignment, and drift evidence.
pageType: reference
maturity: experimental-testing
complexity: advanced
---

ShowMesh schedules node-local audio against each node's media clock. API consumers must use the returned alignment evidence, not request success, to determine synchronization.

## Clock configuration

`node.clock` is revisioned by node ID. Providers are `managed`, `external`, and `fpp`; each configuration declares the network interface and PTP domain. Provider-specific fields describe the service or host supplying clock evidence.

Clock evidence can report synchronized, holdover, or unavailable. Treat absence and stale evidence separately from a positive synchronized result.

## Single-node scheduled start

An audio-session start can carry `scheduledAtNs`, an instant on that node's media clock. Prepare the session before that instant.

ShowMesh applies calibrated output latency as a static offset. Store its measurement provenance instead of inferring it from device type.

## Multi-node aligned start

`POST /api/v1/audio/sessions/{sessionId}/aligned-start` accepts several node IDs. The coordinator:

1. selects a clock holder from declared role and current evidence;
2. reads the shared clock once;
3. chooses one future instant;
4. prepares every target before that instant;
5. starts the prepared targets at the same instant;
6. returns per-node scheduling and alignment evidence.

If the shared clock cannot be established, the operation can report visible unaligned fallback. Never translate that result into “synchronized.”

Cue audio, announcements, Night beds, item changes, and resumes use this scheduling model. LTC remains single-target.

## Alignment runs

Alignment-run endpoints manage long-running program-to-LTC measurements for one node. A retained run covers only its recorded configuration and interval; it does not prove later PTP lock or receiver behavior.

## Handle scheduling failures

- Preparation failure names the affected node and prevents it from being silently counted as aligned.
- A scheduled instant already passed is an error, not permission to claim alignment after starting late.
- Missing assets, routes, or capabilities remain per-node failures.
- Clock unavailability can degrade to an explicitly unaligned result where the caller permits execution.
- A node that starts but reports it did not use the shared instant is reported unaligned.

Use the OpenAPI schemas as the wire authority; use [Audio nodes](../../using-showmesh/node-types/audio-nodes/) for the operator model.
