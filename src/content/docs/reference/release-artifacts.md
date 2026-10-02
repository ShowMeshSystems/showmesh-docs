---
title: Release artifacts
description: Understand the tag-driven ShowMesh release matrix and verify downloaded artifacts.
pageType: reference
maturity: experimental-testing
complexity: advanced
---

Use the [Core v0.2.0 release](https://github.com/ShowMeshSystems/showmesh/releases/tag/v0.2.0) for the installer and native agents, and the separate [FPP plugin v0.2.0 release](https://github.com/ShowMeshSystems/showmesh-fpp-plugin/releases/tag/v0.2.0) for plugin binaries. Install or upgrade both versions together. These are pre-alpha prereleases with no compatibility or migration promise between `0.x` versions.

## Version and tag agreement

The tag and repository version must match. A development build is not a tagged release candidate.

## Artifact matrix

The release workflow defines:

- coordinator container images for `linux/amd64` and `linux/arm64`;
- Operator UI container images for `linux/amd64` and `linux/arm64`;
- `get-showmesh.sh` and the versioned installer bundle;
- native node-agent packages for `amd64` and `arm64`;
- a combined SHA-256 manifest covering retained downloadable artifacts;
- a GitHub prerelease that remains distinct from final release publication.

Core does not publish armv7 node-agent packages. The separate FPP plugin release includes amd64, arm64, and armv7 helpers and FPP 10 native objects. “Linux” or “ARM” alone does not identify a supported Raspberry Pi model.

## Verify a download

1. Select one exact tag or prerelease.
2. Download the artifact and the checksum manifest from that same release.
3. Verify the SHA-256 digest before installing.
4. Preserve the version, architecture, digest, and installation result in commissioning records.
5. Validate the installed binary or image reports the expected version and commit.

A matching checksum proves file identity, not installation, hardware, integration, or live-show compatibility.

## Container images

Use an image only after its tag appears in the registry. Pin production deployments by digest. If no suitable image exists, use the documented source-build path.

## Native agents

Install the native-agent package for the host architecture, verify its checksum, then run the node installation and capability checks. CI packaging does not verify that host's audio, NDI, PTP, or service configuration.
