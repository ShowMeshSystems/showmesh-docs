---
title: Using ShowMesh
description: Operate the current ShowMesh workspace, from authoring through monitoring and emergency control.
pageType: landing
maturity: experimental-active
---

ShowMesh separates saved configuration from observed runtime evidence. A saved object describes intent; current runs, node reports, and command outcomes show what ShowMesh observed.

## Operator workspace

| Area | Purpose |
| --- | --- |
| **Dashboard** | Active Show, current runs, attention items, and high-level readiness. |
| **Live Control** | Current playback, direct Cue announcements, transport controls, and Emergency Stop. |
| **Show Night** | Preparation, readiness, lifecycle transitions, warnings, and recovery. |
| **Monitor** | Fleet, signals, activity, capabilities, manifests, and node inspectors. |
| **Shows** | Show-scoped authoring for playlists, Cues, assets, presentation, automation, and Night Sessions. |
| **Assets** | Global and Show-scoped content, versions, delivery evidence, and node maintenance. |
| **Settings** | Connections, delivery, recovery, appearance, audio defaults, node routing, operating mode, and Resolume. |
| **Access** | Human and machine principals, roles, passwords, tokens, and revocation. |

## Core objects

| Object | Question it answers |
| --- | --- |
| [Show](./shows/) | Which production owns these objects, and which FPP and Resolume instances participate? |
| [Surface](./surfaces/) | Which logical canvas, channels, rate, and transport belong to a render node? |
| [Asset](./assets/) | Which exact content revision should be present on which node? |
| [Action](./actions-and-macros/) | Which reusable FPP, Resolume, MQTT, or audio operation should run? |
| [Macro](./actions-and-macros/) | Which actions run in order, with what failure policy? |
| [Cue](./cues/) | What render, audio, LTC, or announcement output belongs to this show moment? |
| [Show Playlist](./playlists/) | Which Cues run through FPP or ShowMesh audio, and in what order? |
| [Media Playlist](./playlists/) | Which local audio assets form a reusable background-audio sequence? |
| [Night Session](./show-night/) | How is a site prepared, opened, run, rested, and shut down? |
| [Show Mode](./show-mode/) | Is the installation authoring live revisions or running a pinned Show generation? |
| [Audio node](./node-types/audio-nodes/) | Which routes, channels, clock, latency, role, and zone belong to an audio node? |
| **Node clock** | Which PTP provider and interface supply the node's media clock? |

These are separate revisioned objects linked to a Show by ID.

## Check current status

[Live Control and current runs](./live-control-and-current-runs/) shows current playback. Several FPP and ShowMesh-audio runs can be active at once; `next` is present only when the runner supplied it.

[Nodes](./nodes/) and Monitor show live capabilities, freshness, assets, clocks, and alignment. Keep unknown, stale, failed, unavailable, unobserved, and disconnected states distinct.

## Safety and access

[Emergency Stop](./emergency-stop/) stops FPP, silences audio nodes, and blackouts Resolume. Higher levels also move the Show Night lifecycle.

[Access and permissions](./access-and-permissions/) explains roles, scopes, credentials, and revocation.

For an end-to-end workflow, use [Author a Show](/guides/author-a-show/) and [Run a Show Night](/guides/run-a-show-night/).
