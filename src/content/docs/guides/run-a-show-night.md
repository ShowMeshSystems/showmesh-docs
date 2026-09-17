---
title: Run a Show Night
description: Prepare, verify, operate, and close a Show Night using current evidence.
pageType: procedure
maturity: experimental-active
complexity: advanced
---

This procedure follows the current Show Night lifecycle. It does not replace installation-specific commissioning, staffing, or emergency procedures.

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

`prepare-site` creates a new epoch. A readiness result from an earlier epoch cannot authorize this one.

## 2. Run readiness

```sh
showmeshctl night readiness
```

Resolve blocking checks. A `ready_with_warnings` result allows start but keeps degraded evidence visible; record the warning and decide under the installation's operating policy rather than rewriting it as ready.

Check participating FPP definitions and observations, Cue catalogs, assets, audio routes, clocks, alignment, actions, and interlocks. If a catalog conflict requires an override, inspect the exact claim and revision before accepting it.

## 3. Enter pre-show

```sh
showmeshctl night preshow
```

Confirm the intended resting/preshow presentation and background audio on every target. Multi-node beds should report one shared scheduled instant and per-node aligned or unaligned evidence.

## 4. Start the night

```sh
showmeshctl night start
```

If the saved readiness result became stale, start automatically reruns it and uses the fresh result. A failure names the current blocking check; do not rely on the earlier pass.

Monitor current runs rather than assuming one global playhead. FPP and ShowMesh audio may both be active.

## 5. Operate transitions

Use Live Control and the Night page to observe lifecycle state, FPP reconciliation, Cue activation, audio targets, clocks, and warnings. Announcements use direct Cue activation and require `cue:activate`.

For an uncertain action, inspect fresh evidence before retrying. Acceptance is not confirmation, and an unaligned audio result is not synchronized success.

## 6. Close the night

```sh
showmeshctl night final-show
showmeshctl night fade-out
showmeshctl night power-down
```

These commands remain available when the session is degraded so the site can still close through the standard path.

## Degraded recovery

If contradictory evidence or a restart marks the session degraded, use the permitted closing commands. `night end-session` is the unconditional recovery to `stopped` and preserves the degraded record:

```sh
showmeshctl night end-session
```

To operate again, begin with a new `prepare-site` epoch and a new readiness pass.

## Emergency intervention

Use [Emergency Stop](../../using-showmesh/emergency-stop/) when playout must stop immediately. Every level stops FPP, silences declared audio nodes, and blackouts configured Resolume. `stop-power-down` starts Night shutdown; `hard-stop` abandons the session after a separate arm/fire gate.
