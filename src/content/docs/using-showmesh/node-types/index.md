---
title: Node Types
description: Understand ShowMesh's capability-based node roles and the shared native-agent foundation.
pageType: concept
maturity: experimental-active
---

“Node type” is useful operator shorthand, but ShowMesh does not store a fixed type such as `render` or `audio` on a node. A node runs the native ShowMesh agent and advertises a set of versioned **capabilities**. The coordinator uses those capabilities, configuration assignments, and current evidence to decide what the machine can do.

This matters because hardware roles can evolve without changing the node identity model. A machine may eventually provide more than one compatible role, and transport support can vary independently. For example, a render node might advertise NDI send without HDMI output; support for one is never evidence for the other.

## Shared agent foundation

Every native node starts with the same available agent functions:

- a stable node ID, label, platform, agent version, and boot identity;
- retained hello and capability advertisement through MQTT;
- heartbeat and last-will evidence for control-plane health;
- an allowlisted command channel with recorded outcomes;
- node-local asset inventory, hash-verified asset fetching, and readiness reporting.

Those functions make a machine visible and manageable, but they do not make it a media node by themselves. The agent can detect its supported GStreamer/NDI path, but it does not render pixels or play audio until a compatible media role is configured and commissioned.

## Approved roles

| Role | Purpose | Current maturity |
| --- | --- | --- |
| [Render node](./render-nodes/) | Follow the FPP timeline, extract a surface from node-local FSEQ data, and send video to a configured output transport. | Experimental — hardware commissioning required |
| [Audio node](./audio-nodes/) | Play and mix node-local audience audio, provide controlled fades and announcements, and generate LTC on a discrete same-clock output. | Experimental software; physical-output commissioning required |

These are workload profiles, not exclusive machine classes. ShowMesh should only assign a role when the node advertises the required capabilities and its fresh evidence satisfies that role's readiness rules.

## Capabilities are not roles

The capability vocabulary includes media work such as rendering or audio, shared services such as media caching and process supervision, and output features such as NDI send, HDMI, local audio, FM, or LTC. An output capability describes one thing the node can do; it does not create another node type.

Capability advertisement is evidence, not a wish list. Do not manually advertise a capability simply because the hardware is intended to support it. The implementation must actually provide the behavior, and operational readiness may require additional live checks.

## What is not a node type

- The **coordinator** is the management plane, not a media node.
- **FPP** and **Resolume Arena** are integrations with their own configuration and evidence. Installing either application does not automatically create a native ShowMesh node.
- Projectors, displays, amplifiers, relays, and similar equipment are **controlled devices**. They do not run the native agent and cannot advertise node capabilities.
- **NDI**, **HDMI**, **local audio**, **FM**, and **LTC** are transport or output capabilities, not standalone node roles.

New node roles should only be documented here after their responsibility and authority boundaries are design-approved. A possible device or integration is not enough to invent a new role.
