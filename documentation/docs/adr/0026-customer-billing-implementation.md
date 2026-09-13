# ADR 0026: customer accounts and subscription implementation

Status: Accepted; lifecycle and reconciliation updated by [ADR 0028](0028-review-hardening.md).

## Decision

Implement Organizations and Billing as optional vertical slices using the existing assembly boundaries and shared migration stream. Customer/membership/invitation persistence belongs to `organizations`; orders, subscription state, receipts and billing settings belong to `billing`; shared file metadata belongs to `files`. Application defines provider-neutral contracts and Domain defines membership and entitlement rules. Infrastructure owns the focused use cases, provider execution and explicit transaction boundaries. HTTP only adapts requests. BackgroundWorker owns reconciliation scheduling.

Customer operations use live membership checks. Organization mutations serialize under a membership lock, followed by a customer lock where needed. The privacy erasure path shares the membership lock, preventing erasure racing ownership transfer. File reservations and billing updates use the same customer lock. Global platform permissions never grant membership. Personal customer identifiers equal the existing user identifier, preserving personal storage and lock scope without moving objects.

Billing settings can enable both providers and choose a default; customers choose among enabled, configured providers at checkout. This extends ADR 0020's initial deployment-only provider choice. Local trials do not enroll a payment method or convert automatically. Checkout snapshots pricing and purchased seats. Provider callbacks authenticate and reconcile facts before applying receipts, audit and paid entitlements atomically. Checkout orders are the durable work record. Provider calls never occur within those transactions.

Disabling new checkout does not stop reconciliation, callbacks or cancellation. Existing providers remain bound to accepted orders. A cancellation stops future billing and preserves paid storage until period end. Grace expiry and trial expiry calculate free storage on read and upload authorization; no expiry job is required for enforcement.

## Consequences

Existing personal libraries remain available and keep administrator quotas until the account starts a trial/subscription. Organization shared files use a flat library with explicit customer scope and opaque customer-prefixed keys. Provider-specific callback validation stays in Infrastructure. PayFast tokens are encrypted and outbound token-bearing URLs are excluded from logging and tracing.

The first implementation deliberately exposes limits instead of promising provider parity: no proration, refunds or automatic plan migration; PayFast missed-payment recovery requires ITN replay. See [setup and limitations](../customer-billing.md). Real PostgreSQL tests cover membership isolation, concurrent ownership transfer, duplicate receipts, period monotonicity, quota expiry and file access after revoked membership. Browser E2E tests require separate permission.
