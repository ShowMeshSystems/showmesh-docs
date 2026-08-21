---
title: Troubleshooting
description: Restore visibility first, then isolate the failing dependency without guessing.
pageType: landing
---

Start here when ShowMesh is not behaving as expected. The shortest safe path is to establish whether the coordinator is alive, whether it is ready, and what evidence it currently holds.

## First 90 seconds

1. Check liveness: `curl -i http://localhost:8080/healthz`. A running HTTP process returns `200` and `ok`.
2. Check readiness: `curl -i http://localhost:8080/readyz`. `200` means both the MQTT connection and SQLite store are ready. `503` includes a JSON `reason`; it does **not** mean the HTTP process is dead.
3. Check client compatibility: `showmeshctl version`.
4. Capture the current system view: `showmeshctl snapshot --output json`.
5. If you have a credential, identify it: `showmeshctl session`.

:::caution
Do not restart everything before capturing the snapshot and the readiness response. Restarting can erase the evidence that identifies the original failure.
:::

## Find the symptom

- [Coordinator unavailable or not ready](./coordinator/)
- [A node is missing or stale](./nodes/)
- [FPP is unreachable or a command is unconfirmed](./fpp/)
- [A macro or action did not complete](./actions/)
- [Assets are not ready](./assets/)
- [Logs, health, events, and evidence](./diagnostics/)

## What belongs here later

More symptom pages will be added as rendering, audio, timecode, and additional device providers become real runtime capabilities. Their architecture is not treated as a troubleshooting surface until code exists.
