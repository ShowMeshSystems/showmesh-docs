---
title: Access and permissions
description: Manage principals, roles, passwords, tokens, revocation, and authorization boundaries.
pageType: concept
maturity: available
complexity: advanced
---

ShowMesh uses coordinator-local **principals**. A principal is either `human` or `machine`, has one role, and may hold passwords or API tokens. Kind is for display and audit readability; authorization is determined by scopes.

## Roles

| Role | Intended authority |
| --- | --- |
| `viewer` | Node, FPP, observation, and event reads. |
| `operator` | Viewer access plus show, FPP, Resolume, render, audio, Night, Cue, and Emergency Stop actions. |
| `admin` | Operator access plus configuration, assets, identity, audit, interlock override, observation, catalog deployment, and fallback administration. |
| `scheduler` | Narrow machine authority for macro/Night scheduling plus FPP observation and fallback exchange. |
| `recovery` | Narrow built-in authority for Resolume recovery actions. |

Routes authorize scopes, not role names. A UI control can therefore be hidden or disabled because current scope evidence is loading, stale, unavailable, or insufficient even when the role label looks familiar.

## Principals and credentials

The **Access** page lets an administrator:

- create human or machine principals;
- change roles;
- enable or disable a principal;
- set or replace a password;
- issue, inspect, and revoke tokens.

Tokens are credentials, not identity records. Revoking one token does not delete the principal or automatically revoke its other credentials.

Use a separate machine principal for unattended integrations. Give it the narrow role appropriate to the caller rather than reusing a human administrator credential.

## Last-administrator protection

The coordinator refuses operations that would remove the last reachable administrator: disabling that principal, changing its role away from one containing `principal:write`, or revoking its last credential. Host-local coordinator commands remain the break-glass path if no administrator can authenticate.

## Unsaved and destructive changes

Access editors can contain several independent drafts. Saving or reloading one principal must not erase another principal's unsaved work. Navigation prompts require an explicit discard decision.

Disabling a principal, revoking a token, or deleting credential access is destructive. Confirm the exact principal and token before applying it and inspect the resulting audit entry.

## CLI administration

```sh
showmeshctl session
showmeshctl principal --help
showmeshctl token --help
showmeshctl audit
```

Principal reads require `principal:read`; identity writes require `principal:write`; audit history requires `audit:read`. These are administrator-only authorities.
