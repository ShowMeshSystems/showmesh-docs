---
title: What is ShowMesh?
description: A human-first introduction to ShowMesh and the boundary of the current development build.
pageType: concept
maturity: experimental-active
---

ShowMesh is a control and visibility layer for distributed show systems. It is designed to let an operator answer practical questions—what is online, what is playing, what evidence is stale, and whether a command actually took effect—without treating every player and media computer as an unrelated island.

The current system has three main pieces:

- The **coordinator** stores configuration, collects observations, exposes the HTTP API, dispatches commands, and records events and audit history.
- The **Operator UI** is a browser client for that API. It can disappear without stopping the coordinator or a running show.
- **Nodes and integrations** provide evidence and execute bounded commands. Native ShowMesh agents communicate over MQTT; FPP and Resolume have dedicated integrations.

ShowMesh separates **desired state** from **observed state**. A command being accepted is not automatically success. FPP and Resolume control paths wait for follow-up evidence and can report that the outcome was not confirmed.

## Current maturity

This is an active development build, not a released appliance. Its strongest usable path is observation and bounded control of existing FPP and Resolume systems. Show authoring, actions, macros, asset synchronization, and an experimental FSEQ-to-NDI render path are implemented.

## What ShowMesh is not

- It is not a replacement scheduler for FPP.
- It is not a video or pixel renderer for every output transport. The experimental NDI path is documented separately; HDMI does not currently have a runtime output path.
- It does not make an offline node equivalent to a stopped show. A lost management connection is evidence about the control plane, not proof that local playback stopped.
- It is not a TLS terminator. Keep it on a trusted show network or place your own TLS reverse proxy in front of the UI.
