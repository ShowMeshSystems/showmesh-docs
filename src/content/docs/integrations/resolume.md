---
title: Resolume Arena
description: Connect one Arena instance, import its composition identity, and operate the supported evidence-confirmed actions.
pageType: integration
maturity: experimental-testing
complexity: advanced
---

ShowMesh integrates with **Resolume Arena** through its REST API, WebSocket change signal, and polling fallback, and sends layer fades over OSC. An instance can instead be set to **OSC only**, where ShowMesh sends commands and never reads Arena. ShowMesh supports one configured Arena instance. Arena remains the authority for its own composition, source routing, projection mapping, preferences, and process lifetime.

## 1. Prepare Arena and its network path

On the Arena host, enable the Webserver/API and record the port it is listening on. From the coordinator network, confirm that the API URL is reachable before configuring ShowMesh.

To use layer fades or OSC-only control, also turn on Arena's OSC input and record its port. Arena's default is 7000. ShowMesh sends OSC to the host in the instance URL.

The coordinator needs an HTTP(S) base URL with no embedded credentials, for example `http://arena-host:8080`. Put Arena and the coordinator on the trusted show-management network; the integration does not add a separate authentication layer around Arena's API.

## 2. Add the instance to ShowMesh

In the Operator UI, open **Settings → Connections** and fill in the **Resolume** section. Or use an administrator-scoped CLI token:

```sh
showmeshctl resolume instance set \
  --id arena-main \
  --url http://arena-host:8080 \
  --osc-port 7000
```

`--osc-port` is Arena's OSC input port on the URL's host; leave it out to use 7000. `--control` chooses the control mode, described in [Choose a control mode](#choose-a-control-mode).

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

First confirm current state and choose a reversible target on a test composition or test layer. Then use the Operator UI, an action or macro, or `showmeshctl resolume action ...` to exercise one supported operation:

- launch a clip or column;
- clear a layer;
- select a deck;
- blackout tracked layers;
- set layer bypass;
- set a layer master value;
- fade a layer, described in [Fade a layer](#fade-a-layer).

The action path requires the `resolume:action` scope. In the **REST and OSC** control mode it reports the observed outcome, not only that an HTTP request was sent. Layer fades and every action in **OSC only** mode are reported as not confirmed, because Arena does not answer OSC. Follow [Test a control safely](../../guides/test-a-control/) for how to interpret a command that is accepted but not confirmed.

## 5. Bring in a video surface or LTC deliberately

For a ShowMesh render node, configure the NDI source and mapping in Arena after the node advertises the source. ShowMesh does not create that routing for you.

Use [Set up a video node](../../guides/set-up-a-video-node/) for the sender side. Configure LTC separately from the NDI source and mapping; see [SMPTE / LTC](../smpte-ltc/) for timecode behavior.

## Choose a control mode

The **Control** setting in the Resolume section has two modes.

**REST and OSC** is the default. ShowMesh reads Arena's state, confirms actions from that state, checks readiness, and can restore Arena after a restart. Layer fades go over OSC.

**OSC only** (`--control osc`) sends every action to Arena over OSC and never reads Arena. Use it when the REST API is unavailable or unwanted. In this mode:

- Nothing is confirmed. A sent action reads "Sent to Resolume over OSC. Resolume does not answer OSC, so ShowMesh cannot check it. Check Arena on its own screen."
- Status, Monitor, and health show the instance as not read. Night readiness lists it as not verifiable instead of failing.
- Automatic and manual recovery are unavailable. Restore Arena by hand.
- Actions find layers, columns, and clips by name in the uploaded composition. Upload the composition before relying on any action except blackout. Names that are not in it are refused, and nothing is sent.
- Launching a clip or column selects its deck first, which changes Arena's selected deck.
- Persistent clips cannot be launched. Launch them in Arena.
- Blackout clears every layer in the uploaded composition. With no composition uploaded, it sends Arena's disconnect-all command.
- Emergency Stop and weather delay send their blackout over OSC and count it as sent. Check Arena's output on its own screen.

The instance URL is still required in OSC-only mode because it supplies the OSC host.

:::caution[OSC-only results are never confirmed]
A typo in the OSC port, or Arena's OSC input being off, can look like a successful send. After changing the OSC settings, run one low-impact action and watch Arena's screen.
:::

## Fade a layer

A layer fade changes a layer's master level over a set time. Add it as a Resolume action with a layer name, a target percent from 0 to 100, and an optional duration in milliseconds. A duration of 0 sets the level at once.

```sh
showmeshctl resolume action fade-layer --duration-ms 3000 "<layer-name>" <target-percent>
```

Put flags before the layer name and target percent.

The coordinator performs the fade by sending the layer's master level over OSC about 25 times a second. A newer fade on the same layer replaces the running one and starts from the last level sent. In **REST and OSC** mode, ShowMesh reads the layer's current level first and refuses the fade if it cannot. In **OSC only** mode, the fade starts from the last level ShowMesh sent, or from full.

In a Show Night transition step, a layer fade without its own duration uses the step's fade time, then the night's lights fade time for that transition. Fade out night replays the enter-show steps, so a layer fade there also runs when the night fades out.

A fade sent to the wrong port or to an Arena with its OSC input off is still reported as sent. Confirm a new fade on Arena's screen.

## Recover after an Arena restart

ShowMesh can record known Arena state and offer manual or opt-in automatic recovery after a detected restart. Test recovery with the intended composition on a non-show machine first.

```sh
showmeshctl resolume recovery status
showmeshctl resolume recovery enable
showmeshctl resolume recovery disable
showmeshctl resolume recovery restore
showmeshctl resolume recovery revisions
```

The auto-restore toggle (`enable`/`disable`) is store-backed configuration and requires `config:write`. The settle delay the automatic gate waits after Arena becomes reachable again, before issuing anything beyond the liveness probe that noticed the return, is a separate coordinator setting: `SHOWMESH_RESOLUME_RECOVERY_SETTLE` (default 8 seconds, 0-60 seconds). It is not part of the `resolume.recovery` store-backed configuration and changing it requires a coordinator restart. `resolume recovery restore` runs the same restore on demand, without the settle wait, regardless of the toggle.

ShowMesh does not change Arena preferences, load a composition, manage shortcuts or presets, or start, stop, restart, or signal the Arena process. Those remain operator responsibilities and manual fallbacks. To launch Arena locally when its process disappears, configure [ShowMesh Companion](../showmesh-companion/). Keep local supervision distinct from coordinator-side composition restore.

## Show Mode and the WebSocket connection

ShowMesh holds its WebSocket connection to Arena open in Program Mode and closes it in Show Mode, reducing edit-time surface once a show is running. See [Show Mode](../../using-showmesh/show-mode/) for how the installation-wide mode is set and what else it changes.
