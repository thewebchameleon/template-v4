# Business module integration

TemplateV4 is the public foundation. Private business modules are checked out separately
at `business-modules/`, which is ignored by the foundation repository. A public clone
builds without that directory, private credentials or any business modules.

Each client has a separate deployment and PostgreSQL database. Shared modules use
configuration for client differences. Client-specific extension modules depend on
public application contracts; they never fork shared module implementations or query
another module's tables. CRM, Invoicing and organisation Files remain foundation features.

## Select a client build

The canonical client file is ignored `client-modules.json`:

```json
{
  "schemaVersion": 1,
  "foundation": { "support": false, "billing": false },
  "privateModules": []
}
```

The catalog's `category` is `core`, `foundation`, or `private`. Core services retain
existing presets/settings and permissions. Only optional foundation IDs (My Files,
support, CRM, invoicing, billing) are accepted in `foundation`. Omitted settings retain
preset defaults; supplied settings override the preset, while runtime configuration can
further restrict them. A client exclusion cannot be overridden by `Modules:<id> = true`.
Dependency violations fail generation or startup.

The selector edits only `privateModules`, preserving `foundation`. Run
`node tools/discover-business-modules.mjs` after manual client-file edits and before
restore. It generates `business-modules.enabled` and frontend registration. Backend
validation rejects stale generated selection and compiles foundation choices into
all executable hosts before service registration. Foundation modules remain compiled;
private build exclusion is unchanged. Public clones default to no private modules.

For an older checkout, copy the IDs from `business-modules.enabled` into the client
file's `privateModules` array before first regeneration. Preserve the client file with
private release configuration; the generated allowlist is not a second source of truth.
Administration exposes only deployment-available modules supporting runtime activation.
No category change deletes stored activation, schema history or business data.

For interactive setup, clone the private repository inside the template as
`business-modules/`, then run this command from the template root using PowerShell 7
(or pass the script's absolute path from another working directory):

```powershell
pwsh -File ./tools/configure-business-modules.ps1
```

The menu marks current selections and accepts multiple comma-separated numbers.
Enter keeps the selection, `none` removes all modules from the next build, and `q`
exits without changes. Required business dependencies must also be selected; invalid
selections are rejected before saving. The script offers to restore dependencies and
build after saving, and stops on command failures. It never deploys, runs database
migrations, deletes module source or changes runtime activation.

To reinstall a removed module, rerun the menu and select it again. Deploy fresh builds
against the same retained database and run the Migrator; existing records and activation
choices remain. Before deploying a removal, resolve outstanding work and retained-data
access. Use a clean release workspace to prevent stale build outputs from being deployed.

Check out the private repository at `business-modules/` and pin an immutable commit.
From the foundation root run:

```sh
node tools/select-business-modules.mjs reports client-accounting
```

Use the actual module IDs owned by your private repository. The command validates the
selection and updates only `privateModules` in ignored `client-modules.json` and generates
`business-modules.enabled`, one ID per line. Calling it
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

Follow the [vertical slice layout](module-layout.md) for module-owned use cases,
frontend code, tests and folder casing.

Each direct child module owns `module.json`, `Domain/`, `Application/`,
`Infrastructure/`, `Api/`, `Frontend/`, `Tests/`, migrations and documentation. API and
Infrastructure must each contain exactly one project. The descriptor ID matches its
folder, with `required: false`, `runtimeConfigurable: true` and `enabledByDefault: false`.

The `host` object names typed entry points: `configure` accepts
`WebApplicationBuilder`, `map` accepts `WebApplication`, `services` accepts
`IServiceCollection` and `IConfiguration`, and `feature` names a `FoundationFeature`
export from `Frontend/public-api.ts`. Registration is compiled trusted source, not
runtime plugin loading. A newly copied module is not loaded by a running application.

`FoundationFeature` contributes routes, translations, destinations, organisation links,
CRM actions and optional `moduleIcon` metadata. Labels use the module ID and
`<id>ModuleHelp` translation keys. Icons must be registered through the existing icon
provider. Foundation code must never branch on a private module ID.

Integration contracts include `ICrmCustomers`, `ICommercialDocuments`,
`IOrganisationAttachments` and `IMigrationContributor`.
Contracts use the deployment organisation implicitly; do not add tenant IDs or
membership checks. Shared record writes use application permissions.
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

Commercial descriptors may set `licenseRequired: true`. Generated hosts embed that
requirement and require enrolled licensing configuration. Ordinary capabilities then
apply signed use rights and dependency restrictions. Keep authorized export and
retained-operation paths outside ordinary capability gates. See
[client management and licensing](client-management.md) for deployment configuration,
expiry policies, central module ownership and validation prerequisites.

For independent module versions and package-based source delivery, use
[release updates](release-updates.md). A pinned client composition can select each
module's artifact independently and notify deployed administrators of new releases.

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

## Module settings editors

A `FoundationFeature` can supply `moduleSettingsComponent` for its own runtime module card. The component owns typed settings loading, version conflicts, retries and authorization feedback. It is instantiated only when that module is listed; its availability does not depend on the activation switch. It must not couple its load to generic activation discovery. A module with a dedicated settings page can also supply `moduleSettingsDestination` with its translated label and route; Administration displays that action beside the module's Features heading. See [administration safety](adr/0036-module-administration-safety.md). Financial integration calls require explicit invoicing permissions as well as organisation membership; see [module administration](saas-modules.md#administration-and-recovery).
