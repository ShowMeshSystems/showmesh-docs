---
title: Build your first show
description: Build and operate a first ShowMesh production from the command line, from coordinator setup through FPP, Resolume, assets, and Show Night.
pageType: procedure
maturity: experimental-active
complexity: advanced
---

This is the complete command-line-first path from an installed coordinator to a prepared ShowMesh production. It uses the current source and command surface, so it **will change over time**. Run `showmeshctl version` and `showmeshctl <command> --help` against the coordinator you are operating before copying a command into a script.

This guide deliberately does not cover the Operator UI. A separate UI workflow will follow when that surface is ready. FPP remains the scheduler and playback authority; ShowMesh prepares, observes, and performs the bounded controls configured here.

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

Confirm that ShowMesh is collecting state before using a control. This list is the complete direct FPP control set:

```sh
showmeshctl fpp start-playlist fpp-main '<playlist name>'
showmeshctl fpp stop-playlist fpp-main
showmeshctl fpp stop-playlist-gracefully fpp-main
showmeshctl fpp pause-playlist fpp-main
showmeshctl fpp resume-playlist fpp-main
showmeshctl fpp next-playlist-item fpp-main
showmeshctl fpp prev-playlist-item fpp-main
showmeshctl fpp set-volume fpp-main 75
```

Each command waits for updated observation evidence. If one is unconfirmed, inspect FPP before repeating it. See [FPP](../../integrations/fpp/) for collection, readiness, and recovery details.

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

Test a reversible Arena action before including it in a macro. The available direct actions are `launch-clip`, `clear-layer`, `launch-column`, `select-deck`, `blackout`, `set-layer-bypass`, and `set-layer-master`.

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
- [Audio node overview](../../guides/set-up-an-audio-node/)
- [Nodes](../../using-showmesh/nodes/) and [Node types](../../using-showmesh/node-types/)

For a render node, the later render commands are `render settings`, `render status`, `render apply`, `render clear`, `render restart`, `render probe`, and `render transport`. For an audio node, configure `audio settings` and `audio node` before using `audio session`, `audio gain`, or `audio output` commands.

## 4. Create the Show and surfaces

Create the stable Show namespace first. `show set` and `surface set` write complete replacements, so always include every required field.

```sh
showmeshctl show set \
  --name 'Main Show' \
  --notes 'Current production configuration' \
  main-show
showmeshctl show get main-show
showmeshctl show revisions main-show
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
  --outputs-json '{"render":{"sequence":"main-sequence"},"audio":{"asset":"main-audio","startOffsetMillis":0}}' \
  main-opening
showmeshctl cue get main-opening
showmeshctl cue revisions main-opening
```

Create a Playlist that maps Cues onto an existing FPP playlist. Substitute the FPP instance UUID, playlist name, and canonical hash from the FPP playlist-definition commands. The entry position refers to the FPP section and position.

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

For an audio-runner Playlist, use `--runner showmesh-audio` with `--showmesh-audio-json` instead of `--fpp-json`. If a Cue's audio, LTC, or announcement output must reach a specific audio node rather than the installation's default, add a `"target"` naming that `audio.node` id inside the relevant output object. See [Cues](../../using-showmesh/cues/) and [Playlists](../../using-showmesh/playlists/) for output rules, FPP bindings, mismatch behavior, and complete JSON shapes.

## 7. Create actions and macros

Actions and Macros use JSON files because they contain complete provider targets and ordered step policies. Start from the current shape for your coordinator, then write the definition and validate every action before assembling the Macro:

```sh
showmeshctl action put --file ./actions/start-main-playlist.json start-main-playlist
showmeshctl action show start-main-playlist
showmeshctl action check start-main-playlist

showmeshctl macro put --file ./macros/start-show.json start-show
showmeshctl macro show start-show
showmeshctl macro run --follow start-show
showmeshctl run list --macro start-show
```

An action can target FPP, Resolume, or a configured integration MQTT broker. A Macro runs its action steps in order. `--follow` observes the asynchronous run; an idle follow can finish with exit code `14` while the run is still active, so inspect it explicitly:

```sh
showmeshctl run show --follow <run-id>
```

Use [Actions and macros](../../using-showmesh/actions-and-macros/) for the target formats, available primitives, step policy, and outcome meanings.

## 8. Create and operate a Show Night

**Show Night** is the operator name for the revisioned `night.session` configuration. Create it from a complete JSON file that references the Show, FPP playlists, optional audio, and Transition Steps:

```sh
showmeshctl night set --file ./nights/main-night.json main-night
showmeshctl night get main-night
showmeshctl night activate main-night
showmeshctl night status
```

Run the night lifecycle in order. FPP continues to decide scheduled admission and playback; these commands prepare and control the Show Night around it.

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
Confirm you can reach [Emergency stop](../../using-showmesh/emergency-stop/) and know which level you would use before a night runs. A confirmed stop silences FPP playout on every configured instance immediately, and Show Mode never delays or degrades it.
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

The expected result is an active Show, ready assets, an FPP Playlist readiness result, current node and Resolume evidence, and a Show Night that is ready for the lifecycle operation you intend. If a command reports an uncertain result, inspect the named system and fresh evidence before retrying.

## Complete `showmeshctl` command map

This is the current command inventory. The guide used the commands needed to build a first production; the rest support inspection, recovery, integration administration, and automation. Use `showmeshctl <group> --help` for exact flags and required scopes in the binary you run.

```text
Inventory and evidence
  nodes | node | snapshot | watch | events | session | audit | version | help

FPP and FPP MQTT
  fpp
  fpp start-playlist | stop-playlist | stop-playlist-gracefully
  fpp pause-playlist | resume-playlist | next-playlist-item | prev-playlist-item | set-volume
  fpp reset-observation-sequence | acknowledge-instance-uuid-change
  fpp playlist-definitions list|get|entries
  fpp playlist-entry-observations list|reconciliation
  fpp playlist-readiness
  config get|set|revisions
  fpp-mqtt get|set

Nodes and Show configuration
  discover | declare | undeclare
  show list|get|set|revisions|active|activate
  show mode|get|set|revisions
  surface list|get|set|revisions
  cue list|get|set|revisions
  playlist list|get|set|revisions
  cuecatalog get|acknowledge|deploy

Actions, Macros, Show Night, and Emergency Stop
  action list|show|put|check|invoke
  macro list|show|put|run
  run show|list
  night list|get|set|revisions|revision|active|activate|deactivate|status
  night prepare-site|readiness|preshow|start|final-show|fade-out|power-down|end-session
  emergency-stop stop|stop-power-down
  emergency-stop hard-stop arm|fire
  emergency-stop config get|set|revisions

Resolume
  resolume instance list|set|remove
  resolume composition upload|show
  resolume action list|launch-clip|clear-layer|launch-column|select-deck|blackout
  resolume action set-layer-bypass|set-layer-master
  resolume status
  resolume recovery status|enable|disable|restore|revisions

Assets and node media
  assets list|get|upload|fetch|manifest
  assets settings get|set
  render settings get|set|revisions
  render status|apply|clear|restart|probe|transport
  audio settings get|set|revisions
  audio node list|get|set|revisions
  audio session apply|prepare|start|pause|resume|seek|advance|stop|clear
  audio gain set|fade
  audio output mute|unmute
  fppconnect settings get|set|revisions
  fppconnect status

Identity
  principal list|create|disable|enable|reset-password|set-role
  token list|issue|revoke
```

Every command accepts `--server`, `--token`, `--output text|json`, and `--timeout` after its last verb and before any positional ID. See [Command-line interface](../../reference/cli/) for common flags, stable exit codes, and scripting behavior.

## If something does not converge

Stop at the affected layer instead of assuming a later command will repair it. Check coordinator health and `snapshot` first, then the specific integration, node, or asset evidence named by the failed command. The [Troubleshooting](../../troubleshooting/) section provides the recovery path for coordinator, node, FPP, action, asset, and diagnostic failures.
