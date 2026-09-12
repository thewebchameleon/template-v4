# ADR 0020: billing, entitlements and selectable payment providers

Status: Accepted; initial implementation follows [ADR 0026](0026-customer-billing-implementation.md).

## Context

The starter needs configurable subscriptions for personal and organization customers, with Stripe and a South African provider. Payment-provider capabilities differ.

## Decision

Support Stripe and PayFast through Infrastructure adapters and provider-neutral Application contracts. Select a provider per deployment. Validate the current official provider contracts before implementing adapters. Begin with subscriptions and seats; add usage metering separately. Provider capability declarations determine supported checkout, recurring payment and cancellation operations.

The application owns its plan catalog and customer entitlements. Providers own payment execution and external identifiers. Never grant paid entitlements from a browser success redirect. Authenticate provider callbacks, verify merchant/account, currency and amount, deduplicate notifications, and reconcile payment state with the provider. Persist a durable inbox and use atomic state/audit/outbox updates. Do not hold database transactions open over provider HTTP calls. Failures must be recoverable without duplicating charges.

Keep credentials in secret configuration and never log payment notifications or credential-bearing URLs. Existing subscriptions retain their provider identity. Changing the deployment default does not migrate subscriptions; a separate migration workflow is required. Disabling new checkout must preserve callbacks, reconciliation and existing contractual obligations.

## Consequences

A single broad interface must not pretend Stripe and PayFast are interchangeable in every feature. Providers' current support for currencies, trials, recurring amounts, seats, refunds and usage collection must be documented and reflected in capability checks. This ADR approves provider choices; it does not imply working adapters are present.

## Enforcement and extension points

Test duplicate, invalid and out-of-order notifications, amount/currency mismatch, recovery after crashes, provider outages and cross-customer isolation. Use real PostgreSQL for durable processing and provider sandboxes for external contract verification. See the [roadmap](../saas-modules.md).
