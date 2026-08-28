---
title: NDI
description: Use the experimental native render-node path to publish a ShowMesh surface to Resolume.
pageType: integration
maturity: experimental-testing
complexity: advanced
---

ShowMesh can now publish an NDI source from a native render node. The current implementation follows FPP MultiSync locally, reads a node-local FSEQ asset, renders the configured surface, and supervises a GStreamer NDI sender. Resolume receives and composes that source downstream.

## What the node needs

- A native ShowMesh agent, installed through [Install a Native Node](../../guides/add-a-node/).
- The vendor NDI runtime installed by the operator. ShowMesh detects it dynamically and does not vendor the runtime.
- A GStreamer `ndisink` element. Debian 13 does not package it; the current working path is a source build from `gst-plugins-rs`.
- A free UDP `32320` listener on the render node for FPP MultiSync. Do not run `fppd` on the same node.

Use a documented local recipe for `gst-plugins-rs`; do not guess package or Cargo commands.

## What to verify

Element discovery is not enough: the NDI plugin loads the NDI runtime when a pipeline changes state. A node that passes `gst-inspect-1.0 ndisink` can still fail when it attempts to send a frame.

Run a small real pipeline on the render node before declaring the transport available:

```sh
gst-launch-1.0 videotestsrc num-buffers=5 is-live=true \
  ! video/x-raw,format=UYVY,width=64,height=64,framerate=10/1 \
  ! ndisink ndi-name=showmesh-check sync=false
```

A clean exit after the pipeline reaches `PLAYING` is the relevant result. If it fails, the agent should remain usable and advertise its render capability without `transport.ndi.send`; investigate the runtime, plugin, and its library path rather than treating the node as healthy NDI output.

## Boundaries

- NDI carries the render node's video surface. It does not replace FPP MultiSync as the timing path.
- Resolume owns source routing, composition, projection mapping, and output. ShowMesh does not edit Arena preferences or start/restart Arena.
- Surface configuration specifies the intended NDI source name and geometry. It becomes output only after the surface is applied to a prepared render node.

Follow [Set Up a Video Node](../../guides/set-up-a-video-node/) for the end-to-end procedure, then [Resolume Arena](../resolume/) for receiver-side configuration.
