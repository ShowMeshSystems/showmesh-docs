---
title: API
description: Use the versioned REST API, principal tokens, and structured errors safely.
pageType: reference
maturity: available
complexity: advanced
---

The coordinator serves its public API at `/api/v1`. The machine-readable API description is `api/openapi.yaml` in the main ShowMesh repository.

## Connect

```sh
curl -sS http://showmesh.local:8080/api/v1/
```

Every `/api/v1` response includes `ShowMesh-API-Version: 1`. Clients should tolerate additive JSON fields they do not recognize.

## Authenticate writes

An administrator issues a token to a principal. Send it only in the authorization header:

```sh
curl -sS \
  -H "Authorization: Bearer $SHOWMESH_TOKEN" \
  http://showmesh.local:8080/api/v1/session
```

Do not place credentials in URLs or query strings. The coordinator rejects a query string carrying the token prefix with a `400 credential-in-url` problem. Reads are open by default but can be closed by deployment configuration; writes always require a principal and the relevant scope.

`POST /api/v1/session` and `POST /api/v1/bootstrap` additionally require a `Sec-Fetch-Site: same-origin` request header, or an `Origin` header naming the host the request was addressed as, and refuse the request without one; this closes cross-site forgery against the two endpoints that create or mint a credential. A browser sends this automatically, so the Operator UI needs nothing; a script does not, so a direct call must add it:

```sh
curl -sS -X POST http://showmesh.local:8080/api/v1/session \
  -H 'Content-Type: application/json' \
  -H 'Sec-Fetch-Site: same-origin' \
  -d '{"name":"<principal name>","password":"<password>"}'
```

Every cookie-authenticated write is checked this way, but a bearer-token request to a route other than `/session` or `/bootstrap` is exempt. `/session` and `/bootstrap` themselves have no bearer-token exemption, because they are how a credential comes to exist in the first place.

## Resource groups

The current API covers:

- Snapshot, nodes, discovery, observations, event history, and live stream.
- FPP instances and commands.
- Sessions, audit records, principals, and API tokens.
- Revisioned FPP, FPP MQTT, Resolume, asset, show, surface, cue, playlist, action, macro, show mode, emergency-stop, and active-show configuration.
- Macro runs, action invocations and binding checks, and Resolume actions/recovery.
- Show Night session configuration and lifecycle commands, and emergency-stop trigger routes.
- Cue catalogs, FPP Connect settings/status, and signed FPP fallback programs.
- Asset metadata, bytes, manifests, and node inventories.

Use the OpenAPI document for exact schemas and status codes. Do not infer a write operation from a read route; no state change is reachable by `GET`.

## Handle errors

Errors are `application/problem+json`. Branch on HTTP status and stable problem type, then show `detail` to the operator. Keep these cases distinct:

- `401`: no valid credential authenticated.
- `403`: authenticated, but missing a scope.
- `409`: valid request conflicts with current state or a revision/idempotency rule.
- `429`: authentication work was rate-limited; respect the retry guidance.

## Configuration writes

Configuration objects are revisioned and writes are full replacements where the route says so. Read the current object and revision before writing. Some environment-supplied configuration temporarily blocks API writes with `409`; migrate or remove the environment override rather than retrying blindly.
