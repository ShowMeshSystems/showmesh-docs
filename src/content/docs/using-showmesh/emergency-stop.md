---
title: Emergency stop
description: Stop playout immediately at one of three levels, and recover afterward.
pageType: procedure
maturity: available
complexity: advanced
---

Emergency Stop stops playout on every configured FPP instance immediately. It has three levels, each stronger than the last, and each with its own optional follow-up actions. Every level requires the `show:emergencystop:invoke` scope.

## Before you start

- A principal token that carries `show:emergencystop:invoke`.
- To configure follow-up actions, a separate token or role that carries `config:write` (admin).
- Know which level you need. Stopping playout is show-affecting: it interrupts whatever FPP is doing on every configured instance, with no confirmation prompt.

## The three levels

Each level does everything the level before it does, plus one more effect on the active Show Night session:

| Level | Effect on FPP playout | Effect on an active Show Night session |
| --- | --- | --- |
| `stop` | Stops playout immediately on every configured FPP instance, then runs this level's follow-up actions. | None. |
| `stop-power-down` | Same as `stop`. | Forces the session's own standard graceful shutdown ([`power-down`](../show-night/)) to start now instead of waiting for its ordinary trigger. |
| `hard-stop` | Same as `stop`. | Abandons the session straight to the `stopped` state with no wait, the same decision `night end-session` makes. Gated by an arm/fire sequence so a retry or a redelivered command can never fire it twice. |

Show Mode never gates any of these: being in Show Mode or Program Mode makes no difference to whether a stop is accepted.

## Arm and fire the hard stop

`hard-stop` has no single command that both arms and fires it. This is deliberate: a convenience flag that chained arm and fire together would make the safeguard exist in name only.

1. Run `showmeshctl emergency-stop hard-stop arm`. This mints a single-use token good for about 10 seconds and has no effect on the show by itself. Arming is freely retryable.
2. Run `showmeshctl emergency-stop hard-stop fire --arm-token <token>` with the token from step 1, before it expires. Firing consumes the token atomically before dispatching anything, so neither an accidental retry nor a redelivered command can fire the hard stop twice.

If the token expires before you fire it, arm again.

## Configure optional follow-up actions

Each level can run its own list of `show.action` IDs after the stop, such as turning on work lights. Configuring this requires `config:write`:

```sh
showmeshctl emergency-stop config get
showmeshctl emergency-stop config set --file ./emergency-stop-followups.json
showmeshctl emergency-stop config revisions
```

A follow-up action's own outcome is always reported, but it never changes the command's exit code. A work light that failed to turn on is never reported as "the stop did not happen."

## Run a stop

```sh
showmeshctl emergency-stop stop
showmeshctl emergency-stop stop-power-down
showmeshctl emergency-stop hard-stop arm
showmeshctl emergency-stop hard-stop fire --arm-token <token-from-arm>
```

### Confirm the outcome

Each command's exit code reflects the stop alone, taken as the worst outcome across every configured FPP instance:

| Exit code | Meaning |
| --- | --- |
| `0` | Confirmed: the stop was observed to take effect. |
| `9` | Unconfirmed: the command was accepted but its effect was not yet confirmed by evidence. |
| `12` | Failed: at least one instance's stop did not take effect. |
| `13` | Refused: at least one instance refused the command outright. |

Inspect the printed per-instance outcomes and, for `stop-power-down` or `hard-stop`, the reported Show Night session outcome. Then confirm the affected FPP instances directly:

```sh
showmeshctl fpp <instance-id>
showmeshctl night status
```

## What Emergency Stop does not do

- It does not blank a Resolume composition, mute an audio node, or send any command outside the configured FPP instances and the affected Show Night session.
- It does not change Show Mode or any other configuration.
- `stop` alone never touches an active Show Night session; only `stop-power-down` and `hard-stop` do.

## If a stop does not confirm

An unconfirmed or failed outcome (exit code `9` or `12`) means at least one FPP instance's state could not be confirmed as stopped. Check that instance directly with `showmeshctl fpp <instance-id>` before repeating the command, since FPP may already have stopped and the confirmation alone was delayed. A refused outcome (exit code `13`) means the instance rejected the command; inspect that instance's own logs and connectivity.

If `stop-power-down` or `hard-stop` reports a Show Night session error, the stop itself still took effect on FPP; only the session's own shutdown step failed. Recover the session with `showmeshctl night status`, and use [Show Night](../show-night/)'s degraded-session recovery (`end-session`, then `prepare-site`) if the session reports degraded.
