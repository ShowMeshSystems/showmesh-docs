---
title: SMPTE / LTC
description: Planned timecode integration and the current absence of a runtime control path.
---

**Status: Planned**

:::note[Planned]
The current build has no SMPTE/LTC input, decoder, clock-domain runtime, timecode-following playback, or operator controls.
:::

SMPTE/LTC appears in ShowMesh's intended architecture because coordinated media systems often need a shared timing reference. That design intent is not runnable functionality.

For now, keep timecode routing and synchronization inside the systems that already implement it, such as FPP or Resolume workflows. ShowMesh can observe and control supported device state, but it cannot verify or enforce timecode lock.

Future documentation belongs here only after code and tests establish supported frame rates, drop-frame behavior, signal-loss behavior, clock ownership, and recovery semantics.
