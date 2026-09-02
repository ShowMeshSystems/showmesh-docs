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
| `make test-integration-fpp` | Docker and a long first build | Collector against containerized `fppd`. Set `SHOWMESH_FPP_TEST_PREBUILT=1` to skip the source build and use a prebuilt image instead. |
| `make test-integration-fppmqtt` | Docker | FPP MQTT ingestion through a real broker. |
| `make test-integration-broker` | Docker | Broker retained-message and restart behavior. |
| `make bench-audio` | Docker | Audio bench container; not part of `make check` or CI. |
| `make pr-ready-check` | GitHub CLI and a pushed branch | Checks repository and pull request state after a task branch is pushed and its CI checks have completed. |
| `make ui-lint`, `make ui-test`, `make ui-build`, `make ui-gen-check` | Node 22 | UI lint, unit tests, production build, and generated-type verification against `api/openapi.yaml`. |

Integration suites that use Mosquitto containers can collide when run concurrently. Isolate or serialize them; a port/container-name collision can look like a product failure.

## Claim discipline

A passing unit test is not hardware verification. If a test is intended to prevent a regression, temporarily break the behavior and confirm the test fails. Report the exact checks run; do not generalize a macOS result to Linux or a container result to a live show network.
