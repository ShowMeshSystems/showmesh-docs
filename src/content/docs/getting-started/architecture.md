---
title: Architecture overview
description: How the current coordinator, UI, broker, native nodes, FPP, and Resolume pieces relate.
pageType: concept
maturity: experimental-active
---

ShowMesh keeps the management plane separate from show playback. The coordinator can fail or become unreachable without being placed in the media path of an already-running device.

```mermaid
flowchart LR
    Operator["Operator browser"] -->|same-origin HTTP| UI["Operator UI / nginx"]
    CLI["showmeshctl or API client"] -->|HTTP API| Coordinator["ShowMesh coordinator"]
    UI -->|/api proxy| Coordinator
    Coordinator <-->|commands, hello, health, assets| Broker["MQTT broker"]
    Broker <-->|per-node topics| Agent["Native ShowMesh agent"]
    Coordinator -->|REST polling and commands| FPP["FPP players"]
    FPP -->|optional status MQTT| Broker
    Coordinator <-->|REST and WebSocket| Resolume["Resolume Arena"]
    Coordinator --> Store["SQLite configuration and asset metadata"]
```

## Observation freshness and provenance

The API reports provenance and freshness with observations. A value can be current, stale, unavailable because collection failed, unsupported, or of unknown age. `unknown_age` commonly means the coordinator restored retained MQTT evidence whose original observation time is not known; it is never treated as fresh.

## Control flow

FPP and Resolume writes are evidence-confirmed: ShowMesh sends a bounded primitive and waits for the observed state to match. A timeout means ShowMesh could not confirm the requested result. It does not safely prove that the device ignored the command, so check the device before retrying.

Macros are asynchronous runs composed from logical actions. Submitting a run returns before all steps finish unless the client follows the run. Runs normally continue after a failed step. A step configured with `onFailure: abort` skips the remainder after failure; `onUnconfirmed: abort` does the same after an unconfirmed result. The completed run records every attempted or skipped outcome.

## Media-node runtime path

Surface objects describe geometry, channel ranges, node assignment, and an `ndi` or `hdmi` transport. Current `main` includes an experimental render-node runtime that consumes an applied NDI surface and node-local FSEQ asset. HDMI has no runtime output path. See the [render-node](../../using-showmesh/node-types/render-nodes/) page for the operating boundary.

The separate [audio-node](../../using-showmesh/node-types/audio-nodes/) role provides experimental playback and LTC paths. Both roles build on the same native agent and advertise composable capabilities rather than belonging to a hardcoded node class. An installation can declare more than one `audio.node`, each with a role (`program`, `program+ltc`, or `zone`). Cue audio, announcements, and Night beds can target several nodes; the coordinator prepares them and chooses one shared media-clock instant. LTC remains a one-node output. Every target reports aligned or unaligned evidence rather than letting request acceptance stand in for synchronization.

`node.clock` declares the managed, external, or FPP-provided PTP relationship for a node. Static output-latency calibration can compensate for a measured output-chain delay. These declarations and source-level scheduling paths do not by themselves prove physical receiver lock or live-show alignment.

## Show operation and safety

An installation-wide operating mode (`program` or `show`) and a show-scoped Emergency Stop surface are implemented at the coordinator's API, UI, and CLI. Emergency Stop is not gated by mode and concurrently stops FPP, silences declared audio nodes, and blackouts configured Resolume instances. Show Night session objects and lifecycle commands are also implemented.

Signed FPP fallback programs are built and served by the coordinator. The separate FPP plugin can fetch, verify, install, acknowledge, and locally resolve their entries. Coordinator-to-node activation delivery and execution remain incomplete, and no public real-host acceptance claim follows from those source paths.
