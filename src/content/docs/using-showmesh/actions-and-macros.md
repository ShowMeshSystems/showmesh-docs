---
title: Actions and Macros
description: Build reusable logical controls and inspect every step of an asynchronous macro run.
---

An **action** gives an operation a stable logical ID and binds it to an implemented provider. A **macro** runs a sequence of action references with per-step parameters.

The current runtime supports action execution through FPP, Resolume, and configured integration MQTT brokers. Target and parameter validation happens when configuration is written, so an invalid action should fail before showtime.

## Run safely

```sh
showmeshctl action list
showmeshctl action show <action-id>
showmeshctl macro list
showmeshctl macro show <macro-id>
showmeshctl macro run --follow <macro-id>
```

Submitting a macro returns `202 Accepted`; without `--follow`, acceptance is not completion. Inspect later with:

```sh
showmeshctl run list --macro <macro-id>
showmeshctl run show <run-id>
```

## Failure behavior

A run normally continues after an earlier step fails. A step configured with `onFailure: abort` stops dispatch after a failed outcome; `onUnconfirmed: abort` does the same only for an `unconfirmed` outcome. It does not abort for the distinct `unconfirmable` outcome, which means the provider has no confirmation mechanism. When a policy aborts the run, the remaining steps are recorded as skipped. The final record preserves each step's outcome. Review both policies when cleanup, safety actions, or later device commands depend on whether execution continues.

FPP and Resolume steps use their evidence-confirmed command paths. A confirmation timeout is an uncertain outcome: inspect the device and fresh observations before repeating a command that may already have taken effect.
