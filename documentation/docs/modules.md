# Modules

`modules/catalog.json` defines available modules, capabilities, dependencies, runtime
configuration, and feature flags. `modules/presets/*.json` selects deployment defaults.
Those files are authoritative; this page defines ownership and composition rules.

Client-specific module choices live in the ignored `modules/client/client-modules.json`.
Start from `modules/client/client-modules.example.json`, then run
`node tools/discover-business-modules.mjs` to generate the build input
`modules/client/business-modules.enabled`. Edit the client selection, not the generated file.

## Ownership

A bundled module is a runtime switch on Administration → Modules. The five bundled
modules are CMS, CRM, Support, File Storage, and Commercial Billing. Their
source lives under `modules/Bundled/<Module>`; client modules live under
`modules/Private/<Module>`. Identity, delivery, payments, organisation storage,
notifications, operations and the other always-on facilities belong to the platform
under `src/TemplateV4.*`.

Module descriptors own registration, API and frontend contributions. The build discovers
these entry points through `tools/discover-bundled-modules.mjs`; it does not discover
arbitrary platform folders. Cross-module calls use public Application contracts.
The shared PostgreSQL database and `DatabaseSession` keep module changes, core audit
and outgoing messages in one transaction.

CMS, CRM, Support, and Commercial Billing own EF contexts and migrations under
their `Infrastructure` folders. The permanent core migration history remains
in `src/TemplateV4.Persistence/Persistence/Migrations`. It creates the historical tables;
the module baseline migrations adopt those existing schemas without recreating tables or
discarding data. Always run `TemplateV4.DatabaseMigrator` before starting hosts; it applies
core migrations first, then module contributors. Future module schema changes use the
module's context and forward-only migrations. Commercial Billing retains separate
`commercial_billing` and `invoicing` EF histories for existing data; the invoicing
migrations live under `Infrastructure/Invoicing/Persistence/Migrations`. Invoicing
source uses the corresponding Commercial Billing layer projects, with no nested
module descriptor or layer projects. File Storage owns only the optional library
routes and pages because its files, sharing, quota and retention data are core storage.

Use Support, CMS, CRM, and Commercial Billing's invoicing slice as reference
implementations. Do not create a new service, assembly, or abstraction merely to
satisfy folder shape.

## Layout

Use PascalCase module, backend, and test directories. Use lowercase or kebab-case below
`Frontend`.

```text
<Module>/
  Domain/<Concern>/
  Application/<Concern>/<Operation>/
  Infrastructure/<Concern>/<Operation>/
  Api/Endpoints/
  Worker/
  Frontend/<concern>/
  Tests/<Concern>/
```

Keep each command/query, validator, handler, endpoint, and focused persistence operation
together by use case. Preserve existing public namespaces and migration histories when
moving code.

## Adding or changing a module

1. Define the module and dependencies in `modules/catalog.json`; update presets only
   when the deployment default changes.
2. Add owned permissions and explicit registration. Register recovery dependencies that
   must remain available while the module is disabled.
3. Implement the use case through Domain, Application, Infrastructure, API/Worker, and
   Frontend only where each layer is needed.
4. Give bundled and private modules a `module.json` with build-discovered host and
   frontend entry points. Run the owning discovery/generation tools instead of editing
   generated files. Start a bundled module with `node tools/framework.mjs new module <Name>`.
5. Define disable behavior: admission stops, accepted obligations settle safely, and
   retained data remains accessible to authorized recovery workflows.
6. Update contracts, migrations, manifest, documentation, and release inputs together.

Module frontend contributions can declare `organisationDestinations` for the icon rail
and `organisationLinks` for that destination's submenu. Set `hasPanel` on a rail
destination and keep its `activePath` at the module prefix so the panel remains active
on child pages. Each submenu link supplies a segment relative to `/organisation`, a
label available in both cultures at startup, and its capability; optional `icon` and
`section` values select the link icon and a labelled submenu group. Route guards must
enforce the same capability independently of navigation visibility.

Runtime capability checks complement permissions and feature flags; none replaces the
others. Dependency-safe activation is application-wide. Financial settlement, cleanup,
and other accepted obligations continue when their optional UI capability is disabled.
The Commercial Billing switch admits new subscription and invoicing work together.
The `invoicing` capability also requires CRM; disabling CRM does not disable subscription
billing. An upgrade combines the old switches with AND, so either previously disabled
switch leaves the combined module disabled until an administrator enables it.
For deployment overrides in `modules/client/client-modules.json`, replace any old
`invoicing` key with `commercial-billing` set to the AND of the two previous values;
remove the old key before upgrading. The bundled presets already use the combined ID.

## Platform invariants

Modules can contribute dashboard cards through Application's `IDashboardCardProvider`,
registered by their owning composition method. See [editable dashboards](dashboards.md)
for the data, availability, and presentation contract.

Owners of scoped grants implement `IScopedRoleDelegation` so role assignments and
invitations cannot bypass delegation checks. `IAccessIndicators` supplies
navigation-only hints; feature operations still evaluate authoritative grants.
System action-item owners can implement `ISystemActionEligibility` to restrict
inbox and dashboard reads when reviewer authority changes. CMS uses these extension
points for [collection permissions and approval](cms.md).

Each deployment has one organisation. Shared organisation storage and quota admission
are core; the File Storage capability controls the library UI, not whether attachments
consume storage. Support features are independently configurable while retained inboxes
remain available. Payments owns provider adapters; Commercial Billing and private client
licensing are separate consumers and cannot grant each other's entitlements.
