---
title: Emergency stop
description: Stop FPP, silence audio nodes, black out Resolume, and recover afterward.
pageType: procedure
maturity: available
complexity: advanced
---

Every Emergency Stop level acts on these targets in parallel:

- `stopPlaylist` to every configured FPP instance;
- `audio.node.silence` to every declared audio node;
- `resolume.blackout` to every configured Resolume instance.

Each target reports its own outcome. Any failed immediate target fails the operation. Emergency Stop requires `show:emergencystop:invoke` and works in both Program Mode and Show Mode.

## Choose a level

| Level | Immediate stop | Active Show Night effect |
| --- | --- | --- |
| `stop` | Stops FPP, silences audio, and blackouts Resolume. | None. |
| `stop-power-down` | Performs the same immediate stop. | Starts the session's standard graceful shutdown immediately. |
| `hard-stop` | Performs the same immediate stop. | Abandons the session directly to `stopped`, with no wait. Requires arm and fire. |

Each level can run optional follow-up actions, such as work lights. Their failures are reported separately.

## Before you start

- Use a principal carrying `show:emergencystop:invoke`.
- Use an administrator credential when changing follow-up configuration.
- Expect all configured FPP, declared audio, and configured Resolume targets to be affected.
- Do not assume one successful target means the entire stop succeeded.

## Run a stop

```sh
showmeshctl emergency-stop stop
showmeshctl emergency-stop stop-power-down
```

Live Control exposes the same levels. Check every returned target row.

## Arm and fire a hard stop

Hard stop requires two commands:

1. Run `showmeshctl emergency-stop hard-stop arm`.
2. Copy the single-use token from the response.
3. Before it expires, run `showmeshctl emergency-stop hard-stop fire --arm-token <token>`.

Arming does not affect the show. Firing consumes the token before dispatch, so it cannot be reused. If it expires, arm again. After a conflict, check whether the stop already ran before retrying.

## Configure follow-up actions

```sh
showmeshctl emergency-stop config get
showmeshctl emergency-stop config set --file ./emergency-stop-followups.json
showmeshctl emergency-stop config revisions
```

Configuration requires `config:write`. Each level has its own action list. Follow-up failures remain visible but do not change a confirmed immediate-stop result.

## Interpret the result

The result groups immediate targets, any Show Night transition, and follow-up actions.

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

An unconfirmed result does not prove failure. Inspect current state before repeating a command that may already have taken effect.

## What Emergency Stop does not do

- It does not change Show Mode or configuration.
- `stop` does not move the active Show Night lifecycle; `stop-power-down` and `hard-stop` do.
- It does not make failed or unreachable targets safe; operators must follow up.
- It does not prove physical amplifiers, projectors, or fixtures reached a safe state.

Resolve failed targets, then repeat [Show Night](../show-night/) preparation and readiness before resuming.
