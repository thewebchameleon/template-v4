# Security and framework revision validation

Implemented interactive first-administrator bootstrap, configurable MFA policy (Optional/Administrators/Everyone), own-profile management, TOTP enrollment/recovery, optional verified passkeys, setup-only sessions, multi-role administration, account isolation, shared auth throttling, CSRF/logout coordination, invitation resend/cancel, field password errors and mobile navigation/layout fixes.

Delivery now uses outbox leases, fenced completion, persisted job requests, reconciliation, bounded jittered retries, operational summaries and audited replay. Domain event handlers and integration contracts have explicit extension registration. Core and hosting defaults can be packed independently; email and localisation scaffolds feed runtime resources. Production Compose uses Nginx, separate database roles, mounted secrets, workload probes and longer drain periods. CI includes package/browser checks and package release publication.

Validation performed locally:

- 25 backend tests passed using real PostgreSQL where applicable. Coverage includes one-time bootstrap completion and HTTP protections, authorization/own-profile isolation, single-use MFA challenges/recovery codes, challenge expiry, setup-session preservation, TOTP reference values, multi-role directory pagination, shared concurrent throttling, refresh reuse, transactional rollback, delivery leases, scheduler persistence and stranded-trigger reconciliation.
- Full solution Release build passed with zero warnings/errors; Angular production image builds passed.
- Playwright Chromium flow passed against two API and two Worker replicas: required enrollment, virtual passkey registration/sign-in, multi-role invitation state, MFA policy update, authenticator enrollment, recovery-code sign-in and persisted logout.
- Automated axe scans passed for bootstrap, login, user management, admin settings and profile in those flows. Keyboard skip-link focus and 390-pixel page containment passed.
- Frontend lint/format and Spartan healthcheck passed. Manifest/CLI tests and independent NuGet consumer passed. NuGet and npm audits reported no known vulnerabilities at validation time.
- Production Compose schema and Nginx TLS configuration syntax validated with a temporary test certificate.

Not claimed by these checks: full manual WCAG 2.2 AA conformance, physical authenticator/platform interoperability, a live production rollout, real SMTP delivery, public certificate renewal, or a completed off-host restore drill. Production database role provisioning and secret mounts must be exercised on the target server before traffic is routed there. CI/release workflows were edited but not executed remotely. Packages were built locally, not published during this task.

See production.md for deployment inputs and upgrades.md for migrations and the old-Worker drain requirement. Keep recovery-factor loss handling governed separately; no administrator MFA-bypass endpoint is provided. External effects remain at-least-once and require application/provider-specific idempotency for irreversible work. Scaffolds are explicit starters, not automatic feature enablement or automatic upgrade migrations.
