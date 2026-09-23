# ADR 0055: bundled modules and core ownership

Status: Accepted

## Context

The source extraction initially treated many platform facilities as bundled modules.
Administrators can switch only six features. Their development layout should match
private modules without making identity, payment providers or storage retention optional.

## Decision

Keep CMS, CRM, Support, Invoicing, File Storage and Commercial Billing under
`modules/Bundled/<Module>`. Keep all other facilities in the platform projects under
`src`. Descriptors contribute services, API endpoints and Angular routes. Commercial
Billing is runtime configurable; disabling it stops new trials and checkouts while
existing subscriptions, cancellation, callbacks and reconciliation continue.

Use module-owned EF contexts and migration histories for the five modules with owned
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
