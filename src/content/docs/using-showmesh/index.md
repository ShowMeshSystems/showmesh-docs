---
title: Using ShowMesh
description: Operate the current ShowMesh UI and control surfaces without assuming unimplemented playback features.
---

**Status: Experimental — Active Development**

The Operator UI and `showmeshctl` use the same `/api/v1` contract. Use the UI for rapid situational awareness and authoring; use the CLI or API when repeatability or machine-readable output matters.

This section covers:

- [Nodes](./nodes/): discovered versus declared inventory and control-plane evidence.
- [Shows](./shows/): revisioned show objects and activation.
- [Surfaces](./surfaces/): authorable layout/output intent, with no renderer yet.
- [Assets](./assets/): uploads, targeting, synchronization, and readiness.
- [Actions and macros](./actions-and-macros/): reusable controls and asynchronous runs.

For a quick health check, start with the dashboard and node/FPP/Resolume pages. Treat stale or failed collection as missing evidence, not as a safe value to act on.
