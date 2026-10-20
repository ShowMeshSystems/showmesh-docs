---
title: Site power and site actions
description: Decide what cuts power at the end of a night, what runs as housekeeping, and how Emergency Stop and the test power buttons use the same shutdown sequences.
pageType: concept
maturity: experimental-active
complexity: advanced
---

ShowMesh runs actions at four points around a night: when the site is prepared, when power is cut, after the night is over, and when an operator tests power by hand. Each point has its own list, and each list fails differently. Put a step in the list whose failure behavior matches what the step does.

| Where you set it | List | When it runs | When a step fails |
| --- | --- | --- | --- |
| **Settings → Site settings** | Shutdown sequences | At every night's power down, from **System power off**, and from Emergency Stop levels 2 and 3. | That sequence stops, so no more power is cut. Other sequences continue. |
| **Settings → Site settings** | Power-on actions | Only from **System power on**. Never part of a night. | The next action still runs. |
| **Shows → your Show → Night Session** | Prepare site | Once, when **Prepare site** opens a new preparation. | The next action still runs. |
| **Shows → your Show → Night Session** | Power down | At that night's power down, together with the site sequences. | That sequence stops, so no more power is cut. |
| **Shows → your Show → Night Session** | End session | After the night stops, once its power down is finished. | The next action still runs. |

Every entry in these lists is an existing [action](../actions-and-macros/). Create the action first, then add it to a list.

## Choose where a step belongs

Ask two questions about each step.

**Does it cut power, or must it happen in order with checks between steps?** Put it in a shutdown sequence. A sequence stops at the first step that fails, so a later step never removes power after an earlier one went wrong. When a sequence stops early, the night reports it.

**Is it shared by every night, or specific to one Show?** Shared steps go in a site shutdown sequence. Show-specific power steps go in that night's **Extra sequences for this night only**. Both run at the same power down.

Use **End session** for wrap-up that is safe to skip when something fails and that belongs after the power is off: resetting a state, switching a scene back, or sending a notification. End session runs each action and moves on, whatever the result. End session can only use actions from the night's own Show.

For example, a site that runs a Halloween Show and a Christmas Show might use:

- a site shutdown sequence that powers down the projectors, waits for them to cool, then cuts the shared show circuits;
- a Halloween-only extra sequence that turns off the fog machines before cutting their outlet;
- Halloween end session actions that reset the props controller to its idle scene.

## Shutdown sequences

A shutdown sequence is a named, ordered list of steps. Each step does one of these:

- **Run an action.** Tick **Must confirm** when the sequence must not continue until the action's integration confirms the result. Tick **Removes power** when the step cuts power to show equipment.
- **Wait** for a number of seconds, from 1 ms to 24 hours.

At power down, every sequence starts at the same time and runs side by side. Steps inside one sequence run in order.

A sequence stops at a step when:

- the action fails or is refused;
- **Must confirm** is ticked and the action is not confirmed;
- the action was deleted after the sequence was saved.

The remaining steps in that sequence are not sent. The other sequences continue. "Confirmed" means the action's own integration confirmed the effect, for example FPP reporting the new state or an MQTT reply. Sequences add no timeout of their own; an action's own response deadline applies.

The editor refuses a sequence with no name, no steps, more than 20 steps, a step that is both an action and a wait, or the same action twice. A site can hold up to 32 sequences. Saving a renamed sequence keeps its original ID, so nights that skip it by ID keep skipping it.

:::caution[A stopped sequence can leave power on]
When a sequence stops early, the steps after the failure were not sent. Check the equipment that sequence controls by hand.
:::

## The night's site actions

Author these in the Night Session editor under **Site actions**.

### Prepare site

Runs once when **Prepare site** opens a new preparation. Replaying the same preparation does not send them again. Actions run in order in the background. An action that has not resolved after about two and a half minutes is left pending, and the next one runs. Use actions that set a state, so running them a second time on another night is harmless.

### Power down

**Power down presentation** in Show Night or Live Control, or `showmeshctl night power-down`, starts it. The night stops admitting new shows. A show that is playing becomes the final show and finishes first; otherwise the night stops right away. Power down does not run the **Fade out night** lights and projection fades. A configured safety check can block the command.

The shutdown sequences start only after the night reaches `stopped` and FPP is seen idle. Until then, the night status reads "Power down was requested. It waits until FPP is seen stopped."

The night runs every site sequence it has not unticked, plus its own extra sequences. Site sequences are read from Site settings when power down runs, so a change saved in Site settings applies to the next power down. The night's skip list and extra sequences come from the Night Session version the night started with.

When every sequence has finished, the night status shows one of these:

- "Power down finished."
- "Power down stopped early in *sequence names*, so some power may still be on. Check it by hand."

### End session

End session actions run in order after the night stops:

- after a power down finishes, including one that stopped early;
- immediately, when **End session** closes a night that had no fade out or power down requested.

A night that was only faded out waits. Press **Power down presentation** after **Fade out night** to run its power down and then its end session actions. If you close a faded-out night with **End session** instead, its end session actions do not run.

An action that fails is skipped and not retried. A hard stop skips every end session action.

## Test power outside a night

Use the test power buttons to check the wiring between nights.

1. In **Live Control** or **Show Night**, choose **Testing** under the night lifecycle controls.
2. Choose **System power on** or **System power off**.
3. Confirm the second dialog.

**System power on** runs the power-on actions in order. **System power off** runs every site shutdown sequence, with its waits, exactly as a night's power down would, but without any night's skip list or extra sequences.

The buttons require `show:emergencystop:invoke`. They are refused when:

- a night session is open, in any state except `stopped`: "A night session is open, so the test power buttons are off. End the session first.";
- no power actions are set up;
- another power run is still going.

A run starts in the background. Read each step's result in the activity log; the start response does not prove the equipment changed state.

## Emergency Stop and shutdown sequences

[Emergency Stop](../emergency-stop/) levels 2 and 3 run the site shutdown sequences after the immediate stop. Each level has its own skip list under **Settings → Emergency stop**.

| Level | Sequences that run | How they run |
| --- | --- | --- |
| **Stop** | None. | Not applicable. |
| **Stop and power down** | Site sequences not unticked for this level, plus the open night's extra sequences. The night's own skip list is ignored. | With their waits, after FPP is seen idle. With no night open, they start immediately. |
| **Hard stop** | Site sequences not unticked for this level, plus the open night's extra sequences. | Every action in every selected sequence is sent at once. Waits are skipped, and a failed step does not hold back later ones. |

Hard stop also skips the night's end session actions.

:::caution[Hard stop sends power steps out of order]
Hard stop does not wait between steps or stop at a failure. If any sequence depends on its waits, for example letting a projector cool before its power is cut, untick that sequence for **Hard stop** or accept that its power is cut without the wait.
:::

## Command line

Site settings:

```sh
showmeshctl sitepower get
showmeshctl sitepower set --file ./site-power.json
showmeshctl sitepower revisions
showmeshctl sitepower on
showmeshctl sitepower off
```

`get`, `set`, and `revisions` require `config:write`. `on` and `off` require `show:emergencystop:invoke` and print the run ID; results go to the activity log.

A night's site actions are part of the Night Session file. Set them with `showmeshctl night set --file <path>`; there are no separate flags. `showmeshctl night get <night-id>` prints them under **Site actions**, and `showmeshctl night status` shows power down progress on its **Power phase** line.

Night Session files saved with the older `siteControl` block still load and are converted: the thermal profile becomes a prepare-site action, and the power-off becomes an extra sequence named `power-off`. A new save that still contains `siteControl` is refused. Move those steps into site actions.

See [Show Night](../show-night/) for the night lifecycle and [Run a Show Night](../../guides/run-a-show-night/) for the operating procedure.
