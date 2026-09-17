---
title: Render or NDI output is wrong
description: Diagnose surface assignment, asset state, transport probes, NDI runtime, and render recovery.
pageType: troubleshooting
maturity: experimental-testing
---

A declared render surface, a running pipeline, and a visible receiver are separate evidence layers. Diagnose them in that order.

## Capture evidence

```sh
showmeshctl node <node-id>
showmeshctl render status <node-id>
showmeshctl assets manifest --node <node-id> --require-ready
showmeshctl render transport <surface-id>
```

`render transport` reads the most recently stored probe. It does not run a new probe.

## Symptom: surface is unassigned

Confirm the `show.surface` names the declared node, expected geometry, channel range, frame rate, and output transport. One node can have several declared surfaces, but the current runtime supports one active surface at a time.

## Symptom: asset is missing or stale

Compare the active Show's manifest with the node's held assets. Use asset resync to request a fresh inventory before concluding delivery failed. Do not remove an asset that a resolved Cue catalog still references.

## Symptom: NDI pipeline does not play

The NDI probe requires the real pipeline to reach `PLAYING`. Finding an `ndisink` element is not sufficient. Check the installed GStreamer plugin, pipeline error, sender name, route, and current render report.

Do not bind a second UDP 32320 listener on an FPP render node; FPP owns that port for MultiSync.

## Symptom: output is stale, idle, or failed

The node intentionally draws distinct idle, stale, and failure states. Use the reported state and timestamp instead of assuming every non-program image is the same condition.

After fixing the cause, use the narrowest recovery action:

```sh
showmeshctl render probe <node-id> <surface-id>
showmeshctl render restart <node-id> <surface-id>
showmeshctl render apply <node-id> <surface-id> <sequence-id>
```

Each command requires `render:command` and must be confirmed through fresh render evidence.

## Symptom: receiver or projector remains blank

A `PLAYING` sender proves the local pipeline reached its required state. It does not prove a remote NDI receiver, network path, projector, or wall is displaying the image. Check those systems directly.

HDMI output is not a supported render transport in the current runtime.
