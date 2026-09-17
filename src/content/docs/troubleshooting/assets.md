---
title: Assets not ready
description: Find which node, sequence, or inventory report prevents the active show from being ready.
pageType: troubleshooting
---

## Symptom: the asset manifest is not ready

Preserve the manifest result before restarting a node or changing configuration:

```sh
showmeshctl assets manifest
showmeshctl assets manifest --require-ready
```

The manifest compares what each node must hold for the active show with the node's reported inventory. Readiness is three-valued:

- `ready`: the required content is present and matches.
- `not_ready`: current evidence names a missing or mismatched asset.
- `unknown`: current inventory evidence is absent or stale.

## Immediate checks

1. Confirm the intended show is active with `showmeshctl show active`.
2. Filter the manifest by node to isolate the failure.
3. Confirm the node agent is online and publishing inventory.
4. Confirm the coordinator's asset content base URL is reachable from the node.
5. If reads are closed, confirm the node has `SHOWMESH_AGENT_API_TOKEN`.
6. Check free space and write permissions for the node's `SHOWMESH_ASSET_DIR`.

Request a fresh inventory when the node is reachable but the coordinator is holding stale evidence:

```sh
showmeshctl assets resync <node-id>
```

The response reports what the resync request actually did. Recheck the manifest; acceptance is not a ready inventory.

Inspect and remove only content no resolved Cue still needs:

```sh
showmeshctl assets unused <node-id>
showmeshctl assets remove <node-id> <content-hash>
```

Removal is refused when a Cue still references the hash. To roll back an upload, re-upload or reselect the intended content revision and confirm delivery; do not edit node files behind the agent.

For multi-node Cue or Night audio, every target must hold the required asset. One ready node does not make the group ready.

Asset sync runs after upload and on a timer; playback never reads from the coordinator asset store. Do not start a show while `--require-ready` reports exit `20` (known not ready) or `21` (unknown). Unknown is not a weaker form of ready.

## Verify recovery

Rerun `showmeshctl assets manifest --require-ready`. Recovery is confirmed only when it returns exit `0` and the intended node and asset hashes are ready. A restarted agent or successful download request is not sufficient by itself.
