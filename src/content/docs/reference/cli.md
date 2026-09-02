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
- `--token <token>`: bearer token. Prefer `SHOWMESH_CTL_TOKEN` so the value is not exposed in a process listing. The coordinator rejects any request whose query string carries the token prefix, returning a `400 credential-in-url` problem; never place a token in a URL or query string.
- `--output text|json`: human table/text, or JSON.
- `--timeout <duration>`: request budget, default `10s`. Every `fpp <verb>` write subcommand raises a too-small value to its own larger minimum (currently `35s`), because the coordinator holds a dispatched command's response open for its own confirmation deadline. Every `macro`, `run`, and `action` subcommand raises a too-small value to its own smaller minimum (currently `5s`) for the same reason, scaled to a macro run's own, shorter accepted-then-asynchronous shape. A too-small value on either kind of command prints a note to stderr naming both values rather than silently waiting longer than requested.

`--output json` behaves differently by command. For `nodes`, `node`, `snapshot`, `night status`, and `resolume recovery status`, it prints the coordinator's own response bytes unmodified, so a field the API grows reaches a script immediately. Every other command's JSON output re-serializes this CLI's own decoded structs: the decoder tolerates unknown fields from a newer coordinator (so a newer server does not break this CLI), but a field this build does not know about is silently absent from that JSON, even though it would still render in a text table. Do not assume passthrough for a command not named above.

## Command groups

- Inventory and state: `nodes`, `node`, `snapshot`, `events`, `watch`.
- FPP: `fpp`, eight `fpp` control verbs, `fpp-mqtt`, stored playlist definitions, playlist-entry reconciliation, and playlist readiness.
- Configuration and discovery: `config`, `discover`, `declare`, `undeclare`.
- Shows: `show`, `surface`, `cue`, `playlist`, `action`, `macro`, `run`, and `night`.
- Actions: `action list|show|put`, `action check` (re-resolves stored action bindings without dispatching anything), and `action invoke` (invokes one stored action outside a macro run, requires `show:action:invoke`).
- Show operation: `show mode` (the installation-wide `program`/`show` operating mode) and the `night` lifecycle commands (`prepare-site`, `readiness`, `preshow`, `start`, `final-show`, `fade-out`, `power-down`, `end-session`).
- Emergency stop: `emergency-stop stop`, `emergency-stop stop-power-down`, `emergency-stop hard-stop arm`/`fire`, and `emergency-stop config get|set|revisions`. Every trigger subcommand requires `show:emergencystop:invoke`.
- Native media: `render`, `audio`, `cuecatalog`, and `fppconnect` settings/status.
- Resolume: `resolume composition`, `resolume action`, `resolume status`, and recovery commands.
- Assets: `assets list|get|upload|fetch|manifest` and settings.
- Identity: `session`, `audit`, `principal`, and `token`.
- Runs: `run show <runId>` and `run list [--macro <id>] [--show <id>] [--state]`.
- Compatibility: `version`.

Use command-specific help for required scopes, flags, replacement semantics, and idempotency options. The compiled help is the exact inventory for that binary.

## Important exit codes

The CLI uses stable, distinct nonzero codes so scripts do not have to parse prose. Common ones are:

| Code | Meaning |
|---:|---|
| 1 | Usage error. |
| 2 | Coordinator unreachable. |
| 3 | Unauthorized (no valid credential). |
| 4 | API version incompatible. |
| 5 | Resource not found. |
| 6 | The coordinator returned some other error, or `macro run`/`run show` read back a finished run that did not report whether it completed or confirmed at all. |
| 7 | Authenticated but forbidden (missing a required scope). |
| 8 | Rate limited. |
| 9 | Command/run completed its request path but lacked confirming evidence. |
| 10 | Conflict with current state or idempotency rules. |
| 11–13 | Resolume action unconfirmable, failed, or refused. |
| 14 | Follow loop went idle; the run may still be active. |
| 15 | Macro run aborted (a step failed or its target was removed mid-run). |
| 20 | Asset manifest not ready (`assets manifest --require-ready`; a named asset is confirmed missing). |
| 21 | Asset manifest unknown (`assets manifest --require-ready`; no report has ever arrived, or it is stale). |
| 22 | Render unavailable (`render status`; this node has never published a render report). |
| 23 | Render pipeline down (`render apply`/`clear`/`restart`; direct evidence the pipeline reached its failed state). |
| 26 | Night session not ready (a `night` lifecycle command; no open preparation epoch, or no fresh readiness result from the current epoch). |
| 27 | Night command rejected by the session's current lifecycle state. |
| 28 | Night session degraded after an ambiguous restart; run `night end-session` then `night prepare-site` before any further command. |
| 29 | `action check` found a broken binding on at least one checked action; `action check` never exits 29 for an "unknown" binding. |

Run `showmeshctl help` for the complete table and precise distinctions before depending on exit codes in automation.
