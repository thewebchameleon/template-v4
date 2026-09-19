# ADR 0015: platform administration, files and privacy workflows

Status: Accepted; file ownership, quota, and lifecycle are updated by
[ADR 0048](0048-unified-organisation-files.md) and
[ADR 0051](0051-platform-core-and-file-library.md).

## Context

The platform had durable delivery, audit entries, account actions and a file-provider contract, but lacked complete operator and personal workflows. This change adds usable interfaces while keeping Identity and provider concerns outside Application.

## Decision

- Audit queries use an explicitly registered Application query, validator and handler. The existing `settings.manage` permission controls audit history, operations and privacy reviews. Invitations use `users.manage`. Notifications and privacy operations are scoped to the authenticated actor, never a caller-supplied owner.
- Identity-dependent account workflows stay in focused Infrastructure services. HTTP endpoints remain adapters. Notification and file use cases coordinate EF/provider effects in Infrastructure; future provider-independent business policies belong in Application. No generic repository or runtime service lookup is added to Application.
- SeaweedFS is the recommended self-hosted S3 implementation (Apache-2.0). Local development uses a pinned single-node container. Production uses an HTTPS S3 origin, private bucket and explicit credentials. The local filesystem provider remains available for tests and small installations. `IFileStorage.Delete` is an idempotent provider operation; custom providers must implement it when upgrading.
- Every upload uses the organisation-wide storage admission contract before writing an opaque object key. Reservations are not downloadable. Failed uploads, retained trash, and accepted cleanup remain durably accounted for until provider deletion succeeds. No transaction is claimed across S3 and PostgreSQL; retries must be safe.
- Upload bounds and the organisation quota are versioned storage settings. Downloads use attachment disposition, `application/octet-stream`, `nosniff`, and private storage unless an explicit public-link contract applies. Type validation is not malware scanning; a scanning extension must run before publishing content.
- Notifications store a known translation key and internal route, not arbitrary HTML or message payloads. Security notifications are persisted with the outgoing event in the caller's transaction. Optional email defaults off and is checked at delivery time; security, verification and recovery mail is mandatory. Worker completion notifications are committed with their job result.
- Deletion requires administrator review. A user can withdraw while pending; reviewers cannot process their own account. Approval takes the administrator lock and the target account lock, protects the last active administrator, anonymises Identity/profile data, removes credentials/sessions and notifications, and tombstones files atomically. Audit identifiers remain for accountability. No automatic audit purge is enabled. Deployment owners must define backup retention and any legal holds before approving requests.
- Email changes require the existing password/MFA proof policy and verification at the new address. The old address is notified. The pending address and token are encrypted; the browser link contains only a random challenge in its fragment. Confirmation locks the account before the challenge, verifies the security stamp, changes the email address and revokes sessions atomically. Username changes use the same password/MFA proof policy, enforce a unique bounded sign-in name, retain the current session and revoke other sessions atomically.
- Shared page headers, resource states, confirmation dialogs and URL query state form the Angular page baseline. Rich table cells use the existing TanStack/Spartan composition. Destructive UI actions name the affected record and explain the consequence. Draft forms and selected uploads have route and unload protection.

## Consequences

The manifest, migration, generated API contracts and both cultures expand together. Existing audit history and accounts remain valid; invitation timestamps are known for newly created/resend invitations and unknown for older invitations. A deployment needs a migrator run before these workloads, S3 credentials and a private bucket. Rolling back the new schema destroys new feature data and requires a backup plan.

## Enforcement and extension points

See [Architecture](../architecture.md), [Security](../security.md), and
[Deployment](../deployment.md). Test authorization, replay, quota, cancellation, and
privacy with real PostgreSQL. Exercise S3-compatible behavior against the configured
provider. Browser tests require explicit user permission before local execution.
