# Deployment and operations

Production uses the Web, API, Worker, Migrator, PDF renderer, and PostgreSQL workloads. Web is the only
public service; it serves Angular and proxies `/api` on the same origin. AppHost,
`compose.yaml`, development certificates, and Mailpit are local-only.

Commercial Billing issues invoice PDFs through the private `pdf` renderer service
(Gotenberg). API needs `Pdf__RendererUrl` set to its internal HTTP address; the provided
Compose files configure this. Keep the renderer off the public network. Issuing an invoice
or recording a balance change fails if PDF conversion fails, so a document and its saved
PDF version stay aligned. PDF versions are retained in PostgreSQL and belong in database
backups. Invoice email delivery uses the Worker and SMTP settings.

## Deploy

1. Check out the intended public repository revision on the deployment server.
2. Follow the maintained EasyPanel guide at `deploy/compose-platforms/README.md` or the
   Coolify guide beside it.
3. Supply every setting in `deploy/compose-platforms/.env.example`, including a strong
   database password, production RSA signing key, SMTP credentials, public origins, and
   private S3-compatible storage credentials.
   PostgreSQL, Migrator, API, and Worker all use the `postgres` login with
   `POSTGRES_PASSWORD`. This simplifies deployment but gives application processes
   database administrator privileges. Keep the database network private and protect
   that password. Existing databases retain any previously created runtime roles;
   the application no longer uses them, and PostgreSQL does not rerun initialization
   scripts for an existing volume.
4. Expose only Web port 8080 through platform-managed HTTPS. Keep API, Worker, Migrator,
   PostgreSQL, health endpoints, and telemetry private. Preserve WebSocket upgrades.
5. Run Migrator to completion before API and Worker. Deployments with private modules use
   `deploy/private-module-deploy.sh` for the coordinated build and migration. For a new installation, start one
   API replica, retrieve the one-time token from protected logs, complete `/bootstrap`,
   confirm it is disabled, and then scale out.

Protect and back up PostgreSQL, object storage, signing keys, and the Data Protection key
ring and wrapping certificate. Never use `docker compose down -v` on retained data.

## Upgrade

Before each update, read the release notes and diff `framework.json`, manifests,
generated contracts, environment examples, and migration sets. Back up and verify a
restore path, enable maintenance mode, drain and stop old API/Worker instances, deploy
the coordinated release, run Migrator once, then start and check the workloads. Do not
mix incompatible Worker or scheduler versions.

Use expand/contract migrations where mixed-version operation is required. Never delete,
rename, or regenerate an applied migration. There are no automatic source upgrades;
client-owned changes remain reviewable changes in the client repository.

Privileged accounts can use email, authenticator, or passkey MFA by default. Existing
deployments with `Security__RequireAdministratorPasskey=true` (or
`REQUIRE_ADMINISTRATOR_PASSKEY=true` in local Compose) keep the passkey-only rule until
the setting is explicitly changed. Accounts with setup-only sessions from the old default
must sign in again and complete an eligible MFA challenge. Confirm SMTP delivery before
relying on email MFA.

## Observe and recover

Monitor private `/health/ready` endpoints, the public origin and certificate, database
capacity, failed/poison work, oldest pending delivery, and stale telemetry. Configure
`OTEL_EXPORTER_OTLP_ENDPOINT` for the deployment's collector. A healthy process is not
proof that delivery is ready.

Outbox and job delivery are at least once. Investigate the provider or handler failure
before an audited replay because external effects may duplicate. Pausing a schedule
prevents new admissions but does not cancel accepted work.

Keep encrypted off-host backups and perform isolated restore drills. The repository's
`tools/restore-drill.ps1` verifies PostgreSQL only; a complete drill also restores keys
and object storage, signs in, reads a private file, runs a queued job, and measures backup
age and total recovery time.

## Troubleshooting

| Symptom | First check |
| --- | --- |
| Migrator fails | Stop workloads, inspect the first migration error, and confirm the target database and migrator role. Do not alter migration history. |
| API is not ready | Check PostgreSQL, completed migrations, credentials, and private readiness output. |
| Worker is not ready | Check PostgreSQL, Quartz state, poison messages, pending backlog, and expired leases. |
| Email/job repeats | Confirm consumer/provider idempotency; a crash after an external effect can cause redelivery. |
| New release has stale API calls | Export OpenAPI and regenerate the owning client; do not patch generated files. |
| Files fail in production | Check private S3 reachability, credentials, quota, and persistent key/storage permissions. |
| Bootstrap is unavailable | It is one-time only; check whether an Administrator already exists. Do not reopen it. |
| Login or cookies fail behind proxy | Verify the public HTTPS origin, trusted forwarded headers, same-origin proxying, and persistent shared Data Protection keys. |

Do not log credentials, authorization headers, action URLs, tokens, message payloads, or
private file content while diagnosing failures.
