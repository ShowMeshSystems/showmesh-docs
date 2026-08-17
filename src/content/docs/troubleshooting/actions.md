---
title: Macro or action did not complete
description: Read the run record before retrying so a partial outcome is not repeated blindly.
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

## Symptom: a Resolume action is refused, failed, or unconfirmable

These are separate outcomes:

- **Refused:** no request was sent to Resolume; read the safety or validation reason.
- **Failed:** dispatch was attempted but could not complete.
- **Unconfirmable:** the command was sent, but its effect could not be distinguished from pre-command state.

Do not generate a fresh idempotency key merely to bypass a refusal. Resolve the stated condition first.
