---
title: Audio or clock sync is wrong
description: Diagnose routes, PipeWire, PTP, output latency, scheduled starts, drift, and restore state.
pageType: troubleshooting
maturity: experimental-testing
complexity: advanced
---

First identify whether the problem is the asset, output route, clock, scheduled start, alignment, or physical receiver. Command acceptance does not prove audible or synchronized output.

## Record current state

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

Confirm the node advertises the saved route, the program channels are valid, and the selected output backend exists. Then confirm the asset is present and the session is not muted, stopped, failed, or `restore_pending`.

Device loss fails silent. ShowMesh does not automatically fall back to another output.

## Symptom: wrong output or missing LTC

Program and LTC must use the same route and different channels. A program-only node omits both LTC fields and uses role `program`. Only one node may use `program+ltc`.

When using PipeWire, confirm it owns the card and that the saved target still exists. A valid route does not prove the physical output is correct.

## Symptom: PTP is unlocked or stale

Inspect the provider, interface, PTP domain, optional PHC, and current clock report. Distinguish synchronized, holdover, stale, unavailable, and never observed.

For a managed provider, verify the service can access the interface and requested timestamping mode. For an external provider, verify its management socket and PHC. For an FPP provider, verify the FPP 10 base URL and its own clock state.

## Symptom: multi-node start is unaligned

Alignment is reported per node. Find the target that failed preparation, lacked an asset, missed the scheduled instant, or did not use it. One aligned node does not make the group aligned.

Retry only after correcting the named condition. A retry can change playback state without fixing stale clock evidence.

## Symptom: a stable offset remains

Check each target's output-latency calibration and confirm its method, value, device configuration, timestamp, and confidence still match the output chain.

Recalibrate after changing the device, sample rate, PipeWire quantum, buffer configuration, or downstream processing.

## Symptom: drift grows over time

Start an alignment run and compare it with the warning threshold. Separate PTP lock loss, a stable output-latency offset, and receiver behavior. Rerun the measurement after clock or routing changes.

## Check external audio hardware

ShowMesh reports routes, scheduling, clocks, engine state, and measured alignment. Check amplifiers, cables, speakers, and external LTC receivers directly.
