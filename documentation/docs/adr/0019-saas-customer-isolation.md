# ADR 0019: personal and organization SaaS accounts

Status: Accepted; initial implementation follows [ADR 0026](0026-customer-billing-implementation.md).

## Context

The starter must support B2C, B2B or both in one deployment. Existing global Identity roles describe platform administration and must not inadvertently grant organization access.

## Decision

Introduce customer accounts with personal or organization ownership. Configure personal-only, organizations-only or both. An identity may participate in multiple organizations. Keep platform roles separate from organization memberships and permissions. Resolve each request's customer scope using the authenticated actor and a live membership check; a caller-supplied organization identifier alone never establishes access.

Start with shared PostgreSQL tables containing explicit customer identifiers. Enforce scoping in focused persistence operations and test cross-customer reads and writes. Tenant-owned relationships and uniqueness constraints include customer scope. Background contracts carry an explicit scope and revalidate the permissions appropriate to their use case. Files, caches, quotas and idempotency keys must include scope. Do not infer tenant access from global user-management permissions.

## Consequences

Existing personal and platform workflows need explicit adaptation and migration. Ownership transfer and last-owner protection require concurrency-safe writes. Account deletion must account for owned organizations and payment obligations. Separate databases per tenant remain a later enterprise extension. Do not enable organization presets before these boundaries and workflows are implemented.

## Enforcement and extension points

Real PostgreSQL tests must cover isolation, revoked membership, concurrent ownership changes, uniqueness, jobs, files and privacy. See the [roadmap](../saas-modules.md).
