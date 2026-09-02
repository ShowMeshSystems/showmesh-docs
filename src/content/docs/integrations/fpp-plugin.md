---
title: Experimental FPP Plugin
description: An FPP-host plugin with a macro-run helper, a local brightness engine, and a playlist-entry identity observer, none of it installed on real FPP hardware yet.
pageType: integration
maturity: experimental-active
complexity: advanced
---

:::caution[Nothing here has run on a real FPP host]
The plugin's Go helper, its host-neutral C++ core, both FPP version adapters, and the outbound coordinator client exist, build, and pass their own tests in CI. They have run against test doubles only. No release has been published, and nothing described on this page has been installed on a real FPP host or exercised against a real coordinator. Do not add it to a show installation.
:::

FPP invokes the plugin through its own command and Action mechanisms. The plugin does not become the FPP scheduler: FPP remains the schedule, playlist-order, and playback authority, and every effect described here is either a macro-run request the coordinator accepts or declines, or a purely local FPP Action.

## What exists

- **A Go macro helper** submits a ShowMesh macro run and records the result locally. Acceptance means the coordinator accepted the run request, not that every macro step has completed.
- **A host-neutral C++ core** compiled locally against the host's installed FPP headers. It supplies a two-value brightness engine, exposed to FPP as an Action: a fadeable ceiling combined with a transition gain, producing an effective output the FPP host applies without overwriting the currently scheduled ceiling.
- **A playlist-entry identity observer** that publishes an atomic, versioned playlist-entry identity event from FPP's own `playlistCallback`. The coordinator ingests this through the read-only playlist-definition and playlist-entry-observation surfaces described in [FPP](../fpp/).
- **Two FPP version adapters**: one for FPP 9.4 through 9.x (unversioned ABI, relies on destructor teardown) and one for FPP 10.x (versioned ABI, checked at load time). FPP 8 is not supported.

Only the Go helper ships as a prebuilt binary, fetched by version and processor architecture with a checksum verified against a committed digest list. The C++ core has no prebuilt distribution; it is architecture-independent source, compiled on the host against that host's FPP headers.

## Credential boundary

The Go helper reads its coordinator bearer credential from a fixed path (`/etc/showmesh-fpp-plugin/credential`) and refuses to run unless that file's permissions are exactly owner-read-write (mode `0600`). It never accepts the credential as a command-line argument or an environment variable. Use a machine credential with only the scope the macro run needs. Never reuse a human administrator or operator token.

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

Every verification claim available today is against test doubles, not a real FPP host or a real coordinator. Before any real-host trial, expect at minimum to confirm: the C++ core builds against the target FPP version's actual headers, the plugin loads under that FPP host's own ABI expectations, the brightness Action applies without a competing ceiling write, the playlist-entry identity event reaches a real coordinator and resolves to the expected Cue, and the credential file's ownership and mode survive the host's own package or plugin-manager install path. None of this is established here.

## Degraded delivery

A macro-run submission that comes back `refused`, `rejected`, or `unreachable` is retained locally and included with a later successful authenticated submission. The buffer is bounded to 50 entries and 30 days of age; entries pruned by either bound increment a persisted dropped-entry counter rather than disappearing silently. This improves later diagnosis; it is not a substitute for checking the host-local status record when the coordinator is unavailable.

## Boundaries

- Packaging (`fpp-showmesh`) locks candidate binary digests for a pending version but has not published a release; installing from the packaging repository's default source fails at the download step until a release exists.
- No FPP plugin-manager integration, permissions model, or cross-FPP-version compatibility claim is verified.
- The plugin's playlist-entry identity event and the coordinator's signed fallback program (see [FPP](../fpp/)) share the same entry-key design, but the plugin side of executing a fallback activation is not part of what exists today.
