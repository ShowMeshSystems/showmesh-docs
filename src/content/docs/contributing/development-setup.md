---
title: Development setup
description: Build the current ShowMesh repository and run the fast verification gate.
---

## Requirements

- Go 1.25 or newer in the repository's supported range.
- Node 22, matching `.nvmrc`.
- Docker for Compose and integration suites.
- `make`.

```sh
git clone https://github.com/ShowMeshSystems/showmesh.git
cd showmesh
nvm use
make build
make check
```

`make build` creates five binaries in `./bin`: coordinator, agent, MultiSync probe, CLI, and FPP plugin. `make check` is the fast project gate and includes Go formatting, vetting, linting and unit tests plus UI lint, types, tests, build, and generated-type verification.

Use only synthetic or isolated integration targets during development. Never point tests or discovery tools at the live fleet without explicit owner authorization.

## Run components

The coordinator is primarily deployed with Docker Compose. The node agent runs natively because media hardware needs direct access to the host. The UI is an independent client of the public API and is not required for the coordinator or CLI to operate.
