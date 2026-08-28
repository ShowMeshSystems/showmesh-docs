---
title: Using ShowMesh
description: Operate the current ShowMesh UI and control surfaces without assuming unimplemented playback features.
pageType: landing
maturity: experimental-active
---

The Operator UI and `showmeshctl` use the same `/api/v1` API. Use the UI for rapid situational awareness and authoring; use the CLI or API when repeatability or machine-readable output matters.

ShowMesh separates **what belongs to a production** from **what the system currently observes**. A show groups production intent. Nodes report the machines participating in the installation. Surfaces describe where pixel data is intended to go. Assets are the files nodes should hold. Actions describe individual device operations, and macros arrange those operations into repeatable sequences.

## How the pieces relate

| Object | Question it answers | Connects to |
| --- | --- | --- |
| [Show](./shows/) | Which production are we configuring or preparing? | Surfaces, assets, actions, and macros name a show ID. One show can be active at a time. |
| [Node](./nodes/) | Which ShowMesh-managed computer is this, and what evidence do we have from it? | Declared nodes can receive assets and be assigned surfaces. |
| [Surface](./surfaces/) | Which channel range and pixel canvas should one node eventually output? | Belongs to a show and names a declared node. |
| [Asset](./assets/) | Which exact file should be present for this show and sequence? | Targets all declared nodes in a show or one specific node. |
| [Action](./actions-and-macros/) | What single named operation should an integration perform? | Belongs to a show and targets FPP, Resolume, or an integration MQTT broker. |
| [Macro](./actions-and-macros/) | Which actions should run, in what order, and what should happen after an uncertain or failed step? | Belongs to a show and references action IDs. |
| [Cue](./cues/) | What should this point in a production present or play? | Belongs to a show and can combine render, audio, LTC, and announcement output. |
| [Playlist](./playlists/) | Which Cues run in which order? | Belongs to a show and uses either FPP or ShowMesh audio as its runner. |
| [Show Night](./show-night/) | How is one night prepared, run, and ended? | Selects a Show, FPP playlists, Transition Steps, optional audio, and safety actions. |

These are references, not one large nested show file. For example, reading a show returns its name and notes; surfaces and actions that name that show remain separate revisioned objects.

This section covers:

- [Nodes](./nodes/): identify ShowMesh agents, accept them into managed inventory, and read their evidence correctly. [Node Types](./node-types/) explains the render and audio roles built on that agent.
- [Shows](./shows/): create a stable namespace for one production and select which show's assets are desired.
- [Surfaces](./surfaces/): describe a node's intended pixel canvas, channel range, frame rate, and output transport.
- [Assets](./assets/): upload exact content revisions, target them, and follow synchronization to nodes.
- [Actions and macros](./actions-and-macros/): name FPP, Resolume, and MQTT operations, then run ordered recipes with recorded outcomes.
- [Cues](./cues/): define the render, audio, LTC, or announcement output for one moment in a Show.
- [Playlists](./playlists/): arrange Cues for FPP or ShowMesh audio and check FPP-backed readiness.
- [Show Night](./show-night/): prepare, start, monitor, and end a night without taking scheduling authority from FPP.

For a quick health check, start with the dashboard and node/FPP/Resolume pages. Treat stale or failed collection as missing evidence, not as a safe value to act on.
