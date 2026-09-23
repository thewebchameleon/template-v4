# ADR 0056: combined Commercial Billing module

Status: Accepted

## Decision

Commercial Billing is the single runtime-configurable module for subscription billing
and commercial invoicing. Its `commercial-billing` ID and switch remain stable.
`invoicing` and `invoicing-files` remain stable capability IDs for existing HTTP and
frontend contracts. The invoicing capability requires CRM; subscription billing does
not. Invoicing endpoints belong to Commercial Billing, while their existing URLs,
permissions, and retained-obligation exceptions remain intact.

Invoicing source lives within the corresponding `Domain`, `Application`,
`Infrastructure`, `Api`, `Frontend`, and `Tests` folders of
`modules/Bundled/CommercialBilling`. It does not have a separate module descriptor or
layer projects. Existing `invoicing` and `commercial_billing` EF contexts, schemas,
migration histories, and public namespaces remain intact to preserve data and
compatibility. The Commercial Billing descriptor registers both features; module
discovery exposes one backend and frontend contribution.

On upgrade, a forward core migration sets the Commercial Billing switch to the logical
AND of both previously saved switch values and removes the old `invoicing` activation
row. This prevents an upgrade from enabling work that an administrator had disabled.
Disabling the combined switch stops new trials, checkouts, quotes, and invoices.
Existing subscription cancellation, payment reconciliation, document reads,
settlement, correction, and refunds remain available under their existing permissions.

## Consequences

Administration shows one Commercial Billing switch. Its two settings pages remain
reachable. Future invoicing features belong to this module and declare separate
capabilities only when they need additional prerequisites or admission rules.
