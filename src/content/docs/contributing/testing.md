---
title: Testing
description: Choose the smallest test that proves the claim, then verify assembled behavior when the claim crosses a process boundary.
pageType: reference
---

## Fast check

```sh
make check
```

This runs the repository's formatting, vet, lint, Go unit, UI lint/type/test/build, and generated-type checks.

## Integration tiers

| Command | External requirement | Purpose |
|---|---|---|
| `make test` | None | Go unit tests. |
| `make test-integration` | Docker | Coordinator, real Mosquitto, and real agent subprocesses. |
| `make test-integration-fpp` | Docker and a long first build | Collector against containerized `fppd`. |
| `make test-integration-fppmqtt` | Docker | FPP MQTT ingestion through a real broker. |
| `make test-integration-broker` | Docker | Broker retained-message and restart behavior. |
| `cd ui && npm test` | Node 22 | UI unit tests. |

Integration suites that use Mosquitto containers can collide when run concurrently. Isolate or serialize them; a port/container-name collision can look like a product failure.

## Claim discipline

A passing unit test is not hardware verification. If a test is intended to prevent a regression, temporarily break the behavior and confirm the test fails. Report the exact checks run; do not generalize a macOS result to Linux or a container result to a live show network.
