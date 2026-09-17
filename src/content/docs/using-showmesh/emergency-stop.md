---
title: Emergency stop
description: Stop FPP, silence audio nodes, black out Resolume, and recover afterward.
pageType: procedure
maturity: available
complexity: advanced
---

Every Emergency Stop level immediately dispatches to three target kinds in parallel:

- `stopPlaylist` to every configured FPP instance;
- `audio.node.silence` to every declared audio node;
- `resolume.blackout` to every configured Resolume instance.

Every target produces its own outcome. A failed audio silence or Resolume blackout fails the stop operation just as a failed FPP stop does. Every level requires `show:emergencystop:invoke` and is accepted in both Program Mode and Show Mode.

## Choose a level

| Level | Immediate stop | Active Show Night effect |
| --- | --- | --- |
| `stop` | Stops FPP, silences audio, and blackouts Resolume. | None. |
| `stop-power-down` | Performs the same immediate stop. | Starts the session's standard graceful shutdown immediately. |
| `hard-stop` | Performs the same immediate stop. | Abandons the session directly to `stopped`, with no wait. Requires arm and fire. |

Each level can also run its own optional follow-up actions, such as work lights. Follow-up failures are reported separately and never rewrite the stop result.

## Before you start

- Use a principal carrying `show:emergencystop:invoke`.
- Use an administrator credential when changing follow-up configuration.
- Know that all configured FPP, declared audio, and configured Resolume targets are affected.
- Do not assume one successful target means the entire stop succeeded.

## Run a stop

```sh
showmeshctl emergency-stop stop
showmeshctl emergency-stop stop-power-down
```

The Operator UI exposes the same levels in Live Control. Read the returned target-kind and target-ID rows rather than relying on a single aggregate message.

## Arm and fire a hard stop

Hard stop deliberately has no one-command shortcut:

1. Run `showmeshctl emergency-stop hard-stop arm`.
2. Copy the single-use token from the response.
3. Before it expires, run `showmeshctl emergency-stop hard-stop fire --arm-token <token>`.

Arming does not affect the show. Firing atomically consumes the token before dispatch, so a retry or redelivered request cannot fire the same arm twice. If the token expires, arm again; if a concurrent fire reports a conflict, inspect whether the stop already happened before retrying.

## Configure follow-up actions

```sh
showmeshctl emergency-stop config get
showmeshctl emergency-stop config set --file ./emergency-stop-followups.json
showmeshctl emergency-stop config revisions
```

Configuration requires `config:write`. Each level owns a separate action list. A follow-up action's failure remains visible but does not turn a confirmed immediate stop into a failed stop.

## Interpret the result

The command prints grouped outcomes for FPP, audio-node, and Resolume targets plus any Show Night transition and follow-up actions.

| Exit code | Meaning |
| --- | --- |
| `0` | Every immediate stop target was confirmed, and no Show Night transition or follow-up-configuration read failed. |
| `9` | At least one command was accepted but not confirmed. |
| `12` | An immediate stop target failed, the requested Show Night transition failed, or follow-up configuration could not be read. Individual best-effort follow-up action failures do not cause this exit code. |
| `13` | At least one immediate stop target refused the command. |

Check the affected systems and fresh coordinator evidence:

```sh
showmeshctl fpp <instance-id>
showmeshctl audio session show
showmeshctl resolume status
showmeshctl night status
```

An unconfirmed result does not prove the stop failed. The operation may have happened while confirmation was delayed. Inspect current state before repeating a command that could already have taken effect.

## What Emergency Stop does not do

- It does not change Show Mode or configuration.
- `stop` does not move the active Show Night lifecycle; `stop-power-down` and `hard-stop` do.
- It does not make failed or unreachable targets safe. Their outcome remains failed, refused, or unconfirmed and requires operator follow-up.
- It does not prove physical amplifiers, projectors, or fixtures reached a safe state beyond the evidence their integrations returned.

After the incident, resolve the failed target evidence and use the normal [Show Night](../show-night/) preparation and readiness process before resuming operation.
