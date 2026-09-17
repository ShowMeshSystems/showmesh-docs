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
| `operator` | Viewer access plus show, FPP, Resolume, render, audio, Night, Cue, and Emergency Stop actions. |
| `admin` | Operator access plus configuration, assets, identity, audit, interlock override, observation, catalog deployment, and fallback administration. |
| `scheduler` | Narrow machine authority for macro/Night scheduling plus FPP observation and fallback exchange. |
| `recovery` | Narrow built-in authority for Resolume recovery actions. |

Routes authorize scopes, not role names. A control can remain unavailable while scope evidence is loading or when the principal lacks the required scope.

## Principals and credentials

The **Access** page lets an administrator:

- create human or machine principals;
- change roles;
- enable or disable a principal;
- set or replace a password;
- issue, inspect, and revoke tokens.

Revoking one token does not delete the principal or revoke its other credentials. Give unattended integrations a separate machine principal with the narrowest suitable role.

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
