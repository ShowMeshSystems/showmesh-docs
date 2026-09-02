---
title: Audio Node Overview
description: Understand experimental audio-node configuration, sessions, and output behavior.
pageType: procedure
maturity: experimental-testing
---

ShowMesh has experimental audio-node software for configuration, session commands, gain and output control, and LTC generation. This overview explains the model before you configure a node.

## Before you start

Install the node first with [Install a Native Node](../add-a-node/): the agent must be running and have already advertised its audio hardware before you can configure it as an audio node. Have the audio assets for the intended session and the route names the node's own capability report advertised.

The only hardware evidence on record is a Raspberry Pi 3B+ installed as a program-only audio node with no LTC route; no installation has ever run two audio nodes. Treat anything beyond a single audio node as unverified.

## What the audio node does

The current design and software behavior establish these boundaries:

- audio files stay local to the audio node and are never streamed as real-time PCM through MQTT or the coordinator;
- FPP remains the schedule and show-timeline authority, while audio aligns at start and explicit correction points rather than continuously changing rate;
- program audio and LTC use a declared shared clock domain where LTC is configured;
- audio-device failure fails silent rather than automatically falling back to another output;
- node readiness combines assets, routes, channel separation, clock relationship, and current engine evidence.

## The audio.node role and zone

Every audio.node object carries a role: `program` plays program audio only; `program+ltc` plays program audio and is this installation's sole LTC emitter; `zone` plays an independent local speaker zone and never carries program or LTC. Only one node across the installation may hold `program+ltc` at a time; a second is refused, naming both node IDs.

`--role`, `--ltc-route`, and `--ltc-channel` are independent settings on `showmeshctl audio node set`. `--ltc-route` and `--ltc-channel` are optional together: omit both to declare a program-only interface that has no channel to spare for a discrete LTC signal. Omitting `--role` defaults it to `program+ltc`, the role every node had by implication before roles existed, regardless of whether an LTC route is given. Set `--role program` explicitly for a node that emits no LTC, rather than relying on the role default. `--zone` is accepted only with `--role zone`.

```sh
showmeshctl audio node set \
  --program-route <advertised-route> \
  --program-channels 1,2 \
  --clock-domain "<name>" \
  --clock-domain-provenance "<basis for the declaration>" \
  --role program \
  <node-id>
```

The write is refused unless the node's own capability report already advertised the named route; it is never accepted on the operator's claim alone.

## What to configure

1. Add a native node and select its audio role and zone (if any).
2. Choose the program route and, when needed, a separate LTC route and channel.
3. Configure gain, fade, ducking, and drift behavior with the audio-node settings.
4. Synchronize the audio assets needed by the session.
5. Start and observe the session through the audio-node commands.

Audio files remain local to the node. ShowMesh coordinates the session and observes its state; it does not stream real-time PCM over MQTT or through the coordinator.

## Readiness conditions specific to audio nodes

- `audio-ltc-emitter-ambiguous`: more than one audio.node holds role `program+ltc`. Authoring refuses a second one; reaching this state means two nodes were declared while a third path was open, or one was rewritten while another was absent.
- `audio-target-unbound`: a Cue's audio, LTC, or announcement output names a target node that holds no audio.node object.
- `audio-target-unresolved`: a Cue's output names no target and the installation has no node to resolve it to. An untargeted output goes to the sole `program+ltc` node, or, when there is none, to the sole audio.node of any role; an installation with two or more audio nodes and none holding `program+ltc` leaves that output unresolved.

## Confirm the setup

```sh
showmeshctl audio node get <node-id>
```

The node should display the selected routes, role, and current engine evidence, and the session should report the expected asset and playback state.

## Where to go next

Use [Audio Nodes](../../using-showmesh/node-types/audio-nodes/) for the full configuration model, and [SMPTE / LTC](../../integrations/smpte-ltc/) for timecode-specific behavior.
