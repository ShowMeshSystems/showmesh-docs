---
title: Assets
description: Upload content, target it to nodes, and interpret synchronization readiness.
pageType: concept
maturity: available
---

An **asset** is an exact file revision that ShowMesh can distribute to native nodes. The coordinator stores the uploaded bytes by content hash and records which show, sequence ID, media type, and target the file belongs to.

Assets answer “which bytes must this node hold?” rather than “what plays now?” ShowMesh can synchronize and verify the file's hash, but the asset record does not define a schedule, playlist, surface, or playback command.

## Identity and targeting

Each current asset is identified by its show, sequence ID, target kind, and target. Uploading different bytes for the same identity supersedes the previous current asset while retaining the older record in history.

- A **show-targeted** asset is expected on every declared node when that show is active.
- A **node-targeted** asset is expected only on the named node.

The sequence ID is a logical name used to group the file within a show; it is not proof that a playback engine has imported or recognized it. The accepted media types are `fseq`, `audio`, and `media`.

## Upload and inspect

Use the global Assets page for installation-wide inspection or a Show workspace's Assets tab for Show-scoped authoring. Both expose current versions and delivery evidence. The CLI requires all upload metadata:

```sh
showmeshctl assets upload \
  --show <show-id> \
  --sequence <sequence-id> \
  --media-type fseq \
  --target-kind show \
  --file ./sequence.fseq

showmeshctl assets list --show <show-id>
showmeshctl assets get <asset-id>
showmeshctl assets manifest --require-ready
```

Use `--target-kind node --target <node-id>` for one node, or `--target-kind show` for every declared node participating in the show. Uploads require `asset:write`.

## How synchronization works

The coordinator builds each declared node's desired manifest from the active show's current show-targeted assets plus current assets targeted specifically to that node. It compares that desired set with the inventory the agent publishes. Agents receive `asset.fetch` commands, download bytes from the coordinator, verify the SHA-256 content hash, place the file in their asset directory, and publish a new inventory.

When reads are closed, an agent needs `SHOWMESH_AGENT_API_TOKEN` to fetch content. It is deliberately separate from the retired `SHOWMESH_API_TOKEN` variable.

## Versions, resync, and removal

Uploading different bytes for the same logical identity creates a new current asset while retaining older metadata. Rollback is a deliberate new selection or upload of the intended bytes; do not edit the coordinator or node asset stores by hand.

Request fresh node evidence and inspect safe removal candidates with:

```sh
showmeshctl assets resync <node-id>
showmeshctl assets unused <node-id>
showmeshctl assets remove <node-id> <content-hash>
```

Removal is refused while a resolved Cue catalog references the content. A resync request is not a ready manifest; wait for fresh inventory evidence.

For a Cue, announcement, or Night bed targeting several audio nodes, every target resolves and receives the required asset independently. Fallback resolution can select the installation's program/LTC node only where the object omitted targets; it never hides a named target that lacks content.

## What `ready` means

Ready means the node reported the expected asset content hash. It does not prove that a playback engine loaded, decoded, or can present the file.

If readiness does not converge, check node control-plane state, the agent's coordinator URL/settings, API token when reads are closed, filesystem permissions/capacity, and the agent log.
