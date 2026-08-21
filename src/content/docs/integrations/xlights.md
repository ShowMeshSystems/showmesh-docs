---
title: xLights
description: Planned xLights and FPP Connect integration boundary.
pageType: integration
maturity: planned
---

:::note[Planned]
ShowMesh does not currently accept an xLights FPP Connect upload or translate one into ShowMesh shows, surfaces, assets, or FPP deployment operations.
:::

The intended integration area is an ingestion workflow that can reuse xLights/FPP Connect metadata without making public documentation invent a format prematurely. Until that work is implemented and verified:

- continue using xLights/FPP Connect directly for FPP deployment;
- configure ShowMesh FPP endpoints independently;
- upload ShowMesh assets through its current asset UI/API only when you specifically need ShowMesh asset readiness;
- do not point existing FPP Connect automation at ShowMesh.

This page will eventually cover supported xLights versions, import mapping, conflict behavior, and an observed end-to-end deployment result.
