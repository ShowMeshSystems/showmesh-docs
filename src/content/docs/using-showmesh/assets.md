---
title: Assets
description: Upload content, target it to nodes, and interpret synchronization readiness.
---

An **asset** is an exact file revision that ShowMesh can distribute to native nodes. The coordinator stores the uploaded bytes by content hash and records which show, sequence ID, media type, and target the file belongs to.

Assets answer “which bytes should this node have?” rather than “what should play now?” ShowMesh can synchronize and verify the file's hash, but the asset record does not define a schedule, playlist, surface, or playback command.

## Identity and targeting

Each current asset is identified by its show, sequence ID, target kind, and target. Uploading different bytes for the same identity supersedes the previous current asset while retaining the older record in history.

- A **show-targeted** asset is expected on every declared node when that show is active.
- A **node-targeted** asset is expected only on the named node.

The sequence ID is a logical name used to group the file within a show; it is not proof that a playback engine has imported or recognized it. The accepted media types are `fseq`, `audio`, and `media`.

## Upload and inspect

Use the UI or CLI. The CLI requires all upload metadata:

```sh
showmeshctl assets upload \
  --show <show-id> \
  --sequence <sequence-id> \
  --media-type fseq \
  --target-kind show \
  --file ./sequence.fseq

showmeshctl assets list --show <show-id>
showmeshctl assets manifest --require-ready
```

Use `--target-kind node --target <node-id>` for one node, or `--target-kind show` for every declared node participating in the show. Uploads require `asset:write`.

## How synchronization works

The coordinator builds each declared node's desired manifest from the active show's current show-targeted assets plus current assets targeted specifically to that node. It compares that desired set with the inventory the agent publishes. Agents receive `asset.fetch` commands, download bytes from the coordinator, verify the SHA-256 content hash, place the file in their asset directory, and publish a new inventory.

When reads are closed, an agent needs `SHOWMESH_AGENT_API_TOKEN` to fetch content. It is deliberately separate from the retired `SHOWMESH_API_TOKEN` variable.

## What `ready` means

Ready means the node reported the expected asset content hash. It does not prove that a playback engine loaded, decoded, or can present the file.

If readiness does not converge, check node control-plane state, the agent's coordinator URL/settings, API token when reads are closed, filesystem permissions/capacity, and the agent log.
