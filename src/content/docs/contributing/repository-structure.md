---
title: Repository structure
description: Where implementation, contracts, tests, engineering decisions, deployment, and public docs belong.
pageType: concept
---

## Main `showmesh` repository

- `cmd/`: executable entry points, including `showmesh-coordinator`, `showmesh-agent`, and `showmeshctl`.
- `internal/`: coordinator and agent implementation that is not a public Go API.
- `pkg/`: shared protocol and domain packages.
- `api/openapi.yaml`: machine-readable public HTTP API description.
- `ui/`: TypeScript operator client.
- `deploy/`: Docker Compose deployment and deployment-specific operator material.
- `test/`: assembled-system integration tests.
- `bench/`: isolated research and hardware/protocol bench scaffolding, never the product.
- `docs/architecture/`: engineering architecture specifications.
- `docs/decisions/`: ADRs and their authoritative status register.
- `docs/research/`: evidence records and research queue.
- `docs/build/`: implementation plans, identifier register, current build state, and lessons.

## `showmesh-docs` repository

This repository contains human-facing operator, user, integration, platform developer, troubleshooting, reference, and contributor documentation. It must not become a second store for implementation specifications or copied build logs.

When a factual claim conflicts, verify against code, tests, and the public API description. Engineering prose is useful evidence, but it can lag the implementation.
