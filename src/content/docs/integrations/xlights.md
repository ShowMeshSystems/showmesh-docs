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

`SHOWMESH_AGENT_API_TOKEN` is **required** on any node that will register an xLights upload. Enrollment supplies a `node` role token with `asset:write`. Without that scope, the node still assembles, hashes, and holds the upload but cannot register it with the coordinator.

The listener binds on `SHOWMESH_FPPCONNECT_LISTEN_ADDR` (default `:80`, matching where xLights itself expects to find FPP Connect hosts). Binding a privileged port requires the `CAP_NET_BIND_SERVICE` capability, which the packaged systemd unit grants explicitly. A node that cannot bind the listener still renders and still answers other agent traffic; check node status for the bind failure.

## What is configured

The revisioned `fppconnect.settings` object controls whether ingestion is enabled and its storage limits. It is managed through the API or these CLI commands:

```sh
showmeshctl fppconnect settings get
showmeshctl fppconnect settings set --help
showmeshctl fppconnect status <node-id>
```

`status` reports only the most recently pushed channel-range outcome for one node. It does not report uploads. A range may be formatted, empty because no surface is configured, or dropped with a reason. Treat a dropped range as an explicit configuration problem, not an invitation to guess at a replacement mapping.

The defaults are ingestion enabled, 2 GiB per file, and 20 GiB for the whole node asset directory. A file over the per-file limit, or an upload that would pass the directory limit, is refused.

## Set up xLights

Each render node is its own FPP Connect target, so repeat these steps for every node you upload to.

1. Confirm the node's agent is running and the listener is bound. The node must be reachable from the xLights machine on port 80 (see above).
2. In xLights, open the FPP Connect dialog and pick the node. It identifies itself as an FPP player (version 9.5.0) so the dialog offers the playlist list and sparse sequence rendering.
3. Pick the ShowMesh Show in the playlist field. The node lists its Show names there, so the playlist you pick is the Show the upload binds to.
4. Leave the Media checkbox off unless you also want the sequence's music or video sent.
5. Upload.

If you pick no playlist, the upload binds to the Show that is currently active on the coordinator. If a typed name matches no Show, or more than one, or no Show is active, the node keeps the file, registers nothing, and records it as unbound. It never guesses.

## Channel ranges

The node tells xLights which channels it renders, so xLights sends a sparse sequence holding only those channels. The ranges come from the channel ranges of the Show's surfaces on that node. ShowMesh counts channels from 1; xLights counts from 0 and writes an inclusive end, so a surface starting at channel 1025 with 512 channels is advertised as `1024-1535`. Several surfaces are advertised as a comma-separated list in start order.

A node with no surface configured advertises no range. A range is also dropped when its list is too long for the discovery packet, or when it is a single channel starting at channel 1, which xLights ignores. `showmeshctl fppconnect status <node-id>` shows which of these happened.

## What the node accepts

The node accepts files only into the `sequences`, `music`, and `videos` folders. Any other folder, including `effects`, is refused, and so is a file name that is not a plain name.

| What xLights sends | Folder | What the node does today |
| --- | --- | --- |
| Sequence (FSEQ) | `sequences` | Holds the file, then registers it as a node-targeted FSEQ asset through the assets API. |
| Music (Media checkbox) | `music` | Holds the file. It is not registered. |
| Video (Media checkbox) | `videos` | Holds the file. It is not registered. |

Music registration is changing; this page describes today's behavior.

## Where uploads land

Files are written under the node's asset directory (`SHOWMESH_ASSET_DIR`, `/var/lib/showmesh/assets` by default):

- `fppconnect-uploads/held/<folder>/<file name>` holds each completed upload. A partial upload sits in `fppconnect-uploads/staging/` and is discarded if the agent restarts, so an interrupted upload registers nothing.
- `fppconnect-uploads/index.json` records each held file, whether it is bound to a Show, and its registration state.

The coordinator does not show held files or their registration state. Read `index.json` on the node for that.

## How to tell it worked

A sequence upload worked when both of these are true:

1. In `index.json`, the file's entry has `registrationState` of `registered`.
2. `showmeshctl assets list --node <node-id>` lists a current FSEQ asset for that file name's sequence.

`skipped` is the expected state for a music or video file. `pending` means the node is retrying, and `failed` carries a `registrationReason`. An entry that is not bound to a Show has no registration state and is never registered; its `unboundReason` says why. See [FPP Connect upload is accepted but never registers](../../troubleshooting/nodes/) for the usual causes.

A registered asset confirms only that step. It does not verify FPP deployment or rendered output.

## Boundaries that remain open

- Supported xLights versions, FPP Connect compatibility, and an end-to-end deployed upload path are not yet documented as verified.
- Manual ShowMesh asset upload remains a valid fallback for node-local FSEQ content.
- FPP remains responsible for schedule, playlist order, and playhead; the render node follows the local FPP timeline after content is available.

xLights calls the listener's models endpoint during every ordinary upload, before any file transfer starts, whether or not you use the xLights models feature. The listener answers that call, so an otherwise successful upload does not surface as an error in xLights on its account. That behavior was observed against a real xLights client; it does not establish a verified end-to-end xLights-to-FPP path.
