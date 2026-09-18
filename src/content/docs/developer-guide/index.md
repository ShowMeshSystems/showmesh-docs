---
title: Developer guide
description: Build clients and integrations against ShowMesh's public API without modifying ShowMesh itself.
pageType: landing
maturity: experimental-active
---

This section is for software that uses ShowMesh: operator tools, automation clients, and integration adapters. If you are changing ShowMesh source, use [Contributing](/contributing/).

## Public interfaces

- A versioned HTTP API under `/api/v1`.
- A Server-Sent Events stream for live changes.
- Bearer tokens issued to coordinator principals.
- Configuration, control, audit, discovery, identity, FPP, Resolume, Show, current-run, media-playlist, native audio/clock, Cue activation, and asset resources.
- RFC 9457-style structured errors.

Start with the [API guide](./api/), then read [Events and live state](./events/) before building a stateful client. [Current runs](./current-runs/) defines the playback projection, [Audio clocks and scheduled start](./audio-clocks-and-scheduled-start/) covers multi-node timing, and [Actions and capabilities](./actions-and-capabilities/) separates two vocabularies that are often confused.

## Use the public API

The current public extension surface is the HTTP API. There is no released plugin SDK, provider SDK, or stable in-process extension ABI. Building directly against SQLite, coordinator internals, MQTT topics, or UI implementation details creates coupling outside the public API.

ShowMesh does not publish an SDK or in-process plugin interface. Build clients against the [HTTP API](./api/) and [event stream](./events/), and keep them tolerant of additive response fields.
