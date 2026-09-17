---
title: Set up an audio node
description: Configure node-local playback, PipeWire routing, PTP clock evidence, output latency, and alignment checks.
pageType: procedure
maturity: experimental-testing
---

ShowMesh audio nodes play complete media files locally. The coordinator distributes assets, chooses a shared start instant when several nodes must play together, and records evidence; it never streams program audio through MQTT.

This path is implemented and test-covered, but physical interfaces, PTP infrastructure, multi-node phase alignment, and live-show recovery still require installation-specific acceptance.

## Before you start

You need:

- a native node installed with [Install a native node](../add-a-node/);
- an administrator credential for configuration writes;
- the program and optional LTC routes from the node's current capability report;
- the PipeWire target node name when PipeWire owns the output device;
- the network interface, PTP domain, and clock-provider choice for this node;
- the audio assets required by the Show already uploaded to ShowMesh.

Do not guess route names or declare hardware that the agent has not advertised. Audio-node writes are refused unless the selected routes exist in the node's own capability evidence.

## 1. Inspect the node

```sh
showmeshctl node <node-id>
showmeshctl audio node get <node-id>
```

Use the node report to identify the advertised local-audio route and, when present, the LTC-capable route. Program and LTC must use the same route. LTC needs a discrete channel that is not one of the program channels.

## 2. Choose the role

Every `audio.node` has one role:

| Role | Use |
| --- | --- |
| `program` | Main program audio without LTC. |
| `program+ltc` | Main program audio and the installation's sole LTC output. |
| `zone` | An independently named speaker zone; never the main program or LTC output. |

Only one node may hold `program+ltc`. Set `--role program` explicitly for a program-only node; the omitted-role default is `program+ltc`.

## 3. Configure routing

For an ALSA-backed program-only node:

```sh
showmeshctl audio node set \
  --program-route <advertised-route> \
  --program-channels 1,2 \
  --clock-domain <clock-domain-name> \
  --clock-domain-provenance <why-these-outputs-share-a-clock> \
  --role program \
  <node-id>
```

When PipeWire owns the device, select `pipewiresink` and the exact PipeWire target node:

```sh
showmeshctl audio node set \
  --program-route <advertised-route> \
  --program-channels 1,2 \
  --clock-domain <clock-domain-name> \
  --clock-domain-provenance <provenance> \
  --role program \
  --sink-backend pipewiresink \
  --pipewire-target-node <pipewire-node-name> \
  <node-id>
```

For a node that also emits LTC, add both `--ltc-route` and `--ltc-channel`. They are optional together and invalid separately.

The command is a full replacement, with three deliberate carry-forwards: omitted sink-backend, PipeWire target, and output-latency flags retain their current stored values after a successful pre-write read. Use `--force` only when deliberately bypassing the revision check; it can also reset those carried values if the read fails.

## 4. Configure the node clock

`node.clock` declares how the node participates in the shared media clock. The supported providers are:

- `managed`: ShowMesh manages the node's PTP service;
- `external`: another service manages PTP and ShowMesh reads its evidence;
- `fpp`: an FPP 10 host provides the clock relationship.

Example managed configuration:

```sh
showmeshctl node-clock set \
  --provider managed \
  --interface <network-interface> \
  --domain <ptp-domain> \
  --client-only \
  --hardware-timestamping \
  <node-id>
```

Use `--phc-device` when an external provider disciplines a particular PTP hardware clock. Use `--fpp-base-url` with the `fpp` provider. `node-clock set` is a full replacement and does not read the previous object first.

```sh
showmeshctl node-clock get <node-id>
showmeshctl node-clock revisions <node-id>
```

## 5. Record output latency

Calibrated output latency lets ShowMesh compensate for a static device and output-chain delay when it chooses a scheduled start. Record the measurement method, value, reference, configuration, timestamp, and confidence together. Use `showmeshctl audio node set --help` for the complete required flag group.

Use `--output-latency-method unmeasured` by itself to clear a stored calibration. Do not present a declared or estimated value as a measured one.

## 6. Check assets and readiness

```sh
showmeshctl assets manifest --node <node-id> --require-ready
showmeshctl audio node get <node-id>
showmeshctl node-clock get <node-id>
```

Readiness depends on more than the presence of an interface. Check exact assets, program/LTC channel separation, route availability, clock state, current engine evidence, and output-latency provenance.

## 7. Exercise scheduled playback

Test one node before testing a group. The direct session commands expose prepare, start, pause, resume, seek, advance, stop, clear, gain, fade, mute, and unmute operations.

For several nodes, use one aligned-start request so the coordinator prepares every target and chooses one shared media-clock instant:

```sh
showmeshctl audio session aligned-start <session-id> <node-id> <node-id> ...
```

The result reports each target as aligned or unaligned. Unaligned is visible degraded evidence, not synchronized success.

## 8. Record a drift run

```sh
showmeshctl audio alignment-run start --node <node-id>
showmeshctl audio alignment-run list --node <node-id>
showmeshctl audio alignment-run get --node <node-id> --run <run-id>
showmeshctl audio alignment-run stop --node <node-id> --run <run-id>
```

Source and test evidence does not replace listening tests, receiver-lock checks, or long-duration measurements on the installation's real interfaces.

## Failure behavior

Audio-device loss fails silent. ShowMesh does not automatically move audience audio back to FPP or choose a standby output. Restore the intended route, PipeWire target, clock relationship, channel separation, assets, and session position before resuming sound.

See [Audio nodes](../../using-showmesh/node-types/audio-nodes/) for the model, [SMPTE / LTC](../../integrations/smpte-ltc/) for timecode behavior, and [Audio and clock sync](../../troubleshooting/audio-and-clock-sync/) for diagnosis.
