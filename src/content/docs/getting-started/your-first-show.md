---
title: Your First Show
description: Create and inspect a show configuration without mistaking it for a complete playback pipeline.
---

The current build can create a revisioned show, add surface definitions, upload assets, create actions and macros, activate the show, and inspect asset readiness. It cannot render a surface or start a complete ShowMesh-owned playback pipeline.

## Before you start

- Install the coordinator and sign in as a principal with configuration and asset permissions.
- Connect any native node agents you want to target.
- Configure and validate FPP or Resolume separately before embedding their controls in actions.

## Author the configuration

1. In the Operator UI, create a show with a stable ID, human-readable name, and optional notes.
2. Create surfaces assigned to the show and a declared node. Surface channel ranges and geometry are validated, but do not produce output.
3. Upload assets for the show. Choose whether each asset targets all nodes or one node.
4. Check the asset manifest. `ready` means the agent reported the expected content hash; it does not mean a media engine can play the asset.
5. Create logical actions that target implemented providers such as FPP, Resolume, or an approved integration MQTT broker.
6. Create a macro from those actions and run it in a test environment.
7. Activate the show only after the object relationships and asset readiness look correct.

## Success condition

You can see the active show, its surfaces, actions, macros, assets, and node readiness in the UI or API. An action or macro run records evidence-backed outcomes for supported controls.

## Current boundary

Activating a show changes a stored pointer. It does not schedule FPP, render surface pixels, start audio/video playback, or emit NDI/HDMI. Use FPP and Resolume's current playback facilities, with ShowMesh as the observation and bounded-control layer.

