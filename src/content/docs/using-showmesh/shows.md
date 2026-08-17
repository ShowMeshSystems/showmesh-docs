---
title: Shows
description: Manage revisioned show objects and the active-show pointer.
---

A show is a revisioned configuration object with a stable ID, name, and notes. Updating it creates a full replacement revision; previous revisions remain inspectable.

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

Activation stores a revisioned `show.active` pointer. The asset manifest uses the active show to determine what declared nodes should hold.

Activation does **not** start playback, schedule FPP, select a Resolume composition, or begin rendering. Put implemented device operations in actions/macros and test those separately.
