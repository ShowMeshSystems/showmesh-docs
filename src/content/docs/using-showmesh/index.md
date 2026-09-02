---
title: Using ShowMesh
description: Operate ShowMesh through the Operator UI and showmeshctl without assuming unimplemented playback features.
pageType: landing
maturity: experimental-active
---

The Operator UI and `showmeshctl` use the same `/api/v1` API. Use the Operator UI for rapid situational awareness and authoring; use the CLI or API when repeatability or machine-readable output matters.

ShowMesh separates **what belongs to a production** from **what the system observes**. A show groups production intent. Nodes report the machines participating in the installation. Surfaces describe where pixel data is intended to go. Assets are the files nodes must hold. Actions describe individual device operations, and macros arrange those operations into repeatable sequences.

## How the pieces relate

| Object | Question it answers | Connects to |
| --- | --- | --- |
| [Show](./shows/) | Which production are we configuring or preparing? | Surfaces, assets, actions, and macros name a show ID. One show can be active at a time. |
| [Node](./nodes/) | Which ShowMesh-managed computer is this, and what evidence do we have from it? | Declared nodes can receive assets and be assigned surfaces. |
| [Surface](./surfaces/) | Which channel range and pixel canvas does one node output? | Belongs to a show and names a declared node. |
| [Asset](./assets/) | Which exact file belongs on a node for this show and sequence? | Targets all declared nodes in a show or one specific node. |
| [Action](./actions-and-macros/) | What single named operation does an integration perform? | Belongs to a show and targets FPP, Resolume, or an integration MQTT broker. |
| [Macro](./actions-and-macros/) | Which actions run, in what order, and what happens after an uncertain or failed step? | Belongs to a show and references action IDs. |
| [Cue](./cues/) | What does this point in a production present or play? | Belongs to a show and can combine render, audio, LTC, and announcement output. |
| [Playlist](./playlists/) | Which Cues run in which order? | Belongs to a show and uses either FPP or ShowMesh audio as its runner. |
| [Show Night](./show-night/) | How is one night prepared, run, and ended? | Selects a Show, FPP playlists, Transition Steps, optional audio, and safety actions. |
| [Show Mode](./show-mode/) | Is the installation set up for editing, or set up to run a show? | One installation-wide value; read by the Resolume adapter and every node. |
| [Emergency stop](./emergency-stop/) | How do we stop playout immediately if something goes wrong? | Stops FPP directly; at higher levels, also moves the active Show Night. |

These are references, not one large nested show file. For example, reading a show returns its name and notes; surfaces and actions that name that show remain separate revisioned objects.

This section covers:

- [Nodes](./nodes/): identify ShowMesh agents, accept them into managed inventory, and read their evidence correctly. [Node types](./node-types/) explains the render and audio roles built on that agent.
- [Shows](./shows/): create a stable namespace for one production and select which show's assets are desired.
- [Surfaces](./surfaces/): describe a node's intended pixel canvas, channel range, frame rate, and output transport.
- [Assets](./assets/): upload exact content revisions, target them, and follow synchronization to nodes.
- [Actions and macros](./actions-and-macros/): name FPP, Resolume, and MQTT operations, then run ordered recipes with recorded outcomes.
- [Cues](./cues/): define the render, audio, LTC, or announcement output for one moment in a Show.
- [Playlists](./playlists/): arrange Cues for FPP or ShowMesh audio and check FPP-backed readiness.
- [Show Night](./show-night/): prepare, start, monitor, and end a night without taking scheduling authority from FPP.
- [Show Mode](./show-mode/): switch the installation between Program Mode and Show Mode without gating a stop.
- [Emergency stop](./emergency-stop/): stop playout at one of three levels, and know what each does and does not touch.

For a quick health check, start with the dashboard and node/FPP/Resolume pages. Treat stale or failed collection as missing evidence, not as a safe value to act on.
