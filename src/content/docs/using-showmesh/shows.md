---
title: Shows
description: Manage revisioned show objects and the active-show pointer.
---

A **show** is the stable namespace for one production. It gives related surfaces, assets, actions, and macros a common show ID and gives operators a human-readable name and notes.

A show is deliberately not a giant document that contains all of those objects. Each surface, asset, action, and macro stores its own reference to the show. This lets those objects keep independent IDs and revision histories. It also means `showmeshctl show get` returns the show's name and notes, not an embedded list of everything associated with it.

Use separate show IDs when two productions need independent configuration or asset sets, such as `halloween-2026` and `winter-2026`. Use the notes field for operator context such as venue, season, or the purpose of a test configuration; it is not an execution script.

## Revisions and identity

The lowercase show ID is the durable machine-facing identity. The name and notes are revisioned display data. Updating a show writes a full replacement revision, while previous revisions remain inspectable. Renaming the display name does not change the show ID referenced by other objects.

Use the Operator UI or the CLI:

```sh
showmeshctl show list
showmeshctl show get <show-id>
showmeshctl show set --name 'Winter Show' --notes 'Main production configuration' <show-id>
showmeshctl show revisions <show-id>
showmeshctl show activate <show-id>
showmeshctl show active
```

Creating, updating, and activating shows requires `config:write`.

## What activation does

Only one show can be active. Activation stores a revisioned `show.active` pointer, and the asset manifest uses that pointer to determine which show's current assets declared nodes should hold. In practical terms, activation changes the coordinator's desired synchronization set.

Activation does **not** start playback, schedule FPP, select a Resolume composition, or begin rendering. Put implemented device operations in actions/macros and test those separately.

:::tip[Think “prepare,” not “play”]
Activating `winter-2026` tells ShowMesh which asset set should converge on nodes. It does not press play on any device.
:::
