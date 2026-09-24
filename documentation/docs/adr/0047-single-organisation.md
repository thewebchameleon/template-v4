# ADR 0047: one organisation per deployment

Status: Accepted; supersedes [ADR 0019](0019-saas-customer-isolation.md) and the
ownership model in [ADR 0026](0026-customer-billing-implementation.md).

## Decision

Every deployment has exactly one organisation, seeded by forward migration and enforced
by a PostgreSQL singleton constraint. Administrators manage its identity and defaults.
The organisation name and retained logo versions identify the application, email, and
new commercial-document snapshots.
Fresh deployments leave the organisation name, time zone, and country unconfigured in
the seeded row; administrators provide them on the Branding page.

There are no organisation memberships, owners, transfers, creation, closure, tenant
selection, or personal customer accounts. Enabled, confirmed, approved users belong to
the deployment. Roles and live permission grants authorize operations; a client-supplied
organisation or tenant identifier never establishes access.

CRM, invoicing, attachments, and private modules use global record identifiers and
singletons where appropriate. The stable organisation identifier remains in billing
history, audit references, storage keys, and integration contracts where durable
identity is required; it is not a selectable boundary.

One subscription supplies deployment entitlements. Payments owns provider adapters,
Commercial Billing owns this deployment's plans and subscription, and private Client
Management remains a separate payment consumer. Privacy erasure removes personal data
and attribution without deleting organisation records or cancelling the deployment's
subscription.

## Migration

The conversion was designed for fresh installations, not automatic consolidation of
populated multi-organisation databases. Historical migrations remain permanent. Current
files and quota behavior are defined by [ADR 0048](0048-unified-organisation-files.md).
