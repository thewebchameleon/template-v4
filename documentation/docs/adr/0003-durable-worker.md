# ADR 0003: PostgreSQL outbox and Worker-owned Quartz

Status: Accepted

Use PostgreSQL as the default local messaging transport with explicit versioned contracts. Worker owns clustered Quartz. API publishes durable job requests and cannot execute jobs. Use inbox receipts and deterministic Quartz identities for replay handling. SMTP remains at-least-once because an external send cannot join a database transaction. Transport and email providers are replaceable Infrastructure implementations. See outbox tests and docs/operations.md.
