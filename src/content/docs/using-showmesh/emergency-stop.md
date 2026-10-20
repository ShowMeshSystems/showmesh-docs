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
- `resolume.blackout` to every configured Resolume instance;
- `render.surface.blackout` to every declared render surface.

Each target reports its own outcome. Any failed immediate target fails the operation. Emergency Stop requires `show:emergencystop:invoke` and works in both Program Mode and Show Mode.

## Choose a level

| Level | Immediate stop | Active Show Night effect |
| --- | --- | --- |
| `stop` | Stops FPP, silences audio, and blackouts Resolume and render surfaces. | Holds the active Night so its playback does not restart automatically. |
| `stop-power-down` | Performs the same immediate stop. | Starts the night's power down immediately, without waiting for the show or for safety checks. The shutdown sequences run with their waits once FPP is seen idle. |
| `hard-stop` | Performs the same immediate stop. | Abandons the session directly to `stopped`, with no wait, and skips its end session actions. Every action in the selected shutdown sequences is sent at once. Requires arm and fire. |

`stop-power-down` and `hard-stop` run the site [shutdown sequences](../site-power/#emergency-stop-and-shutdown-sequences), less the ones unticked for that level, plus the open night's extra sequences. With no night open, `stop-power-down` still runs its sequences. `stop` runs none.

Each level can also run optional follow-up actions, such as work lights. Their failures are reported separately.

## Before you start

- Use a principal carrying `show:emergencystop:invoke`.
- Use an administrator credential when changing follow-up configuration.
- Expect all configured FPP, declared audio, configured Resolume, and declared render-surface targets to be affected.
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

## Configure follow-up actions and sequences

In the Operator UI, open **Settings → Emergency stop**. Each level has a **Follow-up actions** list. The follow-up actions run in order after the immediate stop; a failed action is reported and the rest still run. **Stop and power down** and **Hard stop** also list the site shutdown sequences: untick one to leave it out of that level.

From the command line:

```sh
showmeshctl emergency-stop config get
showmeshctl emergency-stop config set --file ./emergency-stop-followups.json
showmeshctl emergency-stop config revisions
```

Configuration requires `config:write`. The file names every level, each with an `actions` list. `stopPowerDown` and `hardStop` can also list the sequence IDs to skip:

```json
{
  "stop": { "actions": ["work-lights-on"] },
  "stopPowerDown": { "actions": [], "skipSequences": [] },
  "hardStop": { "actions": [], "skipSequences": ["projector-cooldown"] }
}
```

A skip list on `stop` is refused, because Stop runs no sequences. Follow-up failures remain visible but do not change a confirmed immediate-stop result. When a level starts shutdown sequences, the result lists them; read each step's outcome in the activity log.

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
- `stop` preserves the lifecycle state but holds the active Night. `stop-power-down` starts power down; `hard-stop` abandons the session.
- It does not make failed or unreachable targets safe; operators must follow up.
- It does not prove physical amplifiers, projectors, or fixtures reached a safe state.

## Resume after Stop

Resolve failed targets and confirm that the site can run again. While the Night is held, its loop and Cue activation loop start no output. Live Control and Show Night show the stopped state.

:::caution[Resume starts the show again]
**Resume** starts the show playlist from its first song. It does not continue from the interrupted position.
:::

In **Live Control** or **Show Night**, choose **Resume** and confirm. The CLI equivalent requires `night:command`:

```sh
showmeshctl night resume-show
showmeshctl night status
```

Confirm that the hold cleared, the expected show transition began, and fresh target evidence matches the intended output. Resume is refused during a weather delay, before the night's shows, after the final show, during shutdown, or while the session is degraded. Follow the reported remedy; use [Show Night recovery](../../troubleshooting/show-night/) for a degraded session.

If the stop result says the Night could not be held, it can start another show. Run `showmeshctl night end-session` to abandon that session, then check every target directly. End session does not stop devices itself.

After shutdown or hard stop, repeat [Show Night](../show-night/) preparation and readiness before operating again. For weather interruptions, use [Handle a weather delay](../../guides/handle-a-weather-delay/).
