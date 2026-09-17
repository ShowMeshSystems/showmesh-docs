---
title: Release artifacts
description: Understand the tag-driven ShowMesh release matrix and verify downloaded artifacts.
pageType: reference
maturity: experimental-testing
complexity: advanced
---

ShowMesh has tag-driven release automation, but source support for a release workflow does not prove that a particular image or downloadable package is publicly available. Check the repository's Releases page and package registry for the exact version you intend to install.

## Version and tag agreement

A release tag and the repository version must agree before release jobs publish artifacts. Development checkouts can still identify themselves as development builds and are not interchangeable with a tagged candidate.

## Artifact matrix

The release workflow defines:

- coordinator container images for `linux/amd64` and `linux/arm64`;
- Operator UI container images for `linux/amd64` only;
- native node-agent packages for `amd64` and `arm64`;
- a combined SHA-256 manifest covering retained downloadable artifacts;
- a GitHub prerelease that remains distinct from final release publication.

No armv7 node-agent package is produced by this workflow. Do not infer Raspberry Pi model support from “Linux” or “ARM” alone.

## Verify a download

1. Select one exact tag or prerelease.
2. Download the artifact and the checksum manifest from that same release.
3. Verify the SHA-256 digest before installing.
4. Preserve the version, architecture, digest, and installation result in commissioning records.
5. Validate the installed binary or image reports the expected version and commit.

A successful checksum proves byte identity with the published artifact. It does not prove clean-machine installation, target-hardware support, integration compatibility, or live-show acceptance.

## Container images

Published-image installation is available only after the selected tag has actually completed the registry publication workflow. Digest-pin production deployments so a later tag or mutable alias cannot silently change the installed bytes.

When no suitable tagged artifact exists, use the documented source-build path rather than presenting a development image as a release.

## Native agents

Native agent packages are architecture-specific. Install the package matching the host architecture, verify its checksum, and then run the node installation and capability checks. A package produced by CI is not evidence that the installation's audio interfaces, NDI stack, PTP clock, or service permissions work on that host.
