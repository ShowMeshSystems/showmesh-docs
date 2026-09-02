---
title: Render nodes
description: How an experimental render node turns FSEQ surface data into synchronized video output.
pageType: concept
maturity: experimental-testing
complexity: advanced
---

A **render node** turns lighting-sequence data into a video surface. It holds its own node-specific FSEQ asset, follows the FPP MultiSync timeline, extracts the channel range assigned to a ShowMesh surface, paints those values into the surface's pixel canvas, and sends the resulting frames through an output transport.

The initial path uses NDI to deliver that video to Resolume. Resolume remains responsible for projection composition and mapping after the source arrives; the render node does not launch clips, select decks, or control the projection layout.

Treat the render path as experimental. The current runtime supports one active surface per node and NDI output; HDMI output is not available.

## What the node owns

The render node is responsible for:

- receiving FPP MultiSync directly over UDP and maintaining the current sequence timeline locally;
- resolving the exact node-local FSEQ asset assigned to the active show and sequence;
- reading only the configured surface's channel range from each FSEQ frame;
- converting `rgb` channel values into the configured canvas;
- supervising the local GStreamer pipeline and restarting it after failure;
- sending frames through the configured transport;
- publishing pipeline, frame-rate, dropped/late-frame, transport, timeline, and output-mode evidence.

The coordinator is not in the timing or frame path. It assigns configuration, dispatches bounded operations, and observes results; the node continues local media work without a coordinator round trip for every frame.

## How a surface reaches the screen

1. xLights creates the sequence data. [FPP Connect ingestion](../../../integrations/xlights/) can target a native render node experimentally; the manual ShowMesh asset path remains a valid fallback.
2. ShowMesh synchronizes the exact content hash to the assigned node before playback.
3. A [`show.surface`](../../surfaces/) object identifies the show, declared node, channel range, canvas geometry, frame rate, and intended transport.
4. FPP remains the schedule and playback authority. Its MultiSync packets tell the render node which sequence position to present.
5. The renderer extracts that frame locally and feeds an agent-supervised GStreamer pipeline.
6. The NDI sender publishes the surface. Resolume receives and composes it downstream.

This is file-based local rendering, not a live matrix stream from the coordinator or FPP. Keeping the FSEQ on the node removes the coordinator and ordinary control traffic from the real-time media path.

An apply resolves its FSEQ by media type: it filters to the sequence's current `fseq` asset specifically, never to whatever asset happens to be current for that sequence and target. If a sequence has current assets but none of them is an `fseq`, the coordinator refuses the apply and names the mismatch, rather than sending a non-FSEQ file downstream for the node to reject.

## Drawing state and idle output

The frame writer reports one of four drawing states: drawing real content, idle, an extraction failure, or **stale**. Stale means the MultiSync timeline reports a sequence filename that no longer matches the FSEQ the writer holds, which happens when FPP moves on to a sequence the surface has no content for; the writer stops drawing that mismatched content rather than continuing to paint a sequence FPP has already left. An empty timeline filename is not treated as a mismatch, since it means nothing has been observed yet.

When an assignment carries no usable FSEQ content at all, the node reports **idle** output through `render.settings.idleOutput` rather than falling back to a silent test pattern with no reported mode or failure.

A [Cue catalog](../../cues/#cue-catalog) deploy that leaves a surface's resolved sequence and content hash unchanged skips restarting the frame writer, avoiding a visible stop-then-start for a deploy that changed nothing the surface draws. An empty content hash on either side of that comparison is never treated as a match.

## Diagnostic surface

Set `SHOWMESH_RENDER_DIAGNOSTIC_SURFACE` (plus `SHOWMESH_RENDER_DIAGNOSTIC_WIDTH`, `_HEIGHT`, `_FRAME_RATE`, and `_NDI_SOURCE_NAME`) on the agent to run a node-local diagnostic idle surface, independent of any coordinator-assigned surface. It is for confirming a node's own transport path works before wiring it into a show.

## Current scope

The implementation in current `main` includes:

- FSEQ parsing and bounded channel extraction;
- one or more configured surface assignments at the protocol and schema level;
- GStreamer pipeline construction, supervision, restart, and diagnostic test patterns;
- NDI transport probing and availability evidence;
- surface apply, clear, pipeline restart, and transport probe operations;
- coordinator, CLI, API, and Operator UI surfaces for renderer configuration and evidence.

The first deployment profile concentrates on Linux/x86 hardware, one active surface per node, 40 fps, and NDI. The broader schema does not permanently encode the one-surface limit.

## Deliberate boundaries

- Render nodes do not run `fppd`; they listen for MultiSync as remotes.
- A render node publishes a video source for Resolume. Resolume control belongs to the separate integration.
- NDI support is dynamically detected. A missing runtime must degrade the render capability without preventing the rest of the agent from starting.
- HDMI remains represented by the surface model but is not part of the current operating profile.
- FPP Connect ingestion is experimental; manual targeted asset upload remains a valid fallback.

For the operator procedure, including NDI runtime checks and surface authoring, see [Set up a video node](../../../guides/set-up-a-video-node/).
