# ADR 0043: module-owned registration and permission declarations

Status: Accepted

## Context

Foundation modules already have deployment and runtime gates, explicit integration
contracts and module-owned source folders. Registration and permission declarations
were still concentrated in central files. Clients need to disable foundation
features; independent packages and contexts are not required for that purpose.

## Decision

Keep the existing coordinated packages, shared EF model, permanent migrations and
public entry points. Move module registrations into module-owned partial
`Registration` files with private methods explicitly called by `AddInfrastructure`.
Keep common infrastructure setup in the central composition file. Registration is
unconditional; availability gates and retained-obligation behavior are unchanged.

Move permission constants beside their modules using the existing partial
`Permissions` type. Keep an explicit aggregate catalog and existing public constant
names/values. Central policy registration and Migrator grant synchronization continue
to consume that catalog, including audit and session revocation. There is no automatic
permission discovery or delegated-role grant change.

Use Support, CMS, CRM and Invoicing as existing reference workflows. Add focused
compiler-backed source boundary checks between those business modules and retain
PostgreSQL isolation/workflow tests. Evolve the existing module-development skill and
scaffolds instead of introducing an example product module.

## Consequences and enforcement

Changing a module usually changes its own registration and permission files; new
modules still require explicit composition. Partial types preserve the existing
public API while folders make ownership visible. No new runtime dependency or
module lifecycle protocol is introduced. Architecture tests use compiler assemblies
from the manifest-pinned .NET SDK in the test project only.

The boundary test covers typed source references for the named business modules,
not arbitrary raw SQL or reflection. Common facilities, persistence composition and
privacy workflows retain their current ownership and require their existing reviews
and behavioral coverage. See [module ownership](../modules.md) for reference
paths, scaffold behavior and validation.
