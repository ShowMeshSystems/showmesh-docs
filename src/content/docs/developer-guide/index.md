---
title: Developer guide
description: Build clients and integrations against ShowMesh's public API without modifying ShowMesh itself.
pageType: landing
maturity: experimental-active
---

This section is for software that uses ShowMesh: operator tools, automation clients, integration adapters. If you are changing ShowMesh source, use [Contributing](/contributing/).

## Public interfaces

- A versioned HTTP API under `/api/v1`.
- A Server-Sent Events stream for live changes.
- Bearer tokens issued to coordinator principals.
- Configuration, control, audit, discovery, identity, FPP, Resolume, Show, current-run, media-playlist, native audio/clock, Cue activation, asset, weather delay, fallback, and component-version resources.
- RFC 9457-style structured errors.

Start with the [API guide](./api/), then read [Events and live state](./events/) before building a stateful client. [Current runs](./current-runs/) defines the playback projection, [Audio clocks and scheduled start](./audio-clocks-and-scheduled-start/) covers multi-node timing, and [Actions and capabilities](./actions-and-capabilities/) separates two vocabularies that are often confused.

## Use the public API

The current public extension surface is the HTTP API. There is no released plugin SDK, provider SDK, or stable in-process extension ABI. Building directly against SQLite, coordinator internals, MQTT topics, or UI implementation details creates coupling outside the public API.

## Companion reports

Core 0.4.0 adds authenticated report uploads and observation reads at `/api/v1/companion-reports`. Core 0.3.1 does not expose these routes, and Core 0.4.0 release artifacts are not yet published. [Set up ShowMesh Companion](../../integrations/showmesh-companion/) covers credentials, platform limits, retention, and retrieval. The [API reference](../../reference/api/) links the applicable schemas.
