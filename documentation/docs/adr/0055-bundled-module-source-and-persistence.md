# ADR 0055: bundled modules and core ownership

Status: Accepted

The Invoicing and Commercial Billing module identity was combined by
[ADR 0056](0056-combined-commercial-billing-module.md).

## Context

The source extraction initially treated many platform facilities as bundled modules.
Administrators could switch six features at that point. Their development layout should match
private modules without making identity, payment providers or storage retention optional.

## Decision

Keep CMS, CRM, Support, File Storage and Commercial Billing under
`modules/Bundled/<Module>`. Keep all other facilities in the platform projects under
`src`. Descriptors contribute services, API endpoints and Angular routes. Commercial
Billing includes invoicing as an internal slice and is runtime configurable; disabling
it stops new trials, checkouts, quotes, and invoices while existing financial obligations
remain available for cancellation, settlement, correction, and reconciliation.

Use module-owned EF contexts and migration histories for the modules with owned
tables. Keep one PostgreSQL database and share a connection and transaction through
`DatabaseSession` for writes crossing core audit, outbox and module data. Preserve the
permanent core migrations. A forward core migration transfers ownership without
dropping tables. Empty module baseline migrations adopt the existing schema; future
changes use each module's EF context. File Storage's library has no separate data
context because its files and retention obligations remain in core storage.

## Consequences

The Database Migrator must apply core migrations before module contributors. Module
services remain registered when disabled so privacy export, erasure and accepted work
can complete. Source moves preserve public namespaces, IDs and URLs. Existing decisions
about foundation source placement are superseded by this ownership rule.
