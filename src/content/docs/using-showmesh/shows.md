---
title: Shows
description: Manage revisioned show objects and the active-show pointer.
pageType: concept
maturity: available
---

A **show** is the stable namespace for one production. It gives related surfaces, assets, Cues, playlists, actions, macros, and Night Sessions a common show ID and gives operators a human-readable name and notes.

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
showmeshctl show participation get <show-id>
showmeshctl show participation set --help
showmeshctl show activate <show-id>
showmeshctl show active
showmeshctl show delete --confirm <show-id>
```

Creating, updating, and activating shows requires `config:write`.

## Participating integrations

A Show can select which configured FPP and Resolume instances participate. The value distinguishes:

- absent: participation has never been recorded;
- empty: the Show deliberately selects no instances of that kind;
- populated: only the listed instances participate.

Readiness, Dashboard filters, and attention rows use this selection so an integration configured for another production is not treated as tonight's required system.

## What activation does

Only one show can be active. Activation stores a revisioned `show.active` pointer, and the asset manifest uses that pointer to determine which show's current assets declared nodes must hold. In practical terms, activation changes the coordinator's desired synchronization set.

Activation does **not** start playback, schedule FPP, select a Resolume composition, or begin rendering. Current playback is reported separately by current runs. Put device operations in actions/macros and test those separately.

:::tip[Activation does not start playback]
Activating `winter-2026` tells ShowMesh which asset set to converge on nodes. It does not press play on any device.
:::

Deleting a Show creates a tombstone and is refused while that Show is active. It does not cascade through objects that still name the Show; resolve those references deliberately and preserve revision history.
