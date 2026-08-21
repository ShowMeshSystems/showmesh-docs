---
title: Test a Control Safely
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

## Move into a macro

Only after the primitive is confirmed should you bind it to a logical action and reference that action from a macro. Run the macro with `--follow` during testing, then inspect every step rather than relying on the overall label alone.
