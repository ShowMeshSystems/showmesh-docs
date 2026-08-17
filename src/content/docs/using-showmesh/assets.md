---
title: Assets
description: Upload content, target it to nodes, and interpret synchronization readiness.
---

The coordinator stores uploaded bytes by content hash and keeps metadata for each asset. Assets belong to a show and sequence, include a media type, and target either every declared node or one specific node.

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

The accepted media types are `fseq`, `audio`, and `media`. Use `--target-kind node --target <node-id>` for one node, or `--target-kind show` for every declared node participating in the show. Uploads require `asset:write`.

## How synchronization works

The coordinator compares the active show's desired asset set with asset inventories published by declared agents. Agents receive `asset.fetch` commands, download bytes from the coordinator, verify the SHA-256 content hash, place the file in their asset directory, and publish a new inventory.

When reads are closed, an agent needs `SHOWMESH_AGENT_API_TOKEN` to fetch content. It is deliberately separate from the retired `SHOWMESH_API_TOKEN` variable.

## What `ready` means

Ready means the node reported the expected asset content hash. It does not prove that a playback engine loaded, decoded, or can present the file.

If readiness does not converge, check node control-plane state, the agent's coordinator URL/settings, API token when reads are closed, filesystem permissions/capacity, and the agent log.
