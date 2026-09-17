---
title: Author a Show
description: Create a Show, select participating integrations, and build its content and operating configuration.
pageType: procedure
maturity: experimental-active
---

Use the Show workspace to keep one production's content, automation, and operating-night configuration together without hiding their separate revision histories.

## Before you start

You need an administrator credential for configuration and asset writes. Configure or discover required nodes and integrations first; a Show can reference only objects the coordinator can validate.

## 1. Create the Show

Open **Shows**, choose **New Show**, and create a stable Show ID, label, and notes. The ID becomes the namespace referenced by Cues, playlists, assets, actions, macros, and Night Sessions.

CLI equivalent:

```sh
showmeshctl show set --help
showmeshctl show get <show-id>
```

## 2. Select participating instances

Record which FPP and Resolume instances belong to this Show. Participation has three meaningful states: never recorded, explicitly empty, and populated. Do not use an empty list when you mean “not decided yet.”

```sh
showmeshctl show participation get <show-id>
showmeshctl show participation set --help
```

Readiness and attention views use this selection to distinguish tonight's required instances from other configured systems.

## 3. Activate the Show for authoring

```sh
showmeshctl show activate <show-id>
showmeshctl show active
```

Activation selects the current Show configuration. It does not prove any runner is playing it; use current runs for playback evidence.

## 4. Add Playlists and media playlists

In the Show workspace, open **Playlists**. Create FPP- or ShowMesh-audio-backed Cue playlists and, when needed, local-audio media playlists for reusable beds.

For an FPP-backed Playlist, import or republish its canonical definition and bind the exact instance, name, hash, section, and position evidence.

## 5. Add Cues

Open **Cues** and define render, audio, LTC, or announcement outputs. Use plural audio and announcement target lists for multi-node playback; LTC remains singular.

Validate that each target audio node and asset exists. Use direct activation only for a deliberate test or operator-triggered Cue.

## 6. Add assets

Open **Assets** to upload exact content revisions and target them to the Show and nodes. Confirm the manifest reports required assets ready before treating upload success as delivery success.

## 7. Configure presentation and automation

Use **Presentation** for Show-facing presentation configuration. Use **Automation** to author FPP, Resolume, MQTT, or audio actions and ordered macros. Check bindings before invoking or placing actions into a Night Session.

## 8. Configure the Night Session

Open **Night Session** and select Show/resting Playlists, background audio or a media playlist, Transition Steps, announcements, site-control actions, and interlocks. Calendar scheduling stays in FPP.

## 9. Review revisions and readiness

Before showtime:

- inspect the active Show and participation selection;
- run FPP Playlist readiness;
- confirm Cue catalogs are deployed and acknowledged;
- confirm every target node has required assets;
- inspect node clock and alignment evidence;
- check action bindings;
- run the Show Night preparation/readiness procedure.

Use [Run a Show Night](../run-a-show-night/) for the operator sequence.
