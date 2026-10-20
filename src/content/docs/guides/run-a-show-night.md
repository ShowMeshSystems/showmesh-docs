---
title: Run a Show Night
description: Prepare, verify, operate, and close a Show Night using current evidence.
pageType: procedure
maturity: experimental-active
complexity: advanced
---

Use this procedure to prepare, run, and close a Show Night. Complete the installation's physical checks and emergency plan separately.

## Before you start

Confirm:

- the intended Show and Night Session are active;
- FPP and Resolume participation is explicitly recorded;
- operator and Emergency Stop credentials work;
- current runs and Monitor are receiving fresh evidence;
- physical audio, LTC, render, projector, and fixture checks required by the installation are complete.

## 1. Open preparation

```sh
showmeshctl night status
showmeshctl night prepare-site
```

`prepare-site` creates a new epoch. A readiness result from an earlier epoch cannot authorize this one. The CLI leaves FPP playback running; add `--stop-fpp-playback` only when you intend to stop this Night's players.

:::caution[Check the Prepare site playback choice]
In **Show Night** or **Live Control**, the **Prepare site** dialog starts with the stop-FPP option checked. Leave it off if FPP's schedule already started playback that must continue. Check the named players before confirming.
:::

## 2. Run readiness

```sh
showmeshctl night readiness
```

Resolve blocking checks. `ready_with_warnings` allows start, but the warning remains active. Record it and follow the installation's operating policy. If a Cue-catalog conflict requires an override, inspect the exact claim and revision first.

## 3. Enter pre-show

```sh
showmeshctl night preshow
```

Confirm the intended resting/preshow presentation and background audio on every target. Expect multi-node beds to report one shared scheduled instant and per-node aligned or unaligned evidence.

## 4. Start the night

```sh
showmeshctl night start
```

In the Operator UI, **Start night** asks for confirmation and offers to start without the lead-in. The announcement Cue still plays when you skip the lead-in.

If the saved readiness result became stale, start automatically reruns it and uses the fresh result. A failure names the current blocking check; do not rely on the earlier pass.

Monitor current runs rather than assuming one global playhead. FPP and ShowMesh audio can run at the same time.

## 5. Operate transitions

Use Live Control and the Night page to watch lifecycle state, current runs, target evidence, clocks, and warnings. Announcements use direct Cue activation and require `cue:activate`.

For an uncertain action, inspect fresh evidence before retrying. Acceptance is not confirmation, and an unaligned audio result is not synchronized success.

## 6. Close the night

```sh
showmeshctl night final-show
showmeshctl night fade-out
showmeshctl night power-down
```

`night final-show` makes the next normally timed show the last one. After it, the night runs its end-of-night steps and playlist until you fade out.

`night fade-out` fades the lights and projections, then stops FPP. During a show, it waits until that show ends and skips the end-of-night playlist.

`night power-down` stops the night without those fades. Once FPP is seen idle, the site and night [shutdown sequences](../../using-showmesh/site-power/) run, then the night's end session actions. Run it after `night fade-out` when the night has power steps or end session actions; a night that is only faded out does not run them.

Watch the lifecycle and fresh FPP evidence; a submitted closing command is not proof that playback stopped. Check `night status` for the **Power phase** line. If it says power down stopped early, check the equipment that sequence controls by hand. For an immediate intervention, use Emergency Stop.

These commands remain available when the session is degraded so the site can still close through the standard path.

## Stop or interrupt for weather

**Stop** holds the active Night. After resolving the cause and checking the site, choose **Resume** in Live Control or Show Night and confirm. It starts the show playlist from its first song. See [Emergency Stop](../../using-showmesh/emergency-stop/) for target outcomes and refused Resume commands.

For a weather interruption, follow [Handle a weather delay](../handle-a-weather-delay/). Weather Resume can restart an interrupted show from the top; clearing a cancelled night does not restart it.

## Degraded recovery

If a restart or contradictory evidence marks the session degraded, use the permitted closing commands. If normal closing is unavailable, `night end-session` abandons it to `stopped` and preserves the degraded record. It does not stop FPP or run shutdown sequences; check affected devices separately:

```sh
showmeshctl night end-session
```

To operate again, begin with a new `prepare-site` epoch and a new readiness pass.

## Emergency intervention

Use [Emergency Stop](../../using-showmesh/emergency-stop/) when playout must stop immediately. Every level stops FPP, silences declared audio nodes, and blackouts configured Resolume and declared render surfaces. `stop-power-down` starts Night shutdown; `hard-stop` abandons the session after a separate arm/fire gate.
