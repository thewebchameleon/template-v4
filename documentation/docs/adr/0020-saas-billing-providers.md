# ADR 0020: Payments, Commercial Billing and paid module licensing

Status: Accepted; supersedes the billing parts of [ADR 0026](0026-customer-billing-implementation.md).

## Context

The starter needs configurable subscriptions for personal and organisation customers, with Stripe and a South African provider. Payment-provider capabilities differ.

## Decision

Split provider execution from commercial policy. Required `payments` owns provider-neutral requests, authenticated callback normalization, Stripe and PayFast adapters, capabilities, and administrator payment-method configuration. It does not own plans, orders, receipts, invoices, subscriptions or entitlements and never grants access.

Optional `commercial-billing` owns persisted plans, immutable price versions, checkout orders, subscriptions, receipts, invoices, entitlements, usage counters, trial/grace settings and reconciliation. The private `client-management` module is a separate payment consumer for paid private-module offers and payment-derived licences. It shares Payments contracts and adapters, not Commercial Billing tables or policy.

Commercial plans and prices are persisted. Prices are append-only snapshots once referenced. Never grant paid entitlements from a browser success redirect. Each consumer authenticates callbacks through Payments, verifies the stored payment identity, amount and currency, deduplicates provider events, and atomically applies its own receipt and entitlement state. Do not hold database transactions open over provider HTTP calls.

Keep credentials in secret configuration and never log payment notifications or credential-bearing URLs. Existing subscriptions retain their provider identity. Changing the deployment default does not migrate subscriptions; a separate migration workflow is required. Disabling new checkout must preserve callbacks, reconciliation and existing contractual obligations.

## Consequences

A single broad interface does not pretend Stripe and PayFast are interchangeable. Capability checks expose supported currencies, recurring intervals and one-time payments. Commercial Billing and private licensing remain independent consumers with separate callback paths, persistence, reconciliation and entitlement rules.

## Enforcement and extension points

Test duplicate, invalid and out-of-order notifications, amount/currency mismatch, recovery after crashes, provider outages and cross-customer isolation. Use real PostgreSQL for durable processing and provider sandboxes for external contract verification. See the [roadmap](../saas-modules.md).
