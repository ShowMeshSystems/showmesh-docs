---
title: Developer Guide
description: Build clients and integrations against ShowMesh's public contract without modifying ShowMesh itself.
---

**Status: Experimental — Active Development**

This section is for software that uses ShowMesh: operator tools, automation clients, integration adapters, and future extensions. If you are changing ShowMesh source, use [Contributing](/contributing/).

## Available today

- A versioned HTTP API under `/api/v1`.
- A Server-Sent Events stream for live changes.
- Bearer tokens issued to coordinator principals.
- Configuration, control, audit, discovery, identity, FPP, Resolume, show, macro, and asset resources.
- RFC 9457-style structured errors.

Start with the [API guide](./api/), then read [Events and live state](./events/) before building a stateful client. [Actions and capabilities](./actions-and-capabilities/) explains the two vocabularies that are easy to confuse.

## Extension boundary

The current public extension surface is the HTTP API. There is no released plugin SDK, provider SDK, or stable in-process extension ABI. Building directly against SQLite, coordinator internals, MQTT topics, or UI implementation details creates coupling outside the public contract.

## Planned here later

Provider authoring, node extension kits, generated client libraries, and a supported SDK belong here once their contracts exist. See [SDK roadmap](./sdk/).
