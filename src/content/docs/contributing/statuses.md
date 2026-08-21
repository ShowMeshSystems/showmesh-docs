---
title: Maturity and complexity
description: Stable meanings for capability maturity and reader complexity across public documentation.
pageType: reference
maturity: available
---

Maturity describes whether documented functionality is available and stable enough to use. Complexity describes the knowledge or operational care expected from the reader. They are separate dimensions.

These labels do not replace the main repository's research evidence levels, build-track statuses, or release lifecycle.

## Maturity

### Available

Implemented, supported for current use, and suitable for normal users in the documented development state. Available does not claim show-hardware validation unless the page says so separately.

### Experimental — Active Development

Implemented enough to exist or be exercised, but still changing materially. Behavior, configuration, or interfaces may move. Readers must not depend on stability.

### Experimental — Ready for Testing

Substantially complete for its current scope and intentionally available for real-world testing and feedback, but not yet broadly supported or stable.

### Planned

Design-approved or intended future functionality that is not available. A Planned page must separate future intent from the working behavior available now. Planned material must not contain runnable steps that imply the future behavior exists.

### Deprecated

Still present but not appropriate for a new deployment. State the replacement and the migration or removal expectation.

## Complexity

### Advanced

Available or experimental functionality that assumes deeper ShowMesh or system knowledge, carries unusual operational risk, or exposes a low-level integration surface. Advanced does not mean unstable. It can accompany Available or either Experimental maturity; do not combine it with Planned.

Ordinary pages do not need a “Standard” badge. Omission means the page is written for its stated audience without an additional complexity warning.

## When labels are required

Procedures, integrations, references, and roadmaps that describe product behavior require maturity. Concepts and landing pages use maturity when the label changes how readers should interpret the subject. Governance and timeless contribution policy may omit it when no product capability is being described.

Troubleshooting pages normally inherit the maturity of the capability they diagnose and do not need a separate label unless the diagnostic path itself is experimental or deprecated.

Use `complexity: advanced` only when the warning helps readers decide whether to proceed. Do not use it as a substitute for safety instructions.

## Change a label

Do not promote maturity based on intent or task status. Verify the behavior against the documented code state and record the evidence in the pull request. If only part of a page differs, label that section with a status note rather than weakening the page-level meaning.
