# ADR 0028: identity-bound requests and lifecycle hardening

Status: Accepted; former multi-organisation lifecycle rules are superseded by
[ADR 0047](0047-single-organisation.md).

## Decision

HTTP refresh retries remain bound to their original actor. Cross-tab account changes
discard stale cached identity state. Angular reuses routes only when path parameters
match, preserving query-based list navigation while destroying entity drafts after
approved navigation.

Privileged accounts require user-verified passkeys under the configured policy. Persist
factor verification time and passkey proof separately from session creation and generic
MFA. MFA policy changes require recent proof. Account challenge consumers acquire the
account lock before challenge rows.

Idempotency records bind the actor, payload hash, and response subject. Privacy erasure
retains only a payload-free tombstone until idempotency expiry. Storage providers enforce
opaque-key validation. Retention claims rows with replica-safe locks, persists bounded
failure backoff, and commits each object independently.

Billing exposes cancellation eligibility separately from storage entitlement.
Reconciliation uses bounded concurrency, deduplicates provider receipts, audits changed
facts, and retires confirmed settled cancellations.

## Consequences

Keep two administrator passkeys on separate devices and another active administrator.
External delivery remains at least once. Provider sandbox verification, browser
acceptance, and production recovery remain separate from local integration checks. See
[Security](../security.md) and [Deployment](../deployment.md).
