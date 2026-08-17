---
title: NDI
description: Planned NDI output boundary for ShowMesh surfaces.
status: planned
---

:::note[Planned]
ShowMesh does not currently render a surface or create an NDI source.
:::

Surface configuration accepts `output.transport: ndi` and an NDI source name. That is a validated configuration model only. There is no runtime sender, frame producer, or monitorable NDI output in this snapshot.

Do not reserve production routing on the assumption that creating a ShowMesh surface will make a source appear. Continue to configure NDI in the playback system that owns it today.

This page will eventually cover runtime requirements, source naming, discovery domains, bandwidth, frame formats, health evidence, and failover after an implementation is verified.
