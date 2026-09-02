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

The listener is an unauthenticated compatibility shim for xLights, not part of the public ShowMesh API: it accepts no ShowMesh credential, serves only the paths xLights itself calls, and is absent from the OpenAPI description by intent. Run it only on an isolated show network, the same trust boundary FPP itself assumes.

## Required credential for upload registration

`SHOWMESH_AGENT_API_TOKEN` is **required** on any node that will ever receive an xLights upload. The listener binds unconditionally on every node regardless of this setting, so any node can receive an upload; without a token that carries `asset:write` (only the admin role carries that scope in the documented build), the node still assembles and holds the upload but never registers it with the coordinator. That upload is retried indefinitely rather than failing outright, and nothing is visible to the operator except a field in the node's own `assets/fppconnect-uploads/index.json`. Set the token and restart the agent to let a stalled upload register on its next retry; do not expect a coordinator-side alert.

The listener binds on `SHOWMESH_FPPCONNECT_LISTEN_ADDR` (default `:80`, matching where xLights itself expects to find FPP Connect hosts). Binding a privileged port requires the `CAP_NET_BIND_SERVICE` capability, which the packaged systemd unit grants explicitly. A node that cannot bind the listener still renders and still answers other agent traffic; check node status for the bind failure.

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

xLights calls the listener's models endpoint during every ordinary upload, before any file transfer starts, whether or not you use the xLights models feature. The listener answers that call, so an otherwise successful upload does not surface as an error in xLights on its account. That behavior was observed against a real xLights client; it does not establish a verified end-to-end xLights-to-FPP path.
