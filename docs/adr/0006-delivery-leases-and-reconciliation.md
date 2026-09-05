# ADR 0006: leased delivery and persisted job lifecycle

Status: Accepted

Outbox workers claim messages with a two-minute lease and a fencing identifier. SMTP runs outside a database transaction; other consumers execute database effects and inbox receipts transactionally. Completion checks the lease and uses optimistic fencing. Failures atomically relinquish the lease and assign jittered exponential backoff. Eight failures poison a message. A crashed worker's lease expires for another replica to acquire. External delivery is at-least-once: cancellation, network uncertainty and lease expiry can duplicate a send. Irreversible external effects require provider idempotency or explicit reconciliation.

Job requests become JobRun rows in the same transaction as inbox completion. A reconciler ensures each pending/retry/expired execution has a Quartz trigger. Quartz recovery is enabled, but the JobRun record is the source of truth. Four execution attempts are allowed; failures and retry eligibility are persisted together. A worker crash during recovery leaves a lease that another replica reconciles. Attempts fence stale completion. Completed database cleanup and its job outcome commit atomically. A cron dispatcher creates deterministic requests, so scheduled work follows the same lifecycle. Disabling maintenance removes the persisted cron trigger.

Administrative operations expose bounded payload-free message/job summaries and audited replay of terminal failures. Degraded readiness signals poisoned messages, old backlog or terminal job failures. Production monitoring must alert on non-Healthy readiness and scrape/check each replica. Database audit history survives replay; payloads, email action URLs and security secrets are never returned by operations endpoints.

Validation includes real PostgreSQL transaction, inbox, persistence and reconciliation tests. Off-host backups and restore drills are necessary for single-server failure; replicas on one server are not disaster recovery.
