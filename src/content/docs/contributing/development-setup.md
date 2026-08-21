---
title: Development setup
description: Build the current ShowMesh repository and run the fast verification gate.
pageType: procedure
maturity: available
---

## Before you start

- Go 1.25 or newer in the repository's supported range.
- Node 22, matching `.nvmrc`.
- Docker for Compose and integration suites.
- `make`.

## Set up and verify the checkout

1. Clone the main repository and enter its directory:

   ```sh
   git clone https://github.com/ShowMeshSystems/showmesh.git
   cd showmesh
   ```

2. Select the repository's Node version:

   ```sh
   nvm use
   ```

3. Build the binaries and run the fast gate:

   ```sh
   make build
   make check
   ```

`make build` creates five binaries in `./bin`: coordinator, agent, MultiSync probe, CLI, and FPP plugin. `make check` is the fast project gate and includes Go formatting, vetting, linting and unit tests plus UI lint, types, tests, build, and generated-type verification.

Use only synthetic or isolated integration targets during development. Never point tests or discovery tools at the live fleet without explicit owner authorization.

## Run components

The coordinator is primarily deployed with Docker Compose. The node agent runs natively because media hardware needs direct access to the host. The UI is an independent client of the public API and is not required for the coordinator or CLI to operate.

## If setup fails

Resolve the first reported toolchain or test failure before starting components. Recheck the Go and Node versions against the Requirements list, and use the exact failing package or command output rather than deleting generated state or changing the host globally.
