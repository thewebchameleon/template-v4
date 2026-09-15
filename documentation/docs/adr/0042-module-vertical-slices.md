# ADR 0042: module ownership and vertical slice source layout

Status: Accepted

## Context

Module behavior was grouped partly by technical layer and partly in broad files
combining requests, validators, models and multiple operations. Frontend pages and
their module-specific services were separated, and private module folder casing
was inconsistent. A change to one workflow required searching unrelated areas.

## Decision

Use the [module layout convention](../module-layout.md): module first, then cohesive
business concern or use case. Private module roots and backend/test subfolders use
PascalCase, including `Frontend`, `Tests`, `Docs`, `Tools` and `Contracts`. Inside
`Frontend`, folders remain lowercase/kebab-case. Module IDs stay kebab-case.

Retain foundation package/layer boundaries and private build-time composition from
ADRs 0001 and 0032–0034. Foundation modules use matching folders inside those
projects; the Angular host groups owned code under `features/<module>`.

Separate request/validator/handler groups by operation. Large existing services may
use partial operation files to preserve constructor dependencies, shared policy,
registration and transaction ownership without a behavior rewrite. Small cohesive
files stay intact. This change does not replace public integration interfaces or
require a new handler, service, assembly or abstraction for each file.

HTTP module adapters live under `TemplateV4.Http/<Module>`; shared endpoint
composition/security stays in `Endpoints`. This updates the source-location rule
in ADR 0013 while retaining its thin-adapter and explicit-registration requirements.

Module-specific persistence types move beside their owners. Foundation model
composition and every existing migration, namespace and migration history remain
unchanged. Runtime disablement and dependency/permission gates retain their meaning.

## Consequences and enforcement

Use matching module and operation names to trace behavior across layers. Keep new
scaffolds, discovery, descriptor paths, tests, package inputs and documentation in
sync. Verify exact private folder casing on every platform and compile both
foundation and selected private modules. Preserve existing public names and wire
contracts when performing source moves. Apply integration and frontend checks from
the verification guide; browser tests still require user permission.
