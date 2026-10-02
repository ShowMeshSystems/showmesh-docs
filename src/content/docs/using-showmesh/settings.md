---
title: Settings
description: Map the installation-wide configuration pages and separate declared settings from observed evidence.
pageType: concept
maturity: experimental-active
---

Settings records installation-wide desired state. Use Monitor and current observations to verify that runtime state matches it.

## Pages

| Page | Purpose |
| --- | --- |
| **Connections** | FPP endpoints, integration MQTT, and related connectivity configuration. |
| **Node enrollment** | Create, list, and cancel one-time node enrollment codes. |
| **Content delivery** | Asset and FPP Connect delivery behavior. |
| **Render recovery** | Render settings and recovery policy. |
| **Appearance** | Browser-local display preferences. |
| **Audio defaults** | Engine-wide drift, gain, fade, announcement, and LTC defaults. |
| **Node routing** | Per-node audio routes, PipeWire targets, channel placement, output latency, and node clocks. |
| **Mode** | Program Mode or Show Mode. |
| **Resolume** | The configured Resolume instance, composition, and recovery behavior. |
| **Access** | A separate page for principals and credentials, linked from Settings. |

## Revisioned configuration

Most settings are revisioned full replacements. Read the current object before editing and preserve fields you do not intend to change. Revision checks prevent stale editors from overwriting a newer save. A rollback creates another revision; it does not erase history.

## Node routing

Node routing edits two objects: `audio.node` selects roles, routes, channels, output backend, clock domain, and output latency; `node.clock` selects managed, external, or FPP PTP behavior. Live reports show what the node currently observes.

Channel selectors use the outputs the node reports, with manual entry for older agents. `showmeshctl audio node choices <node-id>` shows the same program and LTC choices. A refused audio setting appears as a warning on Settings Audio and Node Detail.

ShowMesh refuses configuration that contradicts required capability evidence. A saved route or clock provider does not prove the output is present, locked, or aligned.

## Connection state

Connections includes plugin code pairing, brightness ceilings, and observed player brightness.

Connection pages separate configured endpoints from observed reachability. Unavailable, stale, failed, and never observed are different states.

## Permissions

Settings writes generally require `config:write` and are administrator-only. Read-only operational pages may remain visible to viewers or operators while editor controls stay unavailable.

See [Access and permissions](../access-and-permissions/) for role boundaries and [Show Mode](../show-mode/) for the operating-mode contract.
