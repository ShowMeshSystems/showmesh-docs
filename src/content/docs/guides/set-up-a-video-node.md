---
title: Set Up a Video Node
description: Set up the experimental FSEQ-to-NDI render path without confusing a configured surface for a working screen.
pageType: procedure
maturity: experimental-testing
complexity: advanced
---

This guide gets one experimental render node from a node-local FSEQ file to an NDI source that Resolume can receive.

:::caution[Use a dedicated node]
A render node listens for FPP MultiSync on UDP `32320`; it must not share that port with `fppd`.
:::

## 1. Confirm the deployment profile

The documented transport profile is a native node on Debian 13 amd64, one active surface, 40 fps, and NDI. HDMI output is not available.

Install the node first with [Install a Native Node](../add-a-node/). Give it local storage for the node-targeted FSEQ assets and network reachability to the broker.

## 2. Install and prove the NDI prerequisites

Install the NDI runtime from its vendor source on the render node. ShowMesh loads that runtime dynamically; it does not package or redistribute it.

Debian 13 does not package GStreamer's `ndisink` element. The working bench path builds it from `gst-plugins-rs`, but the exact source revision and build commands have not yet been captured in a reproducible public recipe. Use a known-good local build and record its version, plugin path, and runtime version before depending on it.

First check that GStreamer sees the element:

```sh
gst-inspect-1.0 ndisink
```

Then run an actual sender pipeline. Element discovery alone does not load the NDI runtime:

```sh
gst-launch-1.0 videotestsrc num-buffers=5 is-live=true \
  ! video/x-raw,format=UYVY,width=64,height=64,framerate=10/1 \
  ! ndisink ndi-name=showmesh-check sync=false
```

The expected result is a clean transition to `PLAYING` and exit. If the test fails after `PLAYING` is printed, NDI is not working yet. Fix the runtime or plugin path before continuing; do not treat a successful `gst-inspect` as transport evidence.

The agent detects its GStreamer/NDI capability after it connects to MQTT; it does not watch for runtime or plugin changes. If the service was already running when you installed or changed NDI, restart it now:

```sh
sudo systemctl restart showmesh-agent
```

## 3. Start, declare, and inspect the node

Start the agent through its service unit, then use an administrator-scoped CLI:

```sh
showmeshctl node <node-id>
showmeshctl declare -label "<descriptive label>" <node-id>
```

After a successful NDI pipeline probe, the node should advertise both `render.surface` and `transport.ndi.send`. If NDI is unavailable, the agent should still start and advertise the non-NDI portion of its role; that is expected degradation, not an excuse to configure an NDI surface.

If the node has more than one suitable network interface, use `SHOWMESH_MULTISYNC_INTERFACE` to restrict its multicast join deliberately. The default joins suitable interfaces. Do not set `SHOWMESH_MULTISYNC_LISTEN_ADDR` to a different port in a production deployment; the normal render path listens on `:32320`.

## 4. Create and activate the show

Asset synchronization and render apply both require an active show. Create the show once and make it active before staging the FSEQ:

```sh
showmeshctl show set -name "Holiday 2026" holiday-2026
showmeshctl show activate holiday-2026
showmeshctl show active
```

Next, make the coordinator's asset content URL reachable from the render node. The default is intentionally empty, so a node will never receive asset bytes until this is configured:

```sh
showmeshctl assets settings set \
  --content-base-url http://<node-reachable-coordinator>:8080
```

Use an HTTP(S) URL that the node can actually resolve and reach, not `localhost` unless the coordinator and node are the same machine. If the coordinator closes anonymous API reads, create a dedicated `machine` principal with the `viewer` role and put its issued token in `SHOWMESH_AGENT_API_TOKEN`; never copy an administrator token to the node. [Install a Native Node](../add-a-node/) has the exact issuance commands.

## 5. Create one surface and stage its FSEQ asset

Create a show and a surface whose channel math matches the actual canvas. For a 64 × 64 RGB screen, the channel count is `64 × 64 × 3 = 12288`:

```sh
showmeshctl surface set \
  --show holiday-2026 \
  --name "Stage-left screen" \
  --node <node-id> \
  --start-channel 1 \
  --channel-count 12288 \
  --width 64 \
  --height 64 \
  --pixel-format rgb \
  --frame-rate 40 \
  --transport ndi \
  --ndi-source-name "ShowMesh stage left" \
  stage-left-screen
```

Use the values from the intended xLights layout, not the sample dimensions. ShowMesh rejects a channel count that does not match the canvas. Manual channel ranges are a supported first-class path.

Upload the node-targeted FSEQ file, then check its manifest before applying the surface:

```sh
showmeshctl assets upload \
  --show holiday-2026 \
  --sequence <sequence-id> \
  --media-type fseq \
  --target-kind node \
  --target <node-id> \
  --file <path-to-node-fseq>
showmeshctl assets manifest --node <node-id> --require-ready
```

`assets manifest --require-ready` checks once; it does not wait or retry. Exit status `0` means ready, `20` means not ready, and `21` means readiness is unknown. On either nonzero result, investigate the node's asset-sync path and rerun this command until it returns `0`; do not apply the surface yet.

## 6. Apply and inspect the renderer

```sh
showmeshctl render apply <node-id> stage-left-screen <sequence-id>
showmeshctl render probe <node-id> stage-left-screen
showmeshctl render status <node-id>
```

`render apply` configures the assignment but does not itself prove that a frame can leave the node. `render probe` performs the real GStreamer transport transition and creates the fresh transport evidence to inspect in `render status`. Confirm the surface pipeline state and transport availability after the probe. An accepted request is not proof that the pipeline is producing frames.

In Resolume, select the exact NDI source name configured on the surface and route it into the intended composition. ShowMesh does not create Arena's source routing, mapping, or projection output.

## 7. Make the evidence meaningful

Use a dedicated bench FPP or containerized bench `fppd` to play a real sequence. Watch a sharp event—such as a blackout or color snap—on the physical lights and the projected surface at the same time. A screen recording reviewed later is not a substitute for a live timing observation.

Record the render host, NDI runtime/plugin versions, FPP and Arena versions, canvas geometry, achieved frame rate, late/dropped frames, CPU utilization, run length, and the direct visual result. Current evidence does not yet establish:

- real FSEQ-to-wall timing against physical lights;
- frame pacing at the intended canvas dimensions;
- behavior after FPP, sender, or receiver restart;
- arm64 or Ubuntu support.

For the transport boundary and failure interpretation, see [NDI](../../integrations/ndi/). For the receiver, composition, and recovery boundary, see [Resolume Arena](../../integrations/resolume/).
