---
title: Access and permissions
description: Manage principals, roles, passwords, tokens, revocation, and authorization boundaries.
pageType: concept
maturity: available
complexity: advanced
---

ShowMesh uses coordinator-local **principals**. Each principal is `human` or `machine`, has one role, and can hold passwords or API tokens. Scopes determine authorization.

## Roles

| Role | Intended authority |
| --- | --- |
| `viewer` | Node, FPP, observation, and event reads. |
| `operator` | Viewer access plus show, FPP, Resolume, render, audio, Night, Cue, weather delay, and Emergency Stop actions. |
| `admin` | Operator access plus configuration, assets, identity, audit, interlock override, observation, catalog deployment, and fallback administration. |
| `node` | Machine authority for asset reads and FPP Connect upload registration, issued during enrollment. |
| `scheduler` | Narrow machine authority for macro/Night scheduling plus FPP observation and fallback exchange. |
| `recovery` | Narrow built-in authority for Resolume recovery actions. |
| `companion` | Machine authority to upload Companion reports; requires Core 0.4.0. |

Routes authorize scopes, not role names. A control can remain unavailable while scope evidence is loading or when the principal lacks the required scope.

## Principals and credentials

The **System → Access** page lets an administrator:

- create human or machine principals;
- change roles;
- enable or disable a principal;
- set or replace a password;
- issue, inspect, and revoke tokens.

Revoking one token does not delete the principal or revoke its other credentials. Give unattended integrations a separate machine principal with the narrowest suitable role.

Weather delay invocation requires `show:weatherdelay:invoke`; resume requires `show:weatherdelay:resume`. Both belong to operator and admin. Configure alerts and triggers with administrator authority; see [Handle a weather delay](../../guides/handle-a-weather-delay/).

Companion uploads require `companion:report`. This role is available in Core 0.4.0 source; release artifacts are not yet published. Use a separate machine principal and token for each Companion. It cannot operate the show or administer identities. See [Set up ShowMesh Companion](../../integrations/showmesh-companion/) for setup and report-read permissions.

## Last-administrator protection

The coordinator refuses changes that would remove the last reachable administrator, including disabling it, removing `principal:write`, or revoking its last credential. Host-local coordinator commands are the break-glass path.

## Unsaved and destructive changes

Access can contain several unsaved principal drafts. Saving one must not discard another. The UI prompts before navigation discards a draft.

Confirm the exact principal or token before disabling or revoking it, then inspect the audit entry.

## CLI administration

```sh
showmeshctl session
showmeshctl principal --help
showmeshctl token --help
showmeshctl audit
```

Principal reads require `principal:read`; identity writes require `principal:write`; audit history requires `audit:read`. These are administrator-only authorities.
