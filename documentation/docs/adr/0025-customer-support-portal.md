# ADR 0025: customer support portal

Status: Accepted

## Decision

Implement Support as an optional vertical module across the existing layers, with explicit handlers and validators, a `support` PostgreSQL schema, generated migrations/contracts and lazy Angular routes. Follow the deployment and runtime gates from ADR 0023. No organization ownership is inferred: requesters own individual tickets until the customer-account design is implemented.

Requester access is ownership-based. Dedicated `support.agent` and `support.admin` permissions control triage and category administration; admin includes agent behavior. Current database memberships are authoritative. Internal messages and their counts are filtered by the persistence service, not the UI. Ticket bodies and filenames never enter audit or email payloads.

Commands own transactions. Per-actor locks coordinate accepted content with account erasure; per-ticket advisory locks and version checks serialize conversation/assignment/attachment changes. History, audit, notifications and email outbox records commit with the ticket. Queries use bounded pagination, allowlisted sorts and stable identifier ordering.

Keep bounded attachments in the module's database tables: 5 MiB per attachment, ten attachments and 20 MiB per ticket. This first release favors atomic writes, explicit ticket authorization and cascading privacy erasure over object-store scale. Downloads use attachment disposition, octet-stream and no-store; there are no public URLs or inline previews. A later object-storage implementation must preserve ownership checks, quotas, erasure and transactional staging/cleanup rather than sharing personal file identifiers.

Inactive categories remain referenced by existing tickets. Disabled modules retain data and drain accepted delivery. Account erasure removes owned tickets and authored content even while disabled. There is no SLA, automatic closure, email ingestion, private attachment channel or organization sharing in this release.

## Extension and verification

See [Support](../support.md) for workflow, setup, permissions and limits. PostgreSQL integration tests exercise isolation, transactions, concurrent saves, attachment access and privacy. OpenAPI and clients are regenerated through owning tools. Browser and accessibility tests remain opt-in under repository guidance.
