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
| Show configuration | Revisioned Show, Surface, Cue, Playlist, Action, Macro, active-Show, Show Mode, Show Night session, and active-Show-Night resources. |
| Show operation | `/emergency-stop/stop`, `/emergency-stop/stop-power-down`, the hard-stop arm/fire pair, `/night/session`, `/night/sessions/{id}`, and the `/night/commands/{command}` lifecycle routes. |
| Integration configuration | Revisioned FPP endpoints/MQTT, Resolume instances/composition/recovery, asset settings, render settings, audio settings/nodes, FPP Connect settings, and the show-emergency-stop follow-up configuration. |
| Resolume | Action vocabulary, actions, recovery, and instance state. |
| Fallback programs | `/fallback-programs`, per-FPP-instance fallback programs, and their acknowledgement route. |
| Identity and audit | Session, bootstrap, audit records, principals, roles, enable/disable, passwords, and API tokens. |
| Runs and bindings | Action binding checks (`/actions/{id}/binding`, `/actions/bindings`), action invocation (`/actions/{id}/invocations`), and macro-run submission, listing, and detail. |

The OpenAPI document is the exact inventory of methods, request bodies, responses, and required scopes. This table was checked against every route group in the current OpenAPI file.

## Roles and scopes

Every principal holds exactly one role, a fixed bundle of scopes. A route's required scope, not the role name, is what an authorization check tests.

| Role | Scopes |
| --- | --- |
| `viewer` | `node:read`, `fpp:read`, `observation:read`, `event:read`. |
| `operator` | Everything `viewer` holds, plus `show:macro:run`, `device:power`, `fpp:command`, `resolume:action`, `render:command`, `show:action:invoke`, `audio:command`, `night:command`, and `show:emergencystop:invoke`. |
| `admin` | Everything `operator` holds, plus `config:write`, `principal:write`, `audit:read`, `asset:write`, `principal:read`, `fpp:observe`, `night:override`, `node:observe`, `cuecatalog:deploy`, and `fpp:fallback`. |
| `scheduler` | `show:macro:run`, `night:command`, `fpp:observe`, `fpp:fallback`. A machine role for the installed FPP plugin principal, not selectable for interactive use beyond that purpose. |

`principal create --role` accepts `viewer`, `operator`, `admin`, or `scheduler`. A fifth role, `recovery`, is minted only for the built-in automatic Resolume-recovery principal and holds only `resolume:action`.

## API rules

- Clients must ignore unknown JSON fields and unknown SSE event names.
- Writes require authentication and a scope; reads are deployment-configurable.
- State changes are never performed by `GET`.
- Errors are structured problem documents.
- Successful dispatch does not imply confirmed device effect.
- The SSE stream is snapshot-based and non-resumable.
