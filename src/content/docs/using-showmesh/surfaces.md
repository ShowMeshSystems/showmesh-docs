---
title: Surfaces
description: Author surface geometry and output intent while understanding the missing renderer boundary.
---

A surface belongs to a show and records:

- its assigned node;
- a start channel and channel count;
- width, height, and `rgb` or `rgbw` pixel format;
- frame rate from 1 through 120;
- an intended `ndi` source name or `hdmi` display.

The UI and CLI can create, list, inspect, and revise these objects:

```sh
showmeshctl surface list --show <show-id>
showmeshctl surface get <surface-id>
showmeshctl surface revisions <surface-id>
```

## Important current limit

:::caution[Configuration only]
No runtime in this snapshot reads a surface object and renders pixels. Selecting `ndi` or `hdmi` validates and stores output intent; it does not create an NDI source or drive a display.
:::

Surface configuration is still useful for stabilizing IDs, assignments, geometry, and channel ownership before the renderer lands. Do not use its presence as an operational readiness signal.

