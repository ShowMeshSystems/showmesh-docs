---
title: Macro or action did not complete
description: Read the run record before retrying so a partial outcome is not repeated blindly.
pageType: troubleshooting
---

## Symptom: a macro command returned but the show did not change

Macro submission is asynchronous unless `--follow` is used. Capture the run ID, then inspect it:

```sh
showmeshctl run show <run-id>
```

The run record separates two facts:

- `completed`: whether all intended steps ran without aborting.
- `confirmed`: whether evidence confirmed the effects that were designed to be confirmable.

A completed but unconfirmed run is not the same as an aborted run.

## Symptom: `--follow` exits 14

The follow loop reached its idle timeout without an update. It is not a total-runtime limit and does not prove failure. Query the run ID again before submitting another run.

## Symptom: `action check` reports a broken binding

```sh
showmeshctl action check <action-id>
```

This is a read; it dispatches nothing and needs no credential. It exits `29` when the checked binding is broken: the target no longer resolves, or resolves ambiguously, against current integration state. It never exits `29` for `unknown` (the check itself could not be performed). Fix the named cause before invoking the action or running a macro that references it, then rerun `action check` and confirm it no longer reports broken.

## Symptom: `action invoke` is refused

`showmeshctl action invoke <action-id>` requires the `show:action:invoke` scope. A `403` means the credential authenticated but the principal lacks that scope; run `showmeshctl session` and have an administrator adjust the role. This is a separate gate from the scopes a macro run uses; a principal that can run macros does not automatically get direct action invocation.

## Symptom: a Resolume action is refused, failed, or unconfirmable

These are separate outcomes:

- **Refused:** no request was sent to Resolume; read the safety or validation reason.
- **Failed:** dispatch was attempted but could not complete.
- **Unconfirmable:** the command was sent, but its effect could not be distinguished from pre-command state.

Do not generate a fresh idempotency key merely to bypass a refusal. Resolve the stated condition first.
