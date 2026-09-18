---
title: xLights FPP Connect
description: Experimental FPP Connect ingestion for node-targeted sequence content.
pageType: integration
maturity: experimental-testing
---

:::caution[Experimental development capability]
Use FPP Connect only on an isolated show network and test the complete upload path before relying on it. Manual ShowMesh asset upload remains available for node-local FSEQ content.
:::

ShowMesh can accept FPP Connect sequence content for a native render node. The node remains its own xLights upload target; ShowMesh does not become FPP's scheduler, playlist editor, or playback authority.

The listener is an unauthenticated compatibility shim for xLights, not part of the public ShowMesh API: it accepts no ShowMesh credential, serves only the paths xLights itself calls, and is absent from the OpenAPI description by intent. Run it only on an isolated show network, the same trust boundary FPP itself assumes.

## Required credential for upload registration

`SHOWMESH_AGENT_API_TOKEN` is **required** on any node that will register an xLights upload. Without `asset:write` (currently admin-only), the node still assembles, hashes, and holds the upload but cannot register it with the coordinator. Registration state, asset ID, reason, problem type, held-file count, and event count are reported through node render evidence and `showmeshctl fppconnect status`; the local `assets/fppconnect-uploads/index.json` remains a deeper host-side record.

The listener binds on `SHOWMESH_FPPCONNECT_LISTEN_ADDR` (default `:80`, matching where xLights itself expects to find FPP Connect hosts). Binding a privileged port requires the `CAP_NET_BIND_SERVICE` capability, which the packaged systemd unit grants explicitly. A node that cannot bind the listener still renders and still answers other agent traffic; check node status for the bind failure.

## Configure ingestion

The revisioned `fppconnect.settings` object controls whether ingestion is enabled and its storage limits. It is managed through the API or these CLI commands:

```sh
showmeshctl fppconnect settings get
showmeshctl fppconnect settings set --help
showmeshctl fppconnect status <node-id>
```

`status` reports the most recently pushed channel-range outcome for one node. A range may be formatted, empty because no surface is configured, or dropped with a reason. Treat a dropped range as an explicit configuration problem, not an invitation to guess at a replacement mapping.

## Check an upload

An upload binds to one Show. When the request does not identify a Show, the agent resolves the active Show only when that choice is unambiguous; otherwise it holds the upload and reports why it cannot register it.

Sequences register automatically through the assets API. Music and video files remain held for manual registration rather than being silently assigned to a Show or target. After a controlled upload, inspect `fppconnect status` and the node's render report for every target. A formatted channel range or registered asset confirms only that recorded step; it does not verify FPP deployment or rendered output.

FPP remains responsible for schedule, playlist order, and playhead. The render node follows the local FPP timeline after content is available.
