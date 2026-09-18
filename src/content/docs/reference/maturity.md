---
title: Maturity and complexity
description: Stable meanings for capability maturity and reader complexity across public documentation.
pageType: reference
maturity: experimental-active
---

Maturity describes whether documented functionality is available and stable enough to use. Complexity describes the knowledge or operational care expected from the reader. They are separate dimensions.

These labels describe public documentation. They do not replace the product release lifecycle.

## Maturity

### Available

Implemented, supported for current use, and suitable for normal users in the documented development state. Available does not claim show-hardware validation unless the page says so separately.

### Experimental — Active Development

Implemented enough to exist or be exercised, but still changing materially. Behavior, configuration, or interfaces may move. Readers must not depend on stability.

Experimental features might not yet have been tested with the hardware used in your installation.

### Experimental — Ready for Testing

Substantially complete for its current scope and intentionally available for real-world testing and feedback, but not yet broadly supported or stable.

Experimental features might not yet have been tested with the hardware used in your installation.

### Planned

Functionality that is not available and has not started active development.

### Deprecated

Still present but not appropriate for a new deployment. State the replacement and the migration or removal expectation.

## Complexity

### Advanced

Available or experimental functionality that assumes deeper ShowMesh or system knowledge, carries unusual operational risk, or exposes a low-level integration surface. Advanced does not mean unstable. It can accompany Available or either Experimental maturity; do not combine it with Planned.

Ordinary pages do not need a “Standard” badge. Omission means the page is written for its stated audience without an additional complexity warning.

See the [documentation standard](../../contributing/documentation/) for authoring and review rules.
