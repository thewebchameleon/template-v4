# Module ownership and existing reference workflows

Foundation modules remain in the coordinated packages and shared `FrameworkDb`.
Deployment/runtime disabling is sufficient for client composition; splitting each
feature into packages or contexts is not the default. Follow the
[source layout](module-layout.md) within those boundaries.

## Explicit composition

`Infrastructure/Registration.cs` owns shared hosting, Identity, provider and
transaction setup, and explicitly calls module registration methods.
Module services, handlers and validators belong in
`Infrastructure/<Module>/<Module>Registration.cs`. These files contribute private
`Add<Module>` methods to the existing partial `Registration` class. This keeps the
public `AddInfrastructure` entry point stable without adding a lifecycle framework.

Register services regardless of activation. Gates stop new work; retained documents,
privacy cleanup, accepted messages and recovery may still need a disabled module's
services and mappings. Preserve lifetimes and shared scoped instances when exposing
one store through multiple contracts, as CRM and Invoicing do.

Application permission constants live in `<Module>/<Module>Permissions.cs`, using
the existing partial `TemplateV4.Application.Users.Permissions` type. New names
should identify their module to avoid collisions. `Access/Permissions.cs` explicitly
composes `Permissions.All`; it also retains access-management's own declaration.
The API policy registration, access catalog and Migrator consume that same list.
Adding a declaration requires adding it to the list and reviewing grant policy.
The Migrator still owns built-in role synchronization, audit and session revocation;
delegated roles receive no automatic grants. Disabling a module does not revoke its
permissions or remove them from the catalog.

## Use existing workflows as references

Choose a workflow that matches the feature being implemented. These are real
product modules, with their existing business scopes and tests:

| Need | Existing workflow | Starting points beneath `src/` |
| --- | --- | --- |
| Explicit handler/validator registration and delegated permission | Support category editing | `TemplateV4.Application/Support/Categories/SaveSupportCategory.cs`, `TemplateV4.Infrastructure/Support/SupportRegistration.cs`, `TemplateV4.Http/Support/SupportEndpoints.cs` |
| Public reads, protected editing and runtime gates | CMS publishing | `TemplateV4.Infrastructure/Cms/Articles`, `TemplateV4.Infrastructure/Cms/Blog`, `TemplateV4.Application.Tests/Cms/CmsTests.cs` |
| Organisation isolation and public integration contracts | CRM records | `TemplateV4.Application/Crm/Contracts`, `TemplateV4.Infrastructure/Crm/Records`, `TemplateV4.Application.Tests/Invoicing/CommercialTests.cs` |
| Cross-module calls and obligations retained after disablement | Invoicing | `TemplateV4.Infrastructure/Invoicing/InvoicingStore.cs`, `TemplateV4.Application/Invoicing/Contracts`, `TemplateV4.Application.Tests/Invoicing/CommercialBoundaryTests.cs` |

Support is requester/agent scoped; do not copy it as an organisation-isolation
example. For organisation workflows, use CRM's live membership checks. Frontend
counterparts live under `TemplateV4.Angular/src/app/features/<module>`; follow their
existing generated client, translations and destination gates.

## Boundary checks

Modules call each other through Application contracts or versioned events. Do not
inject another business module's store or query its entity types directly.
Shared foundation facilities (Identity, audit, storage, access and transactions)
remain explicit dependencies; the shared model composition is still responsible for
including every module's mappings.

`ModuleOwnershipTests` uses the pinned SDK's C# compiler to resolve references among
CMS, CRM, Invoicing and Support Infrastructure source. It catches aliases,
fully-qualified implementation references and typed entity access, and checks that
every permission declaration appears exactly once in the catalog. A synthetic
violation checks that the boundary detector actually rejects forbidden access.
Add another module to that focused check when establishing its business boundary.
The check does not inspect raw SQL strings, runtime reflection or replace isolation
tests; review those paths and test data access against PostgreSQL.

The existing assembly tests retain Domain/Application dependency restrictions.
Avoid a new repository abstraction or separate database context just to satisfy a
source boundary: use an existing contract or introduce a focused operation contract
where an actual integration needs one.

## Scaffolding and validation

`node tools/framework.mjs new module Reports` now creates module-owned registration
and permission declarations along with the existing disabled scaffold. Review and
explicitly compose them before exposing the feature. `new feature` puts the new
permission in its owning module and describes how to extend that module's registration.
Neither command silently grants permissions or activates an unfinished feature.

Use the CLI regression tests and manifest validation after scaffold changes. Run
`ModuleOwnershipTests`, affected builds and existing workflow tests after conversions;
use real PostgreSQL for persistence, sessions and messaging. Browser/E2E tests still
follow the root permission policy. See [verification](verification.md) and
[ADR 0043](adr/0043-module-owned-composition.md).
