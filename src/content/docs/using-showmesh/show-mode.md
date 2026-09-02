---
title: Show Mode
description: The installation-wide operating mode that reduces edit surface during a show without gating any stop.
pageType: concept
maturity: available
---

**Show Mode** is one installation-wide value: `program` or `show`. It is not per-node, per-device, or per-subsystem. A fresh install reports the built-in default, `program`, at revision 0 with source `default`; it never 404s.

## Why it exists

A show control system is generally safer to run with fewer live edit surfaces once a show is underway. Show Mode gives ShowMesh one value that answers "are we in a show right now," so subsystems can each read the same answer instead of inventing their own private notion of it.

## Read and write it

Reading the mode requires only `observation:read`, which every signed-in role holds. This is deliberate: a mode nobody can see is a trap, because every surface behaves differently depending on it and nothing says why. Writing it requires `config:write` (admin only), and every write is audited like any other configuration change.

```sh
showmeshctl show mode get
showmeshctl show mode set program
showmeshctl show mode set show
showmeshctl show mode revisions
```

A write is a full replacement, validated before it is accepted: an invalid value is rejected and appends no revision. A successful write applies without a coordinator restart, in both directions.

## What reads the mode today

The Resolume WebSocket wake-up channel is held open in `program` and closed in `show`, switching without a coordinator restart in either direction. Cue activation also reads the mode: in `show` mode, the coordinator pins the authorizing Show, Generation, and catalog/cue revisions together at the moment Show Mode begins authorizing that Show, so a mid-show edit to a Cue stays staged rather than reaching any node until the show restarts. `program` mode keeps resolving Cues live.

Nodes are told the current mode so later work can read it at the point of decision. A node that has never been told the mode reads it as `unknown`, which behaves as `show`, the more conservative side.

## What it never does

- It never gates who may act; it changes what the system does, not who is authorized to do it. Authorization stays a separate scope check.
- It never refuses, delays, or degrades blackout, stop, or power-off. [Emergency Stop](../emergency-stop/) is accepted in either mode.
- It is not a lock: configuration edits remain possible in either mode, although Show Mode can hold a Cue edit back from nodes until the show restarts.
- It is not a scheduler: nothing derives it from a clock or from a playlist running. An operator sets it.

## When to switch it

Set `show` before a production begins, and back to `program` once you are done operating and want to configure or test again. Because `show` mode also pins cue-activation identity, expect any mid-show `show.cue` edit to stay staged until the show restarts rather than taking effect immediately; switch to `program` first if you need an edit to reach a node right away.
