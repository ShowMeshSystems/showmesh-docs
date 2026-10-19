---
title: API reference
description: Current route groups and rules for the public version 1 API.
pageType: reference
maturity: available
complexity: advanced
---

The machine-readable API is the [v0.3.1 OpenAPI document](https://github.com/ShowMeshSystems/showmesh/blob/v0.3.1/api/openapi.yaml). This page maps the route groups; use the schema for exact requests and responses.

:::note[Companion report support]
Companion reports and the `companion` role require Core 0.4.0 or newer. Core 0.4.0 is not yet published; use the [development OpenAPI document](https://github.com/ShowMeshSystems/showmesh/blob/fb955c9de477f2aebaad89186fbcf60c64515cee/api/openapi.yaml) when evaluating that source build. The installation guides use released Core 0.3.1.
:::

Base path: `/api/v1`

## Route groups

Every public route belongs to one of these groups:

| Group | Routes and purpose |
| --- | --- |
| Service and live state | `/`, `/snapshot`, `/current-runs`, `/nodes`, node declarations, discovery, `/observations`, `/events`, `/stream`, and `/system/versions`. |
| FPP | `/fpp`, FPP commands, instance-UUID acknowledgement, imported playlist entries/definitions, reconciliation, Playlist readiness, plugin pairing, brightness ceilings, and excluded channel ranges. |
| Native media | Node render operations; audio sessions, aligned start, silence, gain/output and alignment runs; node clocks; assets and node maintenance; Cue catalogs; and FPP Connect settings/status. |
| Show configuration | Revisioned Show and participation, Surface, Cue, Show Playlist, media Playlist, Action, Macro, active-Show, Show Mode, Show Night session, and active-Show-Night resources. |
| Show operation | Direct Cue activation, `/emergency-stop/stop`, `/emergency-stop/stop-power-down`, the hard-stop arm/fire pair, `/night/session`, `/night/sessions/{id}`, and the `/night/commands/{command}` lifecycle routes, plus `/weather-delay` state, commands, triggers, and presigned starts. |
| Integration configuration | Revisioned FPP endpoints/MQTT, Resolume instances/composition/recovery, asset settings, render settings, audio settings/nodes, FPP Connect settings, the show-emergency-stop follow-up configuration, `show.weatherdelay`, and `release.settings`. |
| Resolume | Action vocabulary, actions, recovery, and instance state. |
| Fallback programs | `/fallback-programs`, per-FPP-instance fallback programs, and their acknowledgement route. |
| Enrollment | `/node-enrollments`, cancellation, and unauthenticated one-time-code redemption. Minting, listing, and cancellation require `node:enroll`. |
| Companion reports (Core 0.4.0+) | `/companion-reports` upload/list and `/companion-reports/{reportId}` detail. Uploads require `companion:report`; reads use the deployment read policy and `observation:read`. |
| Identity and audit | Session, bootstrap, audit records, principals, roles, enable/disable, passwords, and API tokens. |
| Runs and bindings | Action binding checks (`/actions/{id}/binding`, `/actions/bindings`), action invocation (`/actions/{id}/invocations`), and macro-run submission, listing, and detail. |

The OpenAPI document is the exact inventory of methods, request bodies, responses, and required scopes. Read the schema for your installed coordinator version before using an endpoint.

## Roles and scopes

Every principal holds exactly one role, a fixed bundle of scopes. A route's required scope, not the role name, is what an authorization check tests.

| Role | Scopes |
| --- | --- |
| `viewer` | `node:read`, `fpp:read`, `observation:read`, `event:read`. |
| `operator` | Everything `viewer` holds, plus `show:macro:run`, `device:power`, `fpp:command`, `resolume:action`, `render:command`, `show:action:invoke`, `audio:command`, `night:command`, `show:emergencystop:invoke`, `cue:activate`, `show:weatherdelay:invoke`, and `show:weatherdelay:resume`. |
| `admin` | Everything `operator` holds, plus `config:write`, `principal:write`, `audit:read`, `asset:write`, `principal:read`, `fpp:observe`, `night:override`, `node:observe`, `cuecatalog:deploy`, `fpp:fallback`, `node:enroll`, and, from Core 0.4.0, `companion:report`. |
| `companion` (Core 0.4.0+) | `companion:report` only; upload evidence without read or control authority. |
| `node` | `node:read` and `asset:write`; machine authority for enrolled native nodes. |
| `scheduler` | `show:macro:run`, `night:command`, `fpp:observe`, `fpp:fallback`. A machine role for the installed FPP plugin principal, not selectable for interactive use beyond that purpose. |

Use `viewer`, `operator`, `admin`, `scheduler`, or `node` when creating principals; Core 0.4.0 also accepts `companion`. The built-in automatic Resolume-recovery principal holds the `recovery` role and only `resolume:action`. Use dedicated machine identities for nodes, the plugin, and the Companion.

## API rules

- Clients must ignore unknown JSON fields and unknown SSE event names.
- Writes require authentication and a scope; reads are deployment-configurable.
- State changes are never performed by `GET`.
- Errors are structured problem documents.
- Successful dispatch does not imply confirmed device effect.
- The SSE stream is snapshot-based and non-resumable.
