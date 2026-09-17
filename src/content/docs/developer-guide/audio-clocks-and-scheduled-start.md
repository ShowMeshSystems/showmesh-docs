---
title: Audio clocks and scheduled start
description: Integrate node clocks, scheduled starts, multi-node alignment, and drift evidence.
pageType: reference
maturity: experimental-testing
complexity: advanced
---

ShowMesh coordinates node-local audio against each node's media clock. The contract separates configuration, preparation, the shared start instant, and observed alignment so an API consumer never has to infer synchronization from request success alone.

## Clock configuration

`node.clock` is revisioned configuration keyed by node ID. Providers are `managed`, `external`, and `fpp`; each configuration also declares the network interface and PTP domain. Provider-specific fields describe managed-client behavior, an external management socket and PHC, or the FPP host supplying clock evidence.

Clock evidence can report synchronized, holdover, or unavailable. Treat absence and stale evidence separately from a positive synchronized result.

## Single-node scheduled start

The audio-session start request can carry `scheduledAtNs`, an instant on that node's media clock. Preparing the session before that instant avoids turning command-delivery latency into output skew.

Calibrated output latency is applied as a static offset. Its provenance is part of configuration and must not be inferred from device type.

## Multi-node aligned start

`POST /api/v1/audio/sessions/{sessionId}/aligned-start` accepts several node IDs. The coordinator:

1. selects a clock holder from declared role and current evidence;
2. reads the shared clock once;
3. chooses one future instant;
4. prepares every target before that instant;
5. starts the prepared targets at the same instant;
6. returns per-node scheduling and alignment evidence.

If the shared clock cannot be established, the operation can report visible unaligned fallback. Never translate that result into “synchronized.”

Cue audio, announcements, Night beds, item changes, and resumes build on this scheduling vocabulary. LTC remains a single-target output even when program audio uses several targets.

## Alignment runs

The alignment-run endpoints start, list, read, and stop long-running program-to-LTC measurements for one node. Results include the measured series and summary used by diagnostics and pre-show warnings.

An alignment run is retained evidence for one configuration and interval. It does not prove later PTP lock, receiver behavior, output latency, or live-show conditions.

## Failure contract

- Preparation failure names the affected node and prevents it from being silently counted as aligned.
- A scheduled instant already passed is an error, not permission to claim alignment after starting late.
- Missing assets, routes, or capabilities remain per-node failures.
- Clock unavailability can degrade to an explicitly unaligned result where the caller permits execution.
- A node that starts but reports it did not use the shared instant is reported unaligned.

Use the OpenAPI schemas as the wire authority; use [Audio nodes](../../using-showmesh/node-types/audio-nodes/) for the operator model.
