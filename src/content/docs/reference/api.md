---
title: API surface
description: Current route groups and rules for the public version 1 contract.
status: available
---

The normative machine-readable API is `api/openapi.yaml` in the main ShowMesh repository. It is verified against the implementation in both directions. This page is an orientation map, not a replacement schema.

Base path: `/api/v1`

## State and evidence

`/snapshot`, `/nodes`, `/observations`, `/events`, `/stream`, `/fpp`, and `/resolume/instances` expose current and historical evidence. A filter matching no observations returns an empty collection, not `404`.

## Configuration and operation

`/config/*` routes expose revisioned configuration for FPP endpoints/MQTT, Resolume instances/composition/recovery, assets, shows, surfaces, actions, macros, and the active show. Macro run, FPP command, Resolume action, asset, discovery, and declaration routes perform operations.

## Identity and accountability

`/session`, `/bootstrap`, `/audit`, `/principals`, and nested token routes provide authentication context and administration. Network bootstrap is deliberately constrained; host-level coordinator subcommands remain the break-glass path.

## Contract rules

- Clients must ignore unknown JSON fields and unknown SSE event names.
- Writes require authentication and a scope; reads are deployment-configurable.
- State changes are never performed by `GET`.
- Errors are structured problem documents.
- Successful dispatch does not imply confirmed device effect.
- The SSE stream is snapshot-based and non-resumable.
