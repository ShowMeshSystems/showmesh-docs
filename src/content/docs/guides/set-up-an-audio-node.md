---
title: Set up an audio node
description: Configure node-local playback, PipeWire routing, PTP clock evidence, output latency, and alignment checks.
pageType: procedure
maturity: experimental-testing
---

ShowMesh audio nodes play complete files locally. The coordinator distributes assets and schedules shared starts; it does not stream program audio. Test the physical outputs, PTP network, alignment, and recovery on your installation before show use.

## Before you start

You need:

- a native node installed with [Install a native node](../add-a-node/);
- an administrator credential for configuration writes;
- the program route and optional LTC route from the node's capability report;
- any required PipeWire target;
- the network interface, PTP domain, and clock provider;
- the audio assets required by the Show already uploaded to ShowMesh.

Do not guess route names or declare hardware that the agent has not advertised. Audio-node writes are refused unless the selected routes exist in the node's own capability evidence.

## 1. Inspect the node

```sh
showmeshctl node <node-id>
showmeshctl audio node get <node-id>
```

Identify the advertised audio route. Program and LTC must use that same route, with LTC on a channel not used by program audio.

## 2. Choose the role

Every `audio.node` has one role:

| Role | Use |
| --- | --- |
| `program` | Main program audio without LTC. |
| `program+ltc` | Main program audio and the installation's sole LTC output. |
| `zone` | An independently named speaker zone; never the main program or LTC output. |

Only one node may use `program+ltc`. Set `--role program` explicitly for program-only output; the default is `program+ltc`.

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

For LTC, add both `--ltc-route` and `--ltc-channel`; using only one is invalid.

This command replaces the saved configuration, although omitted output-backend and latency flags are normally carried forward. Use `--force` only when you intend to bypass revision protection; if the pre-write read fails, carried values can reset.

## 4. Configure the node clock

Choose one clock provider:

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

Use `--phc-device` for an external provider tied to a PTP hardware clock, or `--fpp-base-url` for the `fpp` provider. `node-clock set` fully replaces the object.

```sh
showmeshctl node-clock get <node-id>
showmeshctl node-clock revisions <node-id>
```

## 5. Record output latency

Record output-latency calibration with its method, value, reference, device configuration, timestamp, and confidence. ShowMesh uses it to compensate for static output delay. See `showmeshctl audio node set --help` for the flags.

Use `--output-latency-method unmeasured` by itself to clear a stored calibration. Do not present a declared or estimated value as a measured one.

## 6. Check assets and readiness

```sh
showmeshctl assets manifest --node <node-id> --require-ready
showmeshctl audio node get <node-id>
showmeshctl node-clock get <node-id>
```

Confirm assets, channel separation, route availability, clock state, engine evidence, and output-latency provenance.

## 7. Exercise scheduled playback

Test one node before a group. Direct session commands provide playback, gain, fade, mute, and clear controls.

For several nodes, use one aligned-start request so the coordinator prepares every target and chooses one shared media-clock instant:

```sh
showmeshctl audio session aligned-start <session-id> <node-id> <node-id> ...
```

The result reports alignment per target. `unaligned` is degraded operation, not synchronized success.

## 8. Record a drift run

```sh
showmeshctl audio alignment-run start --node <node-id>
showmeshctl audio alignment-run list --node <node-id>
showmeshctl audio alignment-run get --node <node-id> --run <run-id>
showmeshctl audio alignment-run stop --node <node-id> --run <run-id>
```

Run listening, receiver-lock, and long-duration tests on the real interfaces.

## If playback fails

Audio-device loss fails silent. ShowMesh does not choose a standby output or move audio to FPP. Restore the route, clock, channels, assets, and session position before resuming sound.

See [Audio nodes](../../using-showmesh/node-types/audio-nodes/) for the model, [SMPTE / LTC](../../integrations/smpte-ltc/) for timecode behavior, and [Audio and clock sync](../../troubleshooting/audio-and-clock-sync/) for diagnosis.
