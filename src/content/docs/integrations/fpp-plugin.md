---
title: Experimental FPP plugin
description: Experimental FPP-host macro, brightness, playlist-identity, and signed-fallback runtime boundaries.
pageType: integration
maturity: experimental-active
complexity: advanced
---

:::caution[Nothing here has run on a real FPP host]
The plugin helper, native core, adapters, installer paths, and coordinator client build and have local automated or container evidence. No public package or real-FPP-host acceptance is established here. Do not treat candidate artifacts or local plugin-load coverage as permission to add it to a show installation.
:::

FPP invokes the plugin through its own command and Action mechanisms. The plugin does not become the FPP scheduler: FPP remains the schedule, playlist-order, and playback authority, and every effect described here is either a macro-run request the coordinator accepts or declines, or a purely local FPP Action.

## What exists

- **A Go macro helper** submits a ShowMesh macro run and records the result locally. Acceptance means the coordinator accepted the run request, not that every macro step has completed.
- **A host-neutral C++ core** compiled locally against the host's installed FPP headers. It supplies a two-value brightness engine, exposed to FPP as an Action: a fadeable ceiling combined with a transition gain, producing an effective output the FPP host applies without overwriting the scheduled ceiling.
- **A playlist-entry identity observer** that publishes an atomic, versioned playlist-entry identity event from FPP's own `playlistCallback`. The plugin submits definitions and observations through scheduler-authenticated POST ingestion routes requiring `fpp:observe`; operators inspect the retained results through the separate read-only GET and CLI surfaces described in [FPP](../fpp/).
- **Two FPP version adapters**: one for FPP 9.4 through 9.x (unversioned ABI, relies on destructor teardown) and one for FPP 10.x (versioned ABI, checked at load time). FPP 8 is not supported.

The Go helper is fetched as a checksum-verified prebuilt binary. For verified FPP 10 versions, packaging can also select a digest-locked prebuilt native object for the host architecture; if no matching verified object exists, installation falls back to compiling the native source against that host's FPP headers. Other supported versions compile locally. Candidate artifacts and locked digests are packaging evidence, not a public release.

## Credential boundary

The Go helper reads its coordinator bearer credential from a fixed path (`/etc/showmesh-fpp-plugin/credential`) and refuses to run unless that file's permissions are exactly owner-read-write (mode `0600`). It never accepts the credential as a command-line argument or an environment variable. Use a machine principal with the built-in `scheduler` role, whose fixed bundle includes `show:macro:run`, `night:command`, `fpp:observe`, and `fpp:fallback`. ShowMesh roles are bundles rather than arbitrary one-scope credentials, so do not describe this as a macro-only token. Never reuse a human administrator or operator token.

## Read the local outcome

```sh
showmesh-fpp-plugin status
```

This reads the host-local record and makes no coordinator request. It distinguishes five outcomes:

- `ok`: the macro-run request was accepted;
- `refused`: the coordinator rejected this caller's authentication or authorization;
- `rejected`: the coordinator declined the request itself, such as an unknown macro or conflict;
- `unreachable`: the coordinator could not be reached or returned a server error;
- `local_error`: local credential or configuration validation failed before a request was made. This outcome never reaches the coordinator.

An invalid command invocation can fail before the helper writes any status record; in that case `status` reports that no attempt has been recorded. Do not collapse the recorded states into "FPP is down." A refusal is a credential problem; an unreachable result is a connectivity or coordinator problem.

## What to verify

Before any real-host trial, confirm: artifact selection or local compilation for the exact FPP version, ABI load, brightness behavior, playlist-entry delivery to a real coordinator, signed-program acknowledgement, credential permissions, and uninstall/upgrade behavior. Local automated coverage does not establish these host results.

## Retained outcomes while the coordinator is unavailable

A macro-run submission that comes back `refused`, `rejected`, or `unreachable` is retained locally and included with a later successful authenticated submission. The buffer is bounded to 50 entries and 30 days of age; entries pruned by either bound increment a persisted dropped-entry counter rather than disappearing silently. This improves later diagnosis; it is not a substitute for checking the host-local status record when the coordinator is unavailable.

## Boundaries

- Packaging (`fpp-showmesh`) locks candidate binary digests for a pending version but has not published a release; installing from the packaging repository's default source fails at the download step until a release exists.
- No FPP plugin-manager integration, permissions model, or cross-FPP-version compatibility claim is verified.
- The plugin can fetch, verify, install, acknowledge, and locally resolve signed fallback entries. Coordinator-to-node activation delivery and node execution do not exist yet, so this is not an operational coordinator-outage safeguard.
