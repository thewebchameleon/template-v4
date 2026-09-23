# Architecture decision records

This section is the detailed architectural context for coding agents and maintainers.
Use it to understand why boundaries exist, what must remain compatible, and which later
decision controls when the system has evolved.

## How agents use these records

1. Read `framework.json`, `modules/catalog.json`, and the ADRs relevant to the change.
2. Prefer the newest accepted ADR when decisions overlap. A superseded ADR is only a
   redirect and contributes no current requirements.
3. Treat paths, inventories, version numbers, and generated outputs as authoritative in
   source manifests rather than duplicating them from prose.
4. Preserve public contracts, migration history, security boundaries, ownership, and
   disable/recovery behavior described here.
5. If code and an accepted ADR disagree, verify the current implementation and update
   the stale ADR in the same change. Do not silently choose whichever is convenient.
6. Add an ADR only for a durable architectural decision or reversal. Routine feature
   behavior belongs with the owning module.

## Foundation and delivery

- [0001 — Clean Architecture and provider boundaries](0001-golden-path.md)
- [0002 — Rotating sessions and key separation](0002-browser-security.md)
- [0003 — PostgreSQL outbox and Worker-owned Quartz](0003-durable-worker.md)
- [0004 — Angular, Spartan, and generated contracts](0004-angular-contract.md)
- [0006 — Delivery leases and persisted job lifecycle](0006-delivery-leases-and-reconciliation.md)
- [0008 — DocMD documentation project](0008-docmd-documentation.md)
- [0011 — Repository layout](0011-aio-aligned-repository-layout.md)
- [0012 — Platform TLS and Nginx routing](0012-platform-tls-and-nginx-routing.md)
- [0013 — Feature-owned endpoint registration](0013-endpoint-registration-files.md)
- [0017 — SignalR notification invalidation](0017-signalr-notification-invalidation.md)
- [0038 — Coordinated Compose client releases](0038-compose-client-releases.md)
- [0039 — Component releases and client updates](0039-component-releases-and-client-updates.md)
- [0045 — Compose proxy DNS discovery](0045-discovered-compose-proxy.md)

## Identity, access, and security

- [0005 — Configurable MFA and passkeys](0005-configurable-mfa-and-passkeys.md)
- [0007 — Interactive administrator bootstrap](0007-interactive-administrator-bootstrap.md)
- [0009 — Configurable public registration](0009-configurable-public-registration.md)
- [0014 — Account and security use-case boundaries](0014-account-security-use-case-boundaries.md)
- [0016 — Administration and delegated access](0016-administration-and-delegated-access.md)
- [0024 — Structured audit event details](0024-audit-event-details.md)
- [0026 — Account profiles and avatars](0026-account-profile-details.md)
- [0028 — Identity-bound requests and lifecycle hardening](0028-review-hardening.md)
- [0037 — Action items and registration review](0037-action-items-and-registration-review.md)
- [0050 — Scoped external API keys](0050-external-api-keys.md)

## Platform workflows and user experience

- [0054 — Schema-driven CMS and revision approval](0054-schema-driven-cms.md)

- [0053 — Editable dashboards and module-owned card providers](0053-editable-dashboards.md)

- [0010 — Spartan and design tokens](0010-spartan-design-tokens.md)
- [0015 — Platform administration, storage, and privacy](0015-platform-baseline-workflows.md)
- [0022 — Platform configuration and appearance](0022-platform-configuration.md)
- [0025 — Support portal](0025-customer-support-portal.md)
- [0029 — File Storage folders and sharing](0029-file-storage-library.md)
- [0030 — Interface sounds](0030-interface-sounds.md)
- [0040 — Web Push notifications](0040-web-push-notifications.md)
- [0041 — CMS public publishing](0041-cms-public-blog.md)
- [0048 — Unified organisation files](0048-unified-organisation-files.md)
- [0049 — Independent Support features](0049-support-features.md)

## Modules and source ownership

- [0018 — Module lifecycle and vertical slices](0018-saas-module-lifecycle.md)
- [0031 — Declarative capabilities](0031-declarative-capabilities.md)
- [0032 — Packaged foundation and business modules](0032-packaged-foundation-and-business-modules.md)
- [0033 — Build-time business-module discovery](0033-business-module-discovery.md)
- [0034 — Private client composition](0034-private-client-module-composition.md)
- [0035 — Module categories and client configuration](0035-module-categories-and-client-configuration.md)
- [0036 — Safe module administration](0036-module-administration-safety.md)
- [0042 — Module vertical-slice layout](0042-module-vertical-slices.md)
- [0043 — Module-owned composition](0043-module-owned-composition.md)
- [0051 — Platform core and selectable File Storage](0051-platform-core-and-file-library.md)
- [0052 — Provider-assigned compiled private modules](0052-provider-assigned-compiled-private-modules.md)
- [0055 — Bundled module source and persistence](0055-bundled-module-source-and-persistence.md)

## Organisation and commercial boundaries

- [0020 — Payments and Commercial Billing](0020-saas-billing-providers.md)
- [0046 — Private commercial client management](0046-commercial-client-management.md)
- [0047 — Single organisation](0047-single-organisation.md)

## Superseded redirects

These files intentionally contain only pointers to current decisions:

- [0019 — Multi-organisation customer isolation](0019-saas-customer-isolation.md) → 0047
- [0021 — Personal user file library](0021-user-file-library.md) → 0048 and 0051
- [0023 — Files-only module administration](0023-runtime-module-administration.md) → 0031, 0035, 0036, and 0051
- [0026 — Former customer/billing implementation](0026-customer-billing-implementation.md) → 0020, 0047, and 0048

ADR number 0026 was historically assigned twice. The account-profile ADR remains
accepted; the customer/billing ADR is the superseded record. Numbers 0027 and 0044 were
never assigned.
