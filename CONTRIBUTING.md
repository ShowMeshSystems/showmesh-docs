# Contributing to ShowMesh documentation

This repository is the human-facing documentation for ShowMesh: operators, users, integrators, platform developers, and contributors should be able to understand and use the current system without first reading its internal build history.

## Documentation standard

The public [Documentation standard](src/content/docs/contributing/documentation.md) is authoritative. It defines the source-of-truth boundary, page-type contracts, maturity and complexity labels, voice, safety conventions, review evidence, and automated gates.

Use the [Google Developer Documentation Style Guide](https://developers.google.com/style/) for general technical-writing mechanics when the ShowMesh standard does not make a project-specific choice.

## Source-of-truth boundary

The main [`ShowMeshSystems/showmesh`](https://github.com/ShowMeshSystems/showmesh) repository remains authoritative for implementation, OpenAPI contracts, tests, engineering specifications, ADRs, research evidence, build plans, and agent guidance. This repository translates verified behavior into usable human documentation. It does not supersede engineering truth and must not mirror the main repository's `docs/` tree.

Treat main-repository prose as a lead, not proof. Verify claims against code, tests that genuinely constrain the behavior, `api/openapi.yaml` for public HTTP behavior, compiled CLI help, and captured running-system evidence. If those sources conflict, document only what can be resolved and label the uncertainty.

## Write for the operator

- Put the working path before internal explanation.
- State prerequisites, success conditions, likely failures, and immediate fixes.
- Keep commands beside the explanation they support.
- Organize troubleshooting by symptom.
- Explain terminology on first use.
- Never add a bare `TODO` page.
- Never turn planned architecture into a runnable procedure.

Use the documented maturity vocabulary consistently: Available, Experimental — Active Development, Experimental — Ready for Testing, Planned, and Deprecated. Advanced is a separate complexity label and may accompany maturity.

## Local development

```sh
npm ci
npm run build
```

Run the project's content, schema, build, link, anchor, and asset checks defined in `package.json` before opening a pull request.

## Process intentionally deferred

Do not add an automated documentation-update workflow, linked-PR requirement, release gate, or versioned-doc archive yet. ShowMesh has not reached its first prerelease. Those mechanisms will be designed to match the product's release/versioning process rather than invented independently here.
