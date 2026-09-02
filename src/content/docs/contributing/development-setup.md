---
title: Development setup
description: Build the current ShowMesh repository and run the fast verification check.
pageType: procedure
---

## Before you start

- Go 1.25 or newer in the repository's supported range (`go.mod` requires `go 1.25.0`).
- Node 22, matching `.nvmrc`.
- Docker for Compose and integration suites.
- `make`.
- For a native audio agent build (`make build-agent-native`): a Debian 13 host with GStreamer and libltc development packages installed. The CGo-free binary from `make build` carries no audio engine.

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

3. Build the binaries and run the fast check:

   ```sh
   make build
   make check
   ```

`make build` creates five binaries in `./bin`: `showmesh-coordinator`, `showmesh-agent`, `showmesh-multisync-probe`, `showmeshctl`, and `showmesh-fpp-plugin`. `make check` is the fast project check and includes Go formatting, vetting, linting and unit tests plus UI lint, types, tests, build, and generated-type verification.

Use only synthetic or isolated integration targets during development. Never point tests or discovery tools at the live fleet without explicit owner authorization.

## Build a native audio agent

`make build` produces a CGo-free agent with no audio engine. `make build-agent-native` builds `showmesh-agent-native` with CGo enabled against the host's GStreamer development headers and plugins; it needs a Debian 13 host with GStreamer and libltc development packages installed. `make package-node-agent` builds that native agent, stages the files under `deploy/node/`, and tars the result deterministically for distribution to a node.

## Run components

The coordinator is primarily deployed with Docker Compose. The node agent runs natively because media hardware needs direct access to the host. The Operator UI is an independent client of the public API and is not required for the coordinator or CLI to operate.

## Required checks before merge to main

The CI workflow's `lint`, `vuln`, `ui`, `docker`, and `test-gate` jobs are required by exact job name. The Docker-backed integration suites and the separate FPP bench-integration workflow are advisory: they run in CI but do not block a merge. Check the main repository's CONTRIBUTING.md and `.github/workflows/` for the current list before relying on this summary.

## If setup fails

Resolve the first reported toolchain or test failure before starting components. Recheck the Go and Node versions against the Requirements list, and use the exact failing package or command output rather than deleting generated state or changing the host globally.
