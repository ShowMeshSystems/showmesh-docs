---
title: Experimental FPP Plugin
description: An FPP-host macro runner with local outcome evidence and no production installation claim.
pageType: integration
maturity: experimental-testing
complexity: advanced
---

:::caution[Bench-tested mechanism, not a supported installation]
The source tree contains `showmesh-fpp-plugin`, an FPP-host helper that submits a ShowMesh macro run and records the result locally. Packaging, permissions, cross-version compatibility, and acceptance on a real FPP host remain unverified. Do not add it to a standard show installation yet.
:::

FPP invokes the helper through its own command mechanism. The helper submits a macro run; acceptance means the coordinator accepted that run request, not that every macro step has completed. FPP remains the schedule, playlist-order, and playback authority.

## Credential boundary

The helper uses a dedicated bearer credential. It reads that credential from its fixed private file, requires an exact owner-only file mode, and never accepts it as a command argument or environment setting. Use a machine credential with only the needed scope. Never reuse a human administrator or operator token.

## Read the local outcome

```sh
showmesh-fpp-plugin status
```

This reads the host-local record and makes no coordinator request. It distinguishes five outcomes:

- `ok`: the macro-run request was accepted;
- `refused`: the coordinator rejected this caller's authentication or authorization;
- `rejected`: the coordinator declined the request itself, such as an unknown macro or conflict;
- `unreachable`: the coordinator could not be reached or returned a server error;
- `local_error`: local credential or configuration validation failed before a request was made.

An invalid command invocation can fail before the helper writes any status record; in that case `status` reports that no attempt has been recorded. Do not collapse the recorded states into “FPP is down.” In particular, a refusal is a credential problem, while an unreachable result is a connectivity or coordinator problem.

## What to verify

In a controlled bench environment, run a known macro and inspect the local `status` record. Confirm that it identifies the accepted request or the actual refusal, rejection, reachability, or local-validation failure. This verifies the helper's local reporting mechanism only; it does not verify a packaged installation or macro completion on production equipment.

## Degraded delivery

Refused, rejected, and unreachable outcomes are retained locally and included with a later successful authenticated run submission. The buffer is bounded by count and age and records dropped entries. It improves later diagnosis; it is not a substitute for checking the host-local status record when the coordinator is unavailable.

## Current focus

The plugin reports host-local macro outcomes and can retain delivery results while the coordinator is unavailable. Use the local `status` record to inspect the most recent outcome for a run.
