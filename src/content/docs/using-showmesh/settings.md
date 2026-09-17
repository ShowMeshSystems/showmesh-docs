---
title: Settings
description: Map the installation-wide configuration pages and separate declared settings from observed evidence.
pageType: concept
maturity: experimental-active
---

Settings owns installation configuration. Saving a setting records desired state; Monitor, node reports, integration observations, and command outcomes show whether runtime state matches it.

## Pages

| Page | Purpose |
| --- | --- |
| **Connections** | FPP endpoints, integration MQTT, and related connectivity configuration. |
| **Content delivery** | Asset and FPP Connect delivery behavior. |
| **Render recovery** | Render settings and recovery policy. |
| **Appearance** | Browser-local display preferences. |
| **Audio defaults** | Engine-wide drift, gain, fade, announcement, and LTC defaults. |
| **Node routing** | Per-node audio routes, PipeWire targets, channel placement, output latency, and node clocks. |
| **Mode** | Program Mode or Show Mode. |
| **Resolume** | The configured Resolume instance, composition, and recovery behavior. |
| **Access** | A separate page for principals and credentials, linked from Settings. |

## Revisioned configuration

Most settings are full-replacement revisioned objects. Read the current object before editing it and preserve fields you do not intend to change. Revision preconditions prevent one editor from silently overwriting another editor's newer save.

Use revision history for inspection and deliberate rollback. A rollback is a new active revision, not deletion of history.

## Node routing

Node routing combines several related but separate objects:

- `audio.node` chooses roles, routes, channels, sink backend, PipeWire target, clock-domain declaration, and output latency;
- `node.clock` chooses managed, external, or FPP PTP behavior;
- live capability and clock reports show what the node currently observes.

Configuration is refused when it contradicts current required capability evidence. A saved route or clock provider does not prove the output is present, locked, or aligned.

## Connection state

Connection pages distinguish configured endpoints from observed reachability. Preserve unavailable, stale, failed, and never-observed states rather than replacing them with one generic offline state.

## Permissions

Settings writes generally require `config:write` and are administrator-only. Read-only operational pages may remain visible to viewers or operators while editor controls stay unavailable.

See [Access and permissions](../access-and-permissions/) for role boundaries and [Show Mode](../show-mode/) for the operating-mode contract.
