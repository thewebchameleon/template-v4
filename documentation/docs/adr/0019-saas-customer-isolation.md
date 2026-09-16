# ADR 0019: personal and organisation SaaS accounts

Status: Accepted; initial implementation follows [ADR 0026](0026-customer-billing-implementation.md).

The account ownership and tenant model below is historical and superseded by
[ADR 0047](0047-single-organisation.md).

## Context

The starter must support B2C, B2B or both in one deployment. Existing global Identity roles describe platform administration and must not inadvertently grant organisation access.

## Decision

Introduce customer accounts with personal or organisation ownership. Configure personal-only, organisations-only or both. An identity may participate in multiple organisations. Keep platform roles separate from organisation memberships and permissions. Resolve each request's customer scope using the authenticated actor and a live membership check; a caller-supplied organisation identifier alone never establishes access.

Start with shared PostgreSQL tables containing explicit customer identifiers. Enforce scoping in focused persistence operations and test cross-customer reads and writes. Tenant-owned relationships and uniqueness constraints include customer scope. Background contracts carry an explicit scope and revalidate the permissions appropriate to their use case. Files, caches, quotas and idempotency keys must include scope. Do not infer tenant access from global user-management permissions.

## Consequences

Existing personal and platform workflows need explicit adaptation and migration. Ownership transfer and last-owner protection require concurrency-safe writes. Account deletion must account for owned organisations and payment obligations. Separate databases per tenant remain a later enterprise extension. Do not enable organisation presets before these boundaries and workflows are implemented.

## Enforcement and extension points

Real PostgreSQL tests must cover isolation, revoked membership, concurrent ownership changes, uniqueness, jobs, files and privacy. See the [roadmap](../saas-modules.md).

## Organisation administration and current selection

System administrators alone configure organisations and memberships, with management access to all organisations. This exception is confined to management operations; `ICustomerAccess.Find` and business/file/billing operations continue to require live membership. Existing users receive membership immediately when assigned by a system administrator. Legacy invitation acceptance remains supported.

The current organisation is a nullable account preference stored on the Identity user. Module entry reloads and validates the preference against active memberships. A sole available organisation is selected automatically; multiple organisations require an explicit initial choice. Removing membership, closing an organisation or erasing the user clears its saved selection. The preference never establishes authorization by itself. Management UI lives under Administration; the Account → Organisation page only selects the working organisation.
