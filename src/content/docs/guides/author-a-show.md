---
title: Author a Show
description: Create a Show, select participating integrations, and build its content and operating configuration.
pageType: procedure
maturity: experimental-active
---

Use the Show workspace to create one production's content, automation, and operating-night configuration.

## Before you start

You need an administrator credential. Configure the required nodes and integrations first.

## 1. Create the Show

Open **Shows**, choose **New Show**, and create a stable ID, label, and notes. Related Cues, Playlists, assets, actions, macros, and Night Sessions reference this ID.

CLI equivalent:

```sh
showmeshctl show set --help
showmeshctl show get <show-id>
```

## 2. Select participating instances

Select the FPP and Resolume instances used by this Show. Leave participation unrecorded while it is undecided; an empty list means the Show deliberately uses none.

```sh
showmeshctl show participation get <show-id>
showmeshctl show participation set --help
```

Readiness uses this selection to identify the required instances.

## 3. Activate the Show for authoring

```sh
showmeshctl show activate <show-id>
showmeshctl show active
```

Activation selects the current Show configuration. Use current runs for playback evidence.

## 4. Add Playlists and media playlists

In **Playlists**, create FPP- or ShowMesh-audio-backed Cue Playlists. Create a media playlist when you need a reusable local-audio bed. An FPP Playlist must bind to its imported definition.

## 5. Add Cues

In **Cues**, define render, audio, LTC, or announcement output. Select every audio target needed for multi-node playback; LTC remains single-node. Use direct activation only for a deliberate test or operator-triggered Cue.

## 6. Add assets

In **Assets**, upload content and assign it to the Show and target nodes. Confirm the manifest reports the required assets ready.

## 7. Configure presentation and automation

Use **Presentation** for presentation settings. Use **Automation** for FPP, Resolume, MQTT, or audio actions and ordered macros. Check bindings before invoking an action or adding it to a Night Session.

## 8. Configure the Night Session

In **Night Session**, select Show and resting Playlists, background audio, Transition Steps, announcements, site-control actions, and interlocks. Calendar scheduling stays in FPP.

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

If a write fails validation, fix the named object or binding before continuing. Do not bypass revision protection or treat an incomplete Show as ready.
