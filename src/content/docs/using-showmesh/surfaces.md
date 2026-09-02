---
title: Surfaces
description: Author the geometry and output settings a render node uses to present a video surface.
pageType: concept
maturity: experimental-testing
complexity: advanced
---

A **surface** describes one logical pixel canvas and the output a particular node is intended to drive. It connects show layout intent to a concrete machine: “channels 1 through 24,576 form a 128×64 RGB canvas on `stage-left`, published as this NDI source.”

Surfaces are useful because a sequence's channel data, a screen's pixel dimensions, and the machine responsible for output are different facts. Keeping that mapping in a named object gives it a stable ID and revision history instead of burying it in deployment notes.

A surface belongs to one show and records:

- its assigned node;
- a start channel and channel count;
- width, height, and the `rgb` pixel format (the only supported format);
- frame rate from 1 through 120;
- an intended `ndi` source name or `hdmi` display.

The channel count must exactly match the canvas: `width × height × 3` for `rgb`. The current render runtime rejects `rgbw`, even though the broader surface model can represent it. The coordinator also requires the referenced show to exist and the assigned node to be declared. It stores output intent without relying on a node being online at authoring time.

## What surfaces do and do not contain

A surface defines **where and how pixel channels are intended to appear**. It does not contain media bytes, a sequence, an FPP playlist, or an action. Assets provide files; actions operate integrations; a render node consumes the surface only after the operator applies it with a specific sequence assignment.

The Operator UI and the CLI can create, list, inspect, and revise these objects:

```sh
showmeshctl surface list --show <show-id>
showmeshctl surface get <surface-id>
showmeshctl surface set --help
showmeshctl surface revisions <surface-id>
```

`surface set` is a full replacement. Supply the show, name, declared node, channel range, geometry, frame rate, transport, and the transport-specific NDI source name or HDMI display every time. Use `--help` for the exact flags before writing a revision.

## Current limits

:::caution[Applying a surface is experimental]
The current render path runs one active surface per node. You can configure more than one surface for a node, but the agent will not run them together. HDMI has no runtime output path. A valid surface, an online node, or a successful configuration write is never evidence that frames are reaching the intended screen.
:::

Surface geometry must stay within the coordinator's safety limit: the last channel number, width, and height cannot exceed `8,388,608`. This prevents invalid or overflowing configuration; it is not a statement about the limits of FPP or a particular output device. Render telemetry can carry at most eight surface reports in one message, which is separate from the one-active-surface runtime limit.

Use `showmeshctl render apply <node-id> <surface-id> <sequence-id>` only after the exact FSEQ asset is ready on that node. Then run `showmeshctl render probe <node-id> <surface-id>` to make a real GStreamer transport transition, followed by `showmeshctl render status <node-id>` to inspect the fresh pipeline and transport evidence. `render apply` alone intentionally does not establish transport availability; the coordinator does not substitute a configuration write for that evidence.

See [Render nodes](../node-types/render-nodes/) for what `render status` reports when a surface has no usable content, when FPP has moved past the sequence the surface holds, and when a Cue catalog deploy skips restarting a surface's frame writer.

See [Set up a video node](../../guides/set-up-a-video-node/) for the experimental setup procedure.
