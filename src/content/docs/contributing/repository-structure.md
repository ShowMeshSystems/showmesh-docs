---
title: Repository structure
description: Where implementation, APIs, tests, engineering decisions, deployment, and public docs belong.
pageType: concept
---

## Main `showmesh` repository

- `cmd/`: five executable entry points: `showmesh-coordinator`, `showmesh-agent`, `showmesh-multisync-probe`, `showmeshctl`, and `showmesh-fpp-plugin`.
- `internal/`: coordinator and agent implementation that is not a public Go API. Notable packages: `internal/fppconnect` (values a render node advertises to xLights' FPP Connect dialog, shared between the MultiSync discover-ping responder and the node's HTTP compatibility listener), `internal/repohygiene` (repo-wide structural checks that do not belong to any single build package), and `internal/version` (build-time version metadata, set via `-ldflags`).
- `pkg/`: shared protocol and domain packages. Notable areas include audio scheduling/contracts, capabilities, commands, Cue activation/authorization/catalogs, coordinator signatures, FPP identity and fallback programs, FSEQ parsing, MQTT envelopes, MultiSync, observations, and Resolume composition parsing. Treat the directory itself as the current inventory; this summary is intentionally not exhaustive.
- `api/openapi.yaml`: machine-readable public HTTP API description.
- `ui/`: TypeScript operator client.
- `deploy/`: Docker Compose deployment and deployment-specific operator material, including `deploy/node/` (`agent.env.example`, `install.sh`, `preflight.sh`, `README.md`, and `showmesh-agent.service` for a natively installed node).
- `test/`: assembled-system integration tests.
- `bench/`: isolated research and hardware/protocol bench scaffolding, never the product.
- `docs/architecture/`: engineering architecture specifications.
- `docs/decisions/`: ADRs and their authoritative status register.
- `docs/research/`: evidence records and research queue.
- `docs/build/`: implementation plans, identifier register, current build state, and lessons.
- `docs/bench/`: dated hardware and protocol bench session records.
- `VERSION`, `CHANGELOG.md`, and `docs/RELEASING.md`: repository version, release history, and the tag-driven release contract.

## FPP plugin repositories

Two separate repositories carry the experimental [FPP Plugin](../../integrations/fpp-plugin/): one holds the plugin runtime and a second holds Plugin Manager packaging, install scripts, and locked candidate-artifact digests. Repository contents prove build and packaging behavior, not public release availability; see the integration page for the current evidence boundary.

## `showmesh-docs` repository

This repository contains human-facing operator, user, integration, platform developer, troubleshooting, reference, and contributor documentation. It must not become a second store for implementation specifications or copied build logs.

When a factual claim conflicts, verify against code, tests, and the public API description. Engineering prose is useful evidence, but it can lag the implementation.
