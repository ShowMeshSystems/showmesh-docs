---
title: Audio or clock sync is wrong
description: Diagnose routes, PipeWire, PTP, output latency, scheduled starts, drift, and restore state.
pageType: troubleshooting
maturity: experimental-testing
complexity: advanced
---

Start by deciding whether the problem is content delivery, output routing, clock evidence, scheduling, alignment, or physical receiver behavior. Do not treat “the command was accepted” as proof that audio was heard or synchronized.

## Capture evidence

```sh
showmeshctl node <node-id>
showmeshctl audio node get <node-id>
showmeshctl node-clock get <node-id>
showmeshctl audio session show
showmeshctl assets manifest --node <node-id> --require-ready
```

For a retained measurement:

```sh
showmeshctl audio alignment-run list --node <node-id>
showmeshctl audio alignment-run get --node <node-id> --run <run-id>
```

## Symptom: no sound

Check that the node advertised the configured route, program channels are valid, the sink backend matches the installation, and a PipeWire target still exists when `pipewiresink` is selected. Confirm the exact asset is present and the session is not muted, stopped, failed, or `restore_pending`.

Device loss fails silent. ShowMesh does not automatically fall back to another output.

## Symptom: wrong output or missing LTC

Program and LTC must use the same advertised route and distinct channels. A program-only node omits both LTC route and channel and should use role `program`. Only one node may hold `program+ltc`.

Confirm PipeWire owns the card when configured, and verify the saved target node matches the current PipeWire graph. A valid saved route does not prove the physical jack or receiver is correct.

## Symptom: PTP is unlocked or stale

Inspect the configured provider, interface, PTP domain, PHC where applicable, and current clock report. Distinguish synchronized, holdover, stale, unavailable, and never observed.

For a managed provider, verify the service can access the interface and requested timestamping mode. For an external provider, verify its management socket and PHC. For an FPP provider, verify the FPP 10 base URL and its own clock state.

## Symptom: multi-node start is unaligned

An aligned-start result is per node. Check which target failed preparation, lacked an asset, missed the scheduled instant, or reported that it did not use the shared instant. One aligned node does not make the group aligned.

Repeat only after correcting the named condition. Reissuing the same start against stale clock evidence can reproduce the failure while changing playback state.

## Symptom: a stable offset remains

Check output-latency calibration on every target. Confirm method, signed microsecond value, reference, device/buffer configuration, measurement time, and confidence still match the current output chain.

Recalibrate after changing the device, sample rate, PipeWire quantum, buffer configuration, or downstream processing.

## Symptom: drift grows over time

Start an alignment run and compare its series with the configured warning threshold. Separate PTP lock loss from a stable output-latency offset and from receiver behavior. A prior clean run is not current evidence after a clock or routing change.

## What remains outside ShowMesh evidence

ShowMesh can report routes, scheduling, clocks, engine state, and measured alignment. It cannot prove that an amplifier, physical cable, speaker, or external LTC receiver behaved correctly without installation-side observation.
