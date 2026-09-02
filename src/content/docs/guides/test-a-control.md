---
title: Test a control safely
description: Exercise one implemented device control and distinguish confirmed, failed, and uncertain outcomes.
pageType: procedure
maturity: available
---

Test one primitive against a non-critical target before placing it in an action or macro.

## Before the command

1. Confirm the correct FPP or Resolume instance ID.
2. Check that its observations are current.
3. Observe the target device directly or have a second operator watching it.
4. Choose a reversible, low-impact command.
5. Know the emergency-stop path before testing anything show-visible.

:::caution[Know the stop levels before you test]
`showmeshctl emergency-stop` stops playout on every configured FPP instance at one of three levels (`stop`, `stop-power-down`, or the two-step `hard-stop`) and requires the `show:emergencystop:invoke` scope. Decide which level you would reach for before running an unfamiliar command against a live target. See [Emergency stop](../../using-showmesh/emergency-stop/) for what each level does and how to read its exit code.
:::

For FPP, a volume change in a safe test window is one option:

```sh
showmeshctl fpp set-volume <instance-id> <0-100>
```

For Resolume, list the exact available vocabulary and imported identities first:

```sh
showmeshctl resolume action list
showmeshctl resolume composition show
```

## Interpret the result

- **Confirmed:** ShowMesh observed the requested state after dispatch.
- **Rejected or failed:** the API/device returned a concrete failure; fix the named cause before retrying.
- **Timed out / not confirmed:** ShowMesh lacks enough evidence. Look at the target and refresh its observations before deciding whether to retry.

## Check the binding before you rely on it

Once a primitive is bound to a logical action, re-resolve that binding against current integration state before trusting it in a show:

```sh
showmeshctl action check <action-id>
```

This is a read; it dispatches nothing. It exits `29` if the checked binding is broken, and never exits `29` for an `unknown` result (the check itself could not run). Fix a broken binding before invoking the action or running a macro that references it.

## Move into a macro

Invoke the action directly only after the primitive is confirmed and its binding checked (`showmeshctl action invoke <action-id>`, which requires `show:action:invoke`) or reference it from a macro. Run the macro with `--follow` during testing, then inspect every step rather than relying on the overall label alone.
