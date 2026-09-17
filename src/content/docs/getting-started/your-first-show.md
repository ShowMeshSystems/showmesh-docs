---
title: Build your first show
description: Build and operate a first ShowMesh production from the command line, from coordinator setup through FPP, Resolume, assets, and Show Night.
pageType: procedure
maturity: experimental-active
complexity: advanced
---

Use this guide to build a Show from the command line. For the Operator UI path, see [Author a Show](../../guides/author-a-show/). Check `showmeshctl version` and command-specific help before copying examples into scripts.

## Before you start

Complete [Install the coordinator](../installation/) first. You need:

- a healthy coordinator and MQTT broker, with `/readyz` returning success;
- a ShowMesh administrator token with the configuration, asset, node, FPP, Resolume, macro, and Show Night scopes used in this guide;
- one reachable FPP player and, if you use video, one reachable Resolume Arena instance;
- native agents for any render or audio nodes you plan to use; and
- the FSEQ, audio, and media files that belong to the production.

Build the CLI and point it at the coordinator. Keep the token in the environment rather than placing it in a shell history or process list:

```sh
cd showmesh
make build
export SHOWMESH_SERVER=http://<coordinator-host>:8080
export SHOWMESH_CTL_TOKEN='<issued token>'
./bin/showmeshctl version
./bin/showmeshctl session
```

The examples in this guide use `showmeshctl`. Use `./bin/showmeshctl` instead when the binary is not on your `PATH`.

## 1. Connect FPP

Create a file containing the full FPP endpoint list. `config set` replaces that list, so keep every FPP player you want ShowMesh to observe in the file.

```json
{
  "endpoints": [
    {
      "id": "fpp-main",
      "url": "http://fpp-main"
    }
  ]
}
```

Write it and inspect the configured player:

```sh
showmeshctl config set --file ./fpp-endpoints.json
showmeshctl config get
showmeshctl fpp
showmeshctl fpp fpp-main
```

### Confirm your playlist is observed

`showmeshctl fpp fpp-main` shows the collected Playlist and state. In the Operator UI, open **Monitor > Signals**, filter to **FPP**, and confirm a recent `fpp.playlist.name` observation. If it is missing or `not reported`, fix endpoint reachability before continuing.

Optionally configure FPP MQTT status collection. The FPP host mapping uses the ShowMesh endpoint ID on the left and the FPP MQTT host name on the right.

```sh
showmeshctl fpp-mqtt set \
  --broker-url tcp://<broker-host>:1883 \
  --username fpp \
  --password '<FPP publisher password>' \
  --topic-prefix falcon/player \
  --host fpp-main=<FPP MQTT host name>
showmeshctl fpp-mqtt get
```

Confirm collection before sending a control. Commands wait for new observation evidence; if a result is unconfirmed, inspect FPP before retrying. See [FPP](../../integrations/fpp/) for controls and recovery.

## 2. Connect Resolume Arena

Configure the one Arena instance, then upload the exact `.avc` composition file that Arena will use. The upload creates an identity map in ShowMesh; it does not load a composition into Arena.

```sh
showmeshctl resolume instance set \
  --id arena-main \
  --url http://arena-host:8080
showmeshctl resolume instance list
showmeshctl resolume composition upload ./MainShow.avc
showmeshctl resolume composition show
showmeshctl resolume status
showmeshctl resolume action list
```

Test a reversible Arena action before adding it to a macro:

```sh
showmeshctl resolume action select-deck <deck-id>
showmeshctl resolume action launch-clip <clip-id>
```

See [Resolume Arena](../../integrations/resolume/) for composition preparation, named identities, NDI routing, and recovery controls.

## 3. Add and configure nodes

Confirm the agents that have appeared, then declare each node you want to use in this production:

```sh
showmeshctl nodes
showmeshctl node <node-id>
showmeshctl discover
showmeshctl declare --label 'Stage Left' --notes 'Primary render node' <node-id>
showmeshctl nodes
```

Do not use `undeclare` during normal configuration: it removes the declaration and requires `--confirm`. Use the detailed procedures for the media role itself:

- [Install a native node](../../guides/add-a-node/)
- [Set up a video node](../../guides/set-up-a-video-node/)
- [Set up an audio node](../../guides/set-up-an-audio-node/)
- [Nodes](../../using-showmesh/nodes/) and [Node types](../../using-showmesh/node-types/)

## 4. Create the Show and surfaces

Create the stable Show namespace first. `show set` and `surface set` write complete replacements, so always include every required field.

```sh
showmeshctl show set \
  --name 'Main Show' \
  --notes 'Current production configuration' \
  main-show
showmeshctl show get main-show
showmeshctl show revisions main-show
showmeshctl show participation set --help
showmeshctl show participation get main-show
```

Create a surface for each render canvas. For a 128 by 64 RGB surface, the channel count is `128 × 64 × 3 = 24576`.

```sh
showmeshctl surface set \
  --show main-show \
  --name 'Stage Left' \
  --node stage-left \
  --start-channel 1 \
  --channel-count 24576 \
  --width 128 \
  --height 64 \
  --pixel-format rgb \
  --frame-rate 40 \
  --transport ndi \
  --ndi-source-name 'ShowMesh Stage Left' \
  stage-left-surface
showmeshctl surface list --show main-show
showmeshctl surface get stage-left-surface
```

For a full description of surface limits, output choices, and the explicit render apply/probe path, see [Surfaces](../../using-showmesh/surfaces/).

## 5. Upload and stage assets

Set the asset content URL once so separate agents can fetch from a coordinator address they can reach:

```sh
showmeshctl assets settings set \
  --content-base-url http://<node-reachable-coordinator>:8080
showmeshctl assets settings get
```

Upload a show-wide FSEQ and any audio/media files. Use a node target only when an asset belongs on one specific node.

```sh
showmeshctl assets upload \
  --show main-show \
  --sequence main-sequence \
  --media-type fseq \
  --target-kind show \
  --file ./MainShow.fseq

showmeshctl assets upload \
  --show main-show \
  --sequence main-audio \
  --media-type audio \
  --target-kind node \
  --target stage-left \
  --file ./MainShow.wav

showmeshctl assets list --show main-show
```

Activation selects the desired Show asset set; it does not start playback. Activate now, then wait for the expected asset hashes to appear:

```sh
showmeshctl show activate main-show
showmeshctl show active
showmeshctl assets manifest --require-ready
```

Use [Assets](../../using-showmesh/assets/) when a manifest is not ready. `ready` means the node reported the expected content hash, not that a media engine has begun playback.

## 6. Define Cues and Playlists

Create Cues for the named moments in the production. A Cue requires its whole `outputs` object. This example pairs a render sequence with an audio asset:

```sh
showmeshctl cue set \
  --show main-show \
  --name 'Opening' \
  --outputs-json '{"render":{"sequence":"main-sequence"},"audio":{"asset":"main-audio","startOffsetMillis":0,"targets":["stage-left"]}}' \
  main-opening
showmeshctl cue get main-opening
showmeshctl cue revisions main-opening
```

Create a Playlist that maps Cues onto an imported FPP Playlist definition. Substitute its instance UUID, name, and canonical hash.

```sh
showmeshctl playlist set \
  --show main-show \
  --name 'Main FPP Playlist' \
  --runner fpp \
  --fpp-json '{"instanceUuid":"<FPP instance UUID>","playlistName":"Main Show","canonicalHash":"<canonical hash>"}' \
  --entries-json '[{"id":"opening","cue":"main-opening","fpp":{"section":"mainPlaylist","position":0}}]' \
  main-fpp-playlist
showmeshctl playlist get main-fpp-playlist
showmeshctl fpp playlist-readiness main-fpp-playlist
```

For an audio-runner Playlist, use `--runner showmesh-audio` with `--showmesh-audio-json`. See [Cues](../../using-showmesh/cues/) and [Playlists](../../using-showmesh/playlists/) for target and media-playlist rules.

## 7. Create actions and macros

Actions and Macros use JSON files. Validate each action before adding it to a Macro:

```sh
showmeshctl action put --file ./actions/start-main-playlist.json start-main-playlist
showmeshctl action show start-main-playlist
showmeshctl action check start-main-playlist

showmeshctl macro put --file ./macros/start-show.json start-show
showmeshctl macro show start-show
showmeshctl macro run --follow start-show
showmeshctl run list --macro start-show
```

`--follow` observes the asynchronous run. It can exit `14` while the run remains active, so inspect the run afterward:

```sh
showmeshctl run show --follow <run-id>
```

Use [Actions and macros](../../using-showmesh/actions-and-macros/) for the target formats, available primitives, step policy, and outcome meanings.

## 8. Create and operate a Show Night

Create the Show Night from a JSON file that references the Show, Playlists, optional audio, and Transition Steps:

```sh
showmeshctl night set --file ./nights/main-night.json main-night
showmeshctl night get main-night
showmeshctl night activate main-night
showmeshctl night status
```

Run the lifecycle in order. FPP remains the schedule and playhead authority.

```sh
showmeshctl night prepare-site
showmeshctl night readiness
showmeshctl night preshow
showmeshctl night start
showmeshctl night final-show
showmeshctl night fade-out
showmeshctl night power-down
```

Use `showmeshctl night end-session` only when the documented lifecycle calls for ending a current session. See [Show Night](../../using-showmesh/show-night/) for Transition Steps, lifecycle state, and degraded-state behavior.

## 9. Switch to Show Mode and confirm Emergency Stop

Before running the night, switch the installation to Show Mode. This reduces edit surface for the run and pins Cue activation authorization to the current Show and generation:

```sh
showmeshctl show mode set show
showmeshctl show mode get
```

Switch back to `program` when you need to resume live Cue editing between shows.

:::caution[Emergency Stop is show-affecting]
Confirm you can reach [Emergency stop](../../using-showmesh/emergency-stop/) and know which level you would use before a night runs. Every level immediately stops configured FPP instances, silences declared audio nodes, and blackouts configured Resolume instances. Show Mode never gates it.
:::

```sh
showmeshctl emergency-stop config get
```

Do not run `showmeshctl emergency-stop stop` (or a higher level) against a live production unless you intend to stop it; use this step only to confirm the command is reachable and its optional follow-up actions, if any, are configured as intended.

## Confirm the show is prepared

Before operating a production, inspect the selected configuration and its evidence:

```sh
showmeshctl show active
showmeshctl night status
showmeshctl assets manifest --require-ready
showmeshctl fpp playlist-readiness main-fpp-playlist
showmeshctl render status stage-left
showmeshctl resolume status
showmeshctl snapshot
```

Expect an active Show, ready assets, a passing FPP Playlist check, fresh node and Resolume evidence, and a Show Night ready for the intended transition. Investigate uncertain results before retrying.

See [Command-line interface](../../reference/cli/) for the complete command inventory, global flags, and exit codes.

## If something does not converge

Stop at the affected layer instead of assuming a later command will repair it. Check coordinator health and `snapshot` first, then the specific integration, node, or asset evidence named by the failed command. The [Troubleshooting](../../troubleshooting/) section provides the recovery path for coordinator, node, FPP, action, asset, and diagnostic failures.
