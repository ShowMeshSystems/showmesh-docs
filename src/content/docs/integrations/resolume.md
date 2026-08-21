---
title: Resolume Arena
description: Connect one Arena instance, import its composition identity, and operate the supported evidence-confirmed actions.
pageType: integration
maturity: experimental-testing
complexity: advanced
---

ShowMesh integrates with **Resolume Arena** through its REST API, WebSocket change signal, and polling fallback. It supports one configured Arena instance today. Arena remains the authority for its own composition, source routing, projection mapping, preferences, and process lifetime.

## 1. Prepare Arena and its network path

On the Arena host, enable the Webserver/API and record the port it is listening on. From the coordinator network, confirm that the API URL is reachable before configuring ShowMesh.

The coordinator needs an HTTP(S) base URL with no embedded credentials, for example `http://arena-host:8080`. Put Arena and the coordinator on the trusted show-management network; the integration does not add a separate authentication layer around Arena's API.

## 2. Add the instance to ShowMesh

Use the Operator UI configuration page or an administrator-scoped CLI token:

```sh
showmeshctl resolume instance set \
  --id arena-main \
  --url http://arena-host:8080
```

The setting is store-backed and normally takes effect within about ten seconds; it does not require a coordinator restart. Check it with:

```sh
showmeshctl resolume instance list
showmeshctl resolume status
```

If the coordinator still has `SHOWMESH_RESOLUME_URL` or `SHOWMESH_RESOLUME_ID` in its environment, remove them only after startup reports that they **match the active store-backed instance exactly**. A deferred-migration response means the variables are still the only copy; do **not** remove them. Repair the coordinator data volume (such as a full, read-only, or damaged volume) and restart so migration can retry.

If startup refuses because the environment and stored instance disagree, do not remove the variables merely to start the coordinator. Compare the two values and choose deliberately: retain the confirmed store value, or record the intended environment value, intentionally move to store-backed configuration, and then write that recorded value through `resolume instance set`. Restart once after a deliberate removal. The legacy values block edits so there is one authoritative configuration source.

## 3. Import composition identity

In the ShowMesh Resolume configuration surface, upload the exact operator-owned `.avc` composition file that Arena is intended to run. ShowMesh parses the file into stable deck, layer, column, and clip identities.

This import is an identity map only. ShowMesh does **not** upload that composition to Arena, open it in Arena, inspect Arena's `/composition` endpoint as a substitute, or modify the running composition. Keep Arena's actual composition deployment under the operator's normal change-control process.

Then inspect what ShowMesh imported:

```sh
showmeshctl resolume composition show
showmeshctl resolume action list
```

Resolve duplicate names in the `.avc` composition before relying on them in actions. Operators use names, not Arena object IDs, when invoking the supported action vocabulary.

## 4. Test one low-impact action

First confirm current state and choose a reversible target on a test composition or test layer. Then use the UI, an action/macro, or `showmeshctl resolume action ...` to exercise one supported operation:

- launch a clip or column;
- clear a layer;
- select a deck;
- blackout tracked layers;
- set layer bypass;
- set a layer master value.

The action path requires the `resolume:action` scope and reports the observed outcome, not just that an HTTP request was sent. Follow [Test a Control Safely](../../guides/test-a-control/) for how to interpret a command that is accepted but not confirmed.

## 5. Bring in a video surface or LTC deliberately

For a ShowMesh render node, configure the NDI source and mapping in Arena after the node advertises the source. ShowMesh does not create that routing for you.

:::caution[Commission LTC separately]
The physical LTC path and Arena's behavior when LTC is missing or restored have not been verified for the reference installation. Do not infer synchronization from the audio node reporting that it generated timecode.
:::

Use [Set Up a Video Node](../../guides/set-up-a-video-node/) for the sender side. Treat LTC configuration as a separately commissioned physical audio path, not proof that audio is synchronized merely because the node says it generated timecode.

## Recovery boundary

ShowMesh can record known Arena state and offer manual or opt-in automatic recovery after a detected restart. Test recovery with the intended composition on a non-show machine first. The settle delay is a code default, not a measured guarantee for every Arena host.

ShowMesh does not change Arena preferences, load a composition, manage shortcuts or presets, or start, stop, restart, or signal the Arena process. Those remain operator responsibilities and manual fallbacks.
