---
title: API reference
description: Current route groups and rules for the public version 1 API.
pageType: reference
maturity: available
complexity: advanced
---

The machine-readable API is `api/openapi.yaml` in the main ShowMesh repository. This page is an orientation map, not a replacement schema.

Base path: `/api/v1`

## Route groups

Every public route belongs to one of these groups:

| Group | Routes and purpose |
| --- | --- |
| Service and live state | `/`, `/snapshot`, `/nodes`, node declarations, discovery, `/observations`, `/events`, and `/stream`. |
| FPP | `/fpp`, FPP commands, instance-UUID acknowledgement, imported playlist entries/definitions, reconciliation, and Playlist readiness. |
| Native media | Node render operations, audio session/gain/output operations, assets, cue catalogs, and FPP Connect settings/status. |
| Show configuration | Revisioned Show, Surface, Cue, Playlist, Action, Macro, active-Show, Show Night, and Show Mode resources. |
| Integration configuration | Revisioned FPP endpoints/MQTT, Resolume instances/composition/recovery, asset settings, render settings, audio settings/nodes, and FPP Connect settings. |
| Resolume | Action vocabulary, actions, recovery, and instance state. |
| Identity and audit | Session, bootstrap, audit records, principals, roles, enable/disable, passwords, and API tokens. |
| Runs and bindings | Action binding checks/invocations and macro-run submission, listing, and detail. |

The OpenAPI document is the exact inventory of methods, request bodies, responses, and required scopes. This table was checked against every route group in the current OpenAPI file.

## API rules

- Clients must ignore unknown JSON fields and unknown SSE event names.
- Writes require authentication and a scope; reads are deployment-configurable.
- State changes are never performed by `GET`.
- Errors are structured problem documents.
- Successful dispatch does not imply confirmed device effect.
- The SSE stream is snapshot-based and non-resumable.
