# ADR 0028: identity-bound requests and complete customer lifecycle

Status: Accepted

## Decision

HTTP refresh retries remain bound to their original actor. Cross-tab account changes discard the other tabs' cached state. Angular reuses routes only when path parameters match, preserving query-based list navigation while destroying entity drafts after approved navigation.

Privileged accounts require user-verified passkeys by default. Persist factor verification time and passkey proof separately from session creation and generic MFA. MFA policy changes require recent proof. Idempotency records track actor and response subject; erasure keeps a payload-free tombstone until expiry. Account challenge consumers acquire account locks before challenge rows.

Organization invitations may provision Reader accounts through verified email/password setup independently of public registration. They never confer membership before acceptance. Owners can close organizations after payment obligations end; closure revokes memberships and invitations, retains billing references and schedules shared files for retention cleanup.

Billing contracts expose cancellation eligibility separately from storage entitlement. Reconciliation uses bounded concurrency, audits changed facts, and retires confirmed settled cancellations. Webhook receipt deduplication is separate from polling.

Storage providers share the same opaque key validation. Retention commits each object separately with replica-safe row locks, persisted failure backoff and independent metadata cleanup.

## Consequences

Deploy the ReviewHardening migration before API/Worker rollout. Old privileged sessions must prove passkey possession. Keep two administrator passkeys and another active administrator available. Organization invite emails use the durable outbox; delivery remains at least once. Closed organization billing records remain for historical obligations. Merchant verification and browser acceptance remain separate from local integration tests.

See [security](../security.md), [organizations and billing](../customer-billing.md), and [storage](../object-storage.md) for extension requirements and configuration.
