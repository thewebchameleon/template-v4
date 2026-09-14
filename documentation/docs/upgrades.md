# Versions and upgrades

## Organisation spelling

Organisation naming now applies to routes (`/organisations` and `/api/v1/auth/organisations`),
module and capability IDs (`organisations`, `organisation-files`), API operation/type names,
JSON properties (`organisationId`), source filenames and extension properties
(`organisationDestinations`). Update callers, bookmarks, module configuration and
`Customers:Mode=Organisations` together with the application. Regenerate both API clients
from their respective OpenAPI documents.

Stop API and worker instances before running the database migrator, then start the updated
application. The new `RenameOrganisations` migrations preserve data while renaming the
organisation schema, file table and scoped columns in CRM and invoicing; private modules own their corresponding migrations.
Stored billing ownership values and notification links are migrated too. Existing migration
names, IDs and historical files retain their original spelling so retained databases keep
their migration history. Old URLs and API names have no compatibility aliases.

## Business module discovery

Source hosts now discover `business-modules/*/module.json` during build. Adopt
`Directory.Build.targets`, `tools/discover-business-modules.mjs`, generic host
composition, and Angular's prestart/prebuild/prewatch hooks together. Node is required
on the build machine. Existing business modules need the descriptor `host` entry points
documented in [business modules](business-modules.md#automatic-discovery-contract).
Remove their manual host project references and registrations to avoid duplicates.
No schema change is required for discovery. Run the Migrator for newly added modules;
existing runtime activation choices and retained data are preserved. Package consumers
can retain explicit composition; package upgrades do not rewrite source-owned tooling.

## Toolchain and dependency refresh

The repository requires .NET SDK 10.0.401, Node.js 24.21.0, and npm 12.0.2. Run the database migrator before starting Quartz 4 workers so the additive scheduler schema update is applied. Do not run Quartz 3 and Quartz 4 workers against the same scheduler database during the rollout.

## 0.1.0 initial implementation

This is the initial framework implementation, not an audited production release. The user-management reference, rotating sessions, PostgreSQL outbox, and Worker foundation are implemented. Complete deployment-specific operational verification before calling a derived application production-ready.

Known limitations: scaffolds are explicit starting points requiring implementation and registration; the CLI does not automatically wire a full feature. SMTP is at-least-once. User-management UI exposes invitations, role updates and enable/disable. Feature-flag and storage extension points have basic implementations. Supported/default cultures are configurable within the supplied en-ZA/af-ZA resources; additional languages need resources and a manifest update. These limitations must not be represented as completed capabilities.

Use semantic versioning: breaking contracts/conventions increment major; additive compatible modules increment minor; bug/security fixes increment patch. Schema, template and scaffolding versions are tracked separately in framework.json. Deprecations must include a replacement, supported overlap period, and removal version. No automatic upgrade migrations exist yet; `upgrade` reports that without changing files.

For each release: review dependency compatibility, update pins and lockfiles, regenerate clients and migrations where applicable, run CI, update manifest and ADRs, document migration steps, and publish immutable SHA and release tags. Never silently apply destructive migrations. Upgrade pull requests should keep code, docs, scaffolding and CI changes reviewable together.

## Security and reliability revision

This revision changes UserDto/CreateUser/UpdateUser from Role to Roles and removes directory permission from Reader. Regenerate clients and adjust consumers. Apply SecurityAndDelivery, DurableJobLifecycle and DeliveryConcurrency with the migrator before deploying API/Worker. Existing sessions are evaluated against the default Administrators MFA policy; affected users must enroll. Existing refresh sessions remain revocable. Initial migration rows give LastTotpStep its default; newly enrolled accounts record their verified counter.

Apply PersistAdminBootstrapCompletion before starting the updated API. On first startup, an installation that already has an Administrator records bootstrap as completed and does not emit a token. Empty installations no longer accept Bootstrap email/password configuration: run one API replica, retrieve its per-run token from the protected console, and complete `/bootstrap` over HTTPS. Password login now names its identifier `username`; existing invited accounts continue to use their email address as their Identity username. Regenerate API clients for this contract change.

Requested jobs now use JobRun state plus reconciliation. Before upgrading an existing deployment, drain the old outbox and one-shot Quartz requests; retain audit data. New requests use the persisted lifecycle. Switching off maintenance removes the stored cron trigger on Worker startup. Do not mix old and new Workers across this contract change.

Application references SharedKernel. Keep the project when copying the repository, or use its matching NuGet package. Add custom domain-event handlers and integration-contract registration explicitly. Generated email/localisation scaffolds are runtime-connected. CLI doctor checks Node/.NET versions; upgrade remains an explicit informational command, not an automatic migration engine.

Run the PostgreSQL suite, independent package consumer and isolated browser harness before releasing. Browser traces/videos/screenshots are disabled because enrollment screens contain recovery material. Production TLS/SMTP and a timed off-host restore remain environment-specific acceptance checks.

## Delegated access upgrade

Run the database migrator before exposing Roles & permissions. It grants `roles.manage` to the protected Administrator role and revokes affected sessions. This release reuses Identity role/claim tables and needs no new schema migration. Files now require `Features:my-files:Enabled=true`; disabling the capability does not delete data. Existing profile/session/invitation URLs redirect, and emailed account-action fragment links remain valid. See [ADR 0016](adr/0016-administration-and-delegated-access.md).

## My Files upgrade

Apply `MyFilesLibrary` and `RenameMyFilesModule` with the DatabaseMigrator before starting the updated API and Worker. Existing file objects keep their keys, and the module rename preserves the stored activation setting. Change deployment overrides from `Modules:files` to `Modules:my-files` and feature overrides from `Features:files:*` to `Features:my-files:*`, including environment-specific/user/tenant settings. The browser redirects `/files` and old administrator file URLs with their query state. API clients must regenerate against `/api/v1/auth/my-files`; old personal API paths are retired. Organisation file API paths remain unchanged.

The `files` PostgreSQL schema remains in place because it also contains organisation storage. New personal versions and shares are mapped there. Downgrading after users create new versions or shares would lose their metadata; restore a coordinated database/object-store backup instead of dropping these tables on an active library.


## Foundation 0.2.0

The API endpoint assembly is now TemplateV4.Http; ApiService is a composition host.
Update host references and registrations explicitly. SharedKernel and ServiceDefaults
remain compatible contracts; use the coordinated versions for full foundation hosts.
The Angular package includes CRM, Invoicing and organisation file integration. Match
backend/frontend 0.2.x; coordinate incompatible API/schema changes in a later release.
Package updates do not update application-owned hosts, workflows, business modules,
branding or runtime configuration.

Apply retained foundation migrations first, then registered business contributors.
New CRM/Invoicing schemas and file associations are forward migrations. Vehicle
Licensing has its own migration history and is disabled by default. Back up and run
retained-database tests before production migration. Never delete/regenerate a migration.
See packages.md for the artifact-only candidate upgrade fixture and business-modules.md
for physical removal and accepted-obligation behavior.
