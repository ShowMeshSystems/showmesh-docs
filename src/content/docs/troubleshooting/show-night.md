---
title: Show night lifecycle refused
description: Distinguish a not-yet-ready night command, a state-table refusal, and a degraded session, and recover in each case.
pageType: troubleshooting
---

`showmeshctl night <verb>` drives a closed lifecycle state machine: `inactive`, `preparing`, `preshow`, `transition-to-show`, `live`, `transition-to-resting`, `resting-intershow`, `end-of-night-resting`, `fading-out`, `stopped`. Every lifecycle write requires the `night:command` scope; reads are open.

## Symptom: a night command exits `26` (not ready)

Preserve the command's own output before retrying:

```sh
showmeshctl night status
showmeshctl night readiness
```

Exit `26` means a required precondition is absent or the fresh readiness pass used by `night start` failed. A prior epoch's result is never adopted. When the current result is merely stale, `night start` automatically runs readiness again and uses that fresh outcome.

1. Confirm a preparation epoch is open: run `showmeshctl night prepare-site` if not.
2. Run `showmeshctl night readiness` when you want to inspect and resolve checks before start. If you retry `night start` with a stale result, read the automatically rerun readiness output it returns.
3. Retry the original command.

### Confirm recovery

The original command completes and `showmeshctl night status` reports the expected next lifecycle state.

## Symptom: a night command exits `27` (rejected by current state)

Exit `27` means the command is not simply early, it is not valid from the session's current lifecycle state at all: for example, `night start` after the session has already reached `end-of-night-resting`. Finalization is monotonic; there is no way to move a session backward through the state table.

1. Run `showmeshctl night status` and read the current lifecycle state.
2. Compare it against the command you attempted. A command meant for an earlier phase of the night cannot be replayed once the session has moved on.
3. If you need to end the night from here, use `night final-show`, `night fade-out`, or `night power-down` rather than retrying the original command.

### Confirm recovery

`showmeshctl night status` reports a lifecycle state consistent with the command you actually need next.

## Symptom: a night command exits `28` (session degraded)

Preserve the session's current state before acting:

```sh
showmeshctl night status
```

Exit `28` means a restart, or evidence that contradicted what the session was doing, left it in a state this build cannot confirm is safe to resume from. Only four commands are accepted against a degraded session: `night final-show`, `night fade-out`, `night power-down`, and `night end-session`. Every other lifecycle command refuses while degraded.

`night fade-out` and `night power-down` still issue a real stop to FPP and only report `stopped` once idle is observed; an unconfirmed stop degrades the session further rather than claiming success. `night end-session` is the provisional recovery action: it abandons the session outright, reaches `stopped` unconditionally, and launches nothing. It does not itself clear the degraded record.

1. Prefer `night fade-out` or `night power-down` when either is reachable; they perform the real shutdown work.
2. If neither is reachable, run `night end-session`.
3. Recover with `night prepare-site` to open a fresh preparation epoch.

### Confirm recovery

`showmeshctl night status` reports `stopped`, and a subsequent `night prepare-site` succeeds without exiting `28`.

## Symptom: readiness reports warnings, catalog conflict, or unaligned audio

`ready_with_warnings` permits start but preserves a degraded check. Multi-node bed and announcement readiness can warn when clock/alignment evidence is insufficient. Do not translate this into confirmed synchronization.

ShowMesh can auto-deploy stale Cue catalogs before and during a Night. An exclusive-claim conflict requires an explicit operator override for the current catalog revision; inspect the conflicting Cues and claim before using it.

If a bed or announcement names several targets, inspect each node's assets, `node.clock`, scheduled instant, and aligned/unaligned result. One successful target does not prove the group started together.

## Symptom: `night readiness` reports `unknown` or `not_verifiable`

Read every check name in the readiness output before assuming this blocks the night. `resting:asset-exact-variant:<playlist>` is permanently `not_verifiable`: FPP exposes no content hash, so this build cannot confirm the live host is running the pinned asset's exact bytes. It is stated rather than defaulted to a pass, but excluded from the overall outcome, so `ready` is still reachable once every checkable check passes. A plain `unknown` outcome on another check does not by itself block `night start`; only a missing or stale readiness result does (exit `26`, described in the first symptom on this page). Do not treat `unknown` as equivalent to `ready`; investigate the named check's own reason before proceeding.
