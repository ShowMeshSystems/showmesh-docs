---
title: Command-line interface
description: Current showmeshctl command groups, global flags, and operational exit behavior.
pageType: reference
maturity: available
---

`showmeshctl` is the independent non-UI client for the coordinator's public API.

```sh
showmeshctl nodes --server http://showmesh.local:8080
showmeshctl help
showmeshctl <command> --help
```

## Common command flags

Flags follow the command name. `showmeshctl` treats its first argument as the command, so `showmeshctl --server … nodes` is invalid.

- `--server <url>`: coordinator base URL; default `http://localhost:8080` or `SHOWMESH_SERVER`.
- `--token <token>`: bearer token. Prefer `SHOWMESH_CTL_TOKEN` so the value is not exposed in a process listing.
- `--output text|json`: human table/text or CLI-decoded JSON.
- `--timeout <duration>`: request budget, default `10s`. Commands with longer confirmation behavior may raise a too-small value and report that adjustment.

JSON output is produced from the CLI's decoded types. Unknown fields from a newer coordinator are tolerated but are not preserved in output.

## Command groups

- Inventory and state: `nodes`, `node`, `snapshot`, `events`, `watch`.
- FPP: `fpp`, eight `fpp` control verbs, and `fpp-mqtt` configuration.
- Configuration and discovery: `config`, `discover`, `declare`, `undeclare`.
- Shows: `show`, `surface`, `action`, `macro`, `run`.
- Resolume: `resolume composition`, `resolume action`, `resolume status`, and recovery commands.
- Assets: `assets list|get|upload|fetch|manifest` and settings.
- Identity: `session`, `audit`, `principal`, and `token`.
- Compatibility: `version`.

Use command-specific help for required scopes, flags, replacement semantics, and idempotency options. The compiled help is the exact inventory for that binary.

## Important exit codes

The CLI uses stable, distinct nonzero codes so scripts do not have to parse prose. Common ones are:

| Code | Meaning |
|---:|---|
| 1 | Usage error. |
| 2 | Coordinator unreachable. |
| 3 | Unauthorized. |
| 4 | API version incompatible. |
| 5 | Resource not found. |
| 7 | Authenticated but forbidden. |
| 8 | Rate limited. |
| 9 | Command/run completed its request path but lacked confirming evidence. |
| 10 | Conflict with current state or idempotency rules. |
| 11–13 | Resolume action unconfirmable, failed, or refused. |
| 14 | Follow loop went idle; the run may still be active. |
| 15 | Macro run aborted. |
| 20 | Asset manifest not ready. |
| 21 | Asset manifest unknown, with no known not-ready node. |

Run `showmeshctl help` for the complete table and precise distinctions before depending on exit codes in automation.
