---
title: Render or NDI output is wrong
description: Diagnose surface assignment, asset state, transport probes, NDI runtime, and render recovery.
pageType: troubleshooting
maturity: experimental-testing
---

Check the declared surface, local pipeline, and receiver separately, in that order.

## Capture evidence

```sh
showmeshctl node <node-id>
showmeshctl render status <node-id>
showmeshctl assets manifest --node <node-id> --require-ready
showmeshctl render transport <surface-id>
```

`render transport` reads the most recently stored probe. It does not run a new probe.

## Symptom: surface is unassigned

Confirm the surface's node, geometry, channel range, frame rate, and transport. A node can declare several surfaces, but only one can be active.

## Symptom: asset is missing or stale

Compare the Show manifest with the node's assets. Request a fresh inventory before concluding delivery failed. Do not remove an asset still referenced by a Cue catalog.

## Symptom: NDI pipeline does not play

The NDI probe requires the pipeline to reach `PLAYING`; finding `ndisink` is not enough. Check the GStreamer plugin, pipeline error, sender name, route, and render report.

Do not bind a second UDP 32320 listener on an FPP render node; FPP owns that port for MultiSync.

## Symptom: output is stale, idle, or failed

The node draws different idle, stale, and failure fields. Use the reported state and timestamp to identify the condition.

After fixing the cause, use the narrowest recovery action:

```sh
showmeshctl render probe <node-id> <surface-id>
showmeshctl render restart <node-id> <surface-id>
showmeshctl render apply <node-id> <surface-id> <sequence-id>
```

Each command requires `render:command`. Confirm its result through fresh render evidence.

## Symptom: receiver or projector remains blank

A `PLAYING` sender proves only the local pipeline state. Check the NDI receiver, network, projector, and wall directly.

HDMI output is not a supported render transport in the current runtime.
