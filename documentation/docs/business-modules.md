# Business module integration

TemplateV4 is the public foundation. Private business modules are checked out separately
at `business-modules/`, which is ignored by the foundation repository. A public clone
builds without that directory, private credentials or any business modules.

Each client has a separate deployment and PostgreSQL database. Shared modules use
configuration for client differences. Client-specific extension modules depend on
public application contracts; they never fork shared module implementations or query
another module's tables. CRM, Invoicing and organisation Files remain foundation features.

## Select a client build

Check out the private repository at `business-modules/` and pin an immutable commit.
From the foundation root run:

```sh
node tools/select-business-modules.mjs reports client-accounting
```

Use the actual module IDs owned by your private repository. The command validates the
selection and writes ignored `business-modules.enabled`, one ID per line. Calling it
without arguments selects foundation only. Never infer the selection from all folders
present. Required business dependencies must be explicitly selected; missing modules,
duplicates, invalid IDs and invalid dependency graphs fail validation.

API, Worker, Migrator and Angular use the same allowlist. Only selected backend projects
are referenced, and only selected frontend contributions and Tailwind sources are
registered. New runtime activation rows remain disabled. Deployment selection cannot
be overridden by a runtime switch. Adding/removing selections requires regenerating,
restoring, rebuilding all hosts, running migrations and deploying them together.

For a reproducible client release, retain the foundation commit, private repository
commit, allowlist, dependency locks and resulting image digests in private deployment
configuration. Use a clean checkout per client release; do not share build output or
publish directories between selections. Copy the same `business-modules.enabled` into
each Docker build context. Public CI has no selection and needs no private checkout.
Private CI checks out both repositories using its authorized credentials and makes the
selection before restore/build. Do not put tokens in source, Docker build arguments,
images or URLs. Runtime secrets are supplied separately.

Selected host NuGet lockfiles live under `.local/client-locks/`; retain those files with
the private client release configuration and restore them there before locked restore.
The public host lockfiles describe foundation-only composition. When updating a
selection, first run an unlocked restore intentionally, review and retain the new locks,
then use `--locked-mode` for reproducible builds. Frontend peer dependencies follow the
foundation's pinned npm lockfile; modules must declare additional required dependencies
in their package metadata and validate compatibility before release.

## Module contract

Each direct child module owns `module.json`, `Domain/`, `Application/`,
`Infrastructure/`, `Api/`, `frontend/`, `tests/`, migrations and documentation. API and
Infrastructure must each contain exactly one project. The descriptor ID matches its
folder, with `required: false`, `runtimeConfigurable: true` and `enabledByDefault: false`.

The `host` object names typed entry points: `configure` accepts
`WebApplicationBuilder`, `map` accepts `WebApplication`, `services` accepts
`IServiceCollection` and `IConfiguration`, and `feature` names a `FoundationFeature`
export from `frontend/public-api.ts`. Registration is compiled trusted source, not
runtime plugin loading. A newly copied module is not loaded by a running application.

`FoundationFeature` contributes routes, translations, destinations, organisation links,
CRM actions and optional `moduleIcon` metadata. Labels use the module ID and
`<id>ModuleHelp` translation keys. Icons must be registered through the existing icon
provider. Foundation code must never branch on a private module ID.

Integration contracts include `ICrmCustomers`, `ICommercialDocuments`,
`IOrganisationAttachments`, `IOrganisationObligations` and `IMigrationContributor`.
Register migration contributors regardless of runtime activation. Keep domain code
BCL-only and use separate owned contexts, schemas and permanent migration histories.

Source integration deliberately uses the documented mount at `business-modules/`:
backend projects inherit the foundation's MSBuild settings and reference foundation
projects at `../../../src/`. Angular imports `@templatev4/foundation`; the source host
resolves that public API through its alias. Moving to NuGet/npm consumption later
requires changing composition to package references, not copying foundation internals.

## Tooling and tests

`node tools/framework.mjs new business-module Reports` creates an unselected starter.
Choose its ID explicitly before building. `npm start`, `npm run build` and
`npm run watch` regenerate frontend composition; direct Angular commands first need
`node tools/discover-business-modules.mjs`. Restart watchers after changing selections.
MSBuild validates discovery and regenerates backend registration under each host's
`obj` directory. Node is a build prerequisite only.

Optional descriptor `tools` paths are relative to the module root:

- `identifiers`: a Node script invoked with the foundation root and forwarded flags.
- `clients`: an ng-openapi-gen configuration file.
- `frontend`: an ng-packagr configuration file next to `tsconfig.lib.json`.

Run `node tools/business-module-ids.mjs [--check]`,
`node tools/generate-business-clients.mjs` and
`node tools/build-business-frontend.mjs` for selected modules.
`node tools/test-business-modules.mjs -c Release` discovers module-owned test projects.
Browser tests remain module-owned and require explicit permission before execution.
Foundation tests use synthetic business examples and run without private source.

## Updates and removal

Pin foundation and business revisions together and validate both before upgrading a
client. No production configuration, credentials or real client identifiers belong in
public source. If a client later requests source, assemble only the agreed foundation,
selected modules and required dependencies; do not deliver the entire private repository
or its history, which may contain other clients' extensions.

Before removing a production module, resolve outstanding work and agree on access,
exports and retention for existing records and financial origins. Removing code does
not drop its PostgreSQL schema or migration history. Runtime disablement remains a
separate reversible operation. Keep every existing EF migration; schema corrections
use new forward migrations.

See [foundation packages](packages.md), [verification](verification.md), and
[ADR 0034](adr/0034-private-client-module-composition.md).
