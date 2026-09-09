# Versions and upgrades

## Toolchain and dependency refresh

The repository requires .NET SDK 10.0.401, Node.js 24.19.0, and npm 11.19.1. Run the database migrator before starting Quartz 4 workers so the additive scheduler schema update is applied. Do not run Quartz 3 and Quartz 4 workers against the same scheduler database during the rollout.

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

Run the database migrator before exposing Roles & permissions. It grants `roles.manage` to the protected Administrator role and revokes affected sessions. This release reuses Identity role/claim tables and needs no new schema migration. Files now require `Features:files:Enabled=true`; disabling the capability does not delete data. Existing profile/session/invitation URLs redirect, and emailed account-action fragment links remain valid. See [ADR 0016](adr/0016-administration-and-delegated-access.md).
