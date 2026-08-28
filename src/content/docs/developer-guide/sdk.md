---
title: SDK roadmap
description: What does not exist yet, and the stable surface to use in the meantime.
pageType: roadmap
maturity: planned
---

ShowMesh does not currently ship a supported SDK, generated client package, plugin ABI, or provider development kit.

Today, build against the versioned HTTP API and its OpenAPI description. For live state, use the documented Server-Sent Events bootstrap and reconnection rules. Keep generated or handwritten clients tolerant of additive response fields.

Future SDK work is expected to cover typed API clients, authentication helpers, stream state management, and supported extension APIs. Exact languages, package names, lifecycle rules, and compatibility guarantees have not been selected. Do not publish an internal package as “the ShowMesh SDK” or design production dependencies around coordinator internals while this status remains Planned.
