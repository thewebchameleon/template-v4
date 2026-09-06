# Operations and reliability

## Persistence

Only DatabaseMigrator invokes migrations. It holds a PostgreSQL advisory lock across EF migrations and seeds. API/Worker never mutate schema at startup. Run the migrator as a controlled deployment job before rolling workloads; use expand/contract migrations for compatibility. Back up and test recovery before irreversible changes. Infrastructure contains the EF migration snapshot and a versioned Quartz 3.20.1 schema derived from upstream (Apache-2.0); rollback of Quartz requires an explicit data plan.

Schemas separate app, identity, messaging, audit, and quartz. Table names are explicit; EF column names stay PascalCase. Profile GUID versions enforce optimistic concurrency. Soft deletion is available explicitly on profiles and is excluded from normal queries. Transactions are command-scoped; no generic repository exists.

## Messaging and jobs

Outbox dispatch is at least once. Rows are claimed with SKIP LOCKED; failures retry exponentially up to eight attempts, then enter poison state with an error type rather than sensitive exception text. Inspect poison rows and fix the cause before an operator resets Attempts/PoisonedAt/AvailableAt in a reviewed recovery operation. Inbox receipts suppress duplicate local processing. Remote SMTP cannot participate in a PostgreSQL transaction: a crash after send may duplicate email. The stable Message-ID assists provider deduplication but does not guarantee it. Choose a provider with idempotency support when that guarantee matters.

API job requests enter the outbox and commit before Worker creates a durable Quartz job. A stable request-derived Quartz key prevents scheduling duplicates. PostgreSQL persistence and clustering allow multiple Worker replicas. Maintenance is nonconcurrent, holds a shared advisory lock, accepts cancellation, has a 30-second timeout, skips missed cron executions, and audits completion. Failed runs do not spin in immediate refire loops. Failures are audited and rescheduled up to three times with 15/30/60-second backoff. Each execution resolves culture explicitly and returns a structured outcome. Operators can also trigger an explicit durable request. Poison messages and audit entries are not automatically removed. The administrator operations view pages messages and jobs separately, can filter to failed items, and uses stable timestamp/identifier ordering. It exposes delivery identifiers, state, attempts, availability, and bounded error codes for diagnosis; replay remains an explicit audited action. Completed durable request jobs with no remaining triggers are pruned after the configured retention. Completed outbox rows retain seven days, inbox receipts ninety days, and expired sessions seven days beyond expiry.

## Deployment

Publish Web, API and Worker separately. AppHost is local only. The shared .NET Dockerfile accepts PROJECT; the build creates the appropriate fixed entrypoint for each workload. Images run nonroot. Provision writable key/storage mounts with matching container UID permissions. Mount Angular runtime-config.json at deployment time; same-origin /api routing is the default. Nginx's CSP must be deliberately extended if selecting a cross-origin API URL.

Aspire is the default local path; Compose exposes the Web container's Nginx with a local development certificate and disposable development configuration. Mailpit is local-only. Never deploy the development manifest, environment, or bootstrap settings unchanged. Production must supply wrapping certificates, dedicated database users, durable shared key storage, platform-managed TLS, and provider credentials.

## Observability and checks

ServiceDefaults configures JSON ILogger, OpenTelemetry traces/metrics, optional OTLP export, HttpClient resilience and discovery. Logs omit message payloads; redact all outgoing HTTP headers. Liveness only checks the process; API readiness checks PostgreSQL. Worker readiness checks PostgreSQL, Quartz scheduler state, poison messages, stale pending/retry work, and expired running leases. Both degraded and unhealthy readiness results return HTTP 503 so orchestrators do not route work to a service that requires operator attention.

Tests use isolated real PostgreSQL Testcontainers, including migrations, concurrency, token reuse, rollback and outbox claims. Do not substitute EF's in-memory provider for transactional tests. CI validates schema, formatting, builds, tests, vulnerabilities, generated clients, and Docker builds. Publishing is a separate release workflow with ghcr.io and minimal token permissions.

## Recovery and production

ADR 0006 supersedes the original direct-scheduling transport design. Outbox leases fence completion; persisted JobRun records track retry/terminal state and survive scheduler interruption. See [production.md](production.md) for private monitoring, audited replay, replica deployment and backup/restore targets.
