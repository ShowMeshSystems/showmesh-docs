---
title: Surfaces
description: Author surface geometry and output intent while understanding the missing renderer boundary.
---

A **surface** describes one logical pixel canvas and the output a particular node is intended to drive. It connects show layout intent to a concrete machine: “channels 1 through 24,576 form a 128×64 RGB canvas on `stage-left`, intended for this NDI source.”

Surfaces are useful because a sequence's channel data, a screen's pixel dimensions, and the machine responsible for output are different facts. Keeping that mapping in a named object gives it a stable ID and revision history instead of burying it in deployment notes.

A surface belongs to one show and records:

- its assigned node;
- a start channel and channel count;
- width, height, and `rgb` or `rgbw` pixel format;
- frame rate from 1 through 120;
- an intended `ndi` source name or `hdmi` display.

The channel count must exactly match the canvas: `width × height × 3` for `rgb`, or `width × height × 4` for `rgbw`. The coordinator also requires the referenced show to exist and the assigned node to be declared. It stores output intent without relying on a node being online at authoring time.

## What surfaces do and do not contain

A surface defines **where and how pixel channels are intended to appear**. It does not contain media bytes, a sequence, an FPP playlist, or an action. Assets provide files; actions operate integrations; the surface is the output contract that a future renderer will consume.

The UI and CLI can create, list, inspect, and revise these objects:

```sh
showmeshctl surface list --show <show-id>
showmeshctl surface get <surface-id>
showmeshctl surface set --help
showmeshctl surface revisions <surface-id>
```

`surface set` is a full replacement. Supply the show, name, declared node, channel range, geometry, frame rate, transport, and the transport-specific NDI source name or HDMI display every time. Use `--help` for the exact flags before writing a revision.

## Important current limit

:::caution[Configuration only]
No runtime in this snapshot reads a surface object and renders pixels. Selecting `ndi` or `hdmi` validates and stores output intent; it does not create an NDI source or drive a display.
:::

Surface configuration is still useful for stabilizing IDs, assignments, geometry, and channel ownership before the renderer lands. The coordinator does not currently verify the selected transport against live advertised node capabilities, and no runtime consumes the object. Do not use a valid surface or an online assigned node as an output-readiness signal.
