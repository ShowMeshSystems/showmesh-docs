---
title: Guides
description: Task-focused paths for common ShowMesh operations in the current development build.
pageType: landing
maturity: experimental-testing
---

These guides begin with the result an operator needs and stop at the boundary the current implementation can verify.

- [Check show health](./check-show-health/): prioritize missing and stale evidence before making changes.
- [Author a Show](./author-a-show/): create a Show, select participating instances, and build playlists, Cues, assets, automation, and a Night Session.
- [Run a Show Night](./run-a-show-night/): prepare, verify, operate, close, and recover one operating night.
- [Install a native node](./add-a-node/): install a released agent with a one-time enrollment code and verify the agent appears.
- [Set up a video node](./set-up-a-video-node/): set up the experimental FSEQ-to-NDI path, prove output with the node-local diagnostic surface, and inspect the result.
- [Set up an audio node](./set-up-an-audio-node/): configure routes, PipeWire, node clocks, output latency, scheduled starts, and alignment evidence.
- [Handle a weather delay](./handle-a-weather-delay/): configure alerts, hold or cancel a night, and resume deliberately.
- [Upgrade and restore ShowMesh](./upgrade-and-restore-showmesh/): check component versions, back up, upgrade, and recover an installation.
- [Recover after coordinator loss](./recover-after-coordinator-loss/): inspect prepared fallback playback and return control safely.
- [Set up ShowMesh Companion](/integrations/showmesh-companion/): configure local supervision, timecode observation, and report collection.
- [Test a control safely](./test-a-control/): run one FPP or Resolume primitive, know the emergency-stop levels, and interpret uncertain confirmation.

For full installation, start with [Installation](/getting-started/installation/). For subsystem behavior, use the relevant page under **Using ShowMesh** or **Integrations**.

Administration and recovery references are available under [Settings](/using-showmesh/settings/), [Access and permissions](/using-showmesh/access-and-permissions/), and [Troubleshooting](/troubleshooting/).
