---
title: xLights FPP Connect
description: Experimental FPP Connect ingestion for node-targeted sequence content.
pageType: integration
maturity: experimental-testing
---

:::caution[Experimental development capability]
Current source includes an FPP Connect listener on native nodes and revisioned coordinator settings. It is not yet a supported production deployment path: no end-to-end xLights-to-FPP installation result or real-show commissioning is established here.
:::

ShowMesh can accept FPP Connect sequence content for a native render node. The node remains its own xLights upload target; ShowMesh does not become FPP's scheduler, playlist editor, or playback authority.

## What is configured

The revisioned `fppconnect.settings` object controls whether ingestion is enabled and its storage limits. It is managed through the API or these CLI commands:

```sh
showmeshctl fppconnect settings get
showmeshctl fppconnect settings set --help
showmeshctl fppconnect status <node-id>
```

`status` reports the most recently pushed channel-range outcome for one node. A range may be formatted, empty because no surface is configured, or dropped with a reason. Treat a dropped range as an explicit configuration problem, not an invitation to guess at a replacement mapping.

## What to inspect

After a controlled development upload, inspect `fppconnect status` for every target node and confirm that its reported outcome matches the intended surface assignment. A formatted result confirms only the recorded node outcome; it does not verify FPP deployment or rendered output.

## Boundaries that remain open

- Supported xLights versions, FPP Connect compatibility, and an end-to-end deployed upload path are not yet documented as verified.
- Manual ShowMesh asset upload remains a valid fallback for node-local FSEQ content.
- FPP remains responsible for schedule, playlist order, and playhead; the render node follows the local FPP timeline after content is available.
