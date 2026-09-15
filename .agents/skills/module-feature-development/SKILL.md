---
name: module-feature-development
description: Add, extend or convert TemplateV4 modules using module-owned registration and permissions, explicit contracts, capabilities and disable behavior. Use for module ownership or availability changes; skip ordinary page styling and unrelated local refactors.
---

# Module and feature development

Read [framework.json](../../../framework.json) for project paths and [the module extension guide](../../../documentation/docs/saas-modules.md) for the current contract. [ADR 0031](../../../documentation/docs/adr/0031-declarative-capabilities.md) explains activation, concurrency and lifecycle exceptions. Root repository guidance owns execution and validation permissions; this skill adds no approval steps.

## Choose the boundary

- A **module** owns a vertical slice and has deployment dependencies. Use an existing module for a feature that shares its lifecycle and ownership.
- A **capability** names an available operation or composed integration. Additional capabilities live in their owning module's descriptor and automatically require that module. For an optional integration, declare capability requirements rather than making the whole module depend on the integration.
- A **feature flag** adds contextual rollout restrictions to a declared capability. It cannot override deployment/runtime restrictions. Preserve tenant, user, environment, default precedence.
- A **setting** configures behavior. Give module-specific settings typed contracts and store them in that module; do not add fields to generic activation contracts.
- Permissions, customer ownership, quotas and subscription obligations remain operation-specific checks. Availability does not authorize a caller.

Follow one existing slice through its Application contract, explicit registration, API group and Angular destination before choosing implementation details. Use My Files for runtime settings, Support for a cohesive gated endpoint group, and organisation files for composed capabilities.

## Convert or extend existing modules

Follow [module ownership](../../../documentation/docs/module-ownership.md) and
[ADR 0043](../../../documentation/docs/adr/0043-module-owned-composition.md).
Use existing workflows as references: Support for handler/validator composition and
delegated permissions, CMS for public/protected publishing, CRM for organisation
isolation, and Invoicing for cross-module contracts and retained obligations.
Support's requester scope is not an organisation-access pattern.

Keep the coordinated foundation packages and shared EF model. Put registrations in
`Infrastructure/<Module>/<Module>Registration.cs` as private methods on the existing
partial `Registration` class, called explicitly by `AddInfrastructure`. Preserve
lifetimes and store aliases. Register dependencies even while the module is disabled.
Keep shared hosting, Identity and transaction setup in central composition.

Put permission constants in the owner's Application folder using the existing partial
`Permissions` type, and explicitly include new declarations in `Permissions.All`.
Preserve existing names/values. Keep grant policy, built-in synchronization, audit and
session revocation centralized; do not grant delegated roles permissions implicitly.

Use Application contracts for calls between business modules. Run
`ModuleOwnershipTests` after conversions and extend its focused module coverage when
establishing another business boundary. Its typed-source checks do not cover raw SQL
or replace real PostgreSQL isolation/workflow tests. Do not add a sample product
module, universal lifecycle framework or repository abstraction to demonstrate a
convention already exercised by an existing workflow.

## Define and connect

1. Scaffold with `node tools/framework.mjs new module Reports`, or `node tools/framework.mjs new feature Reports --module support`. A scaffold is disabled/unregistered and its descriptor fragment must be reviewed before merging into `modules/catalog.json`.
2. Declare module prerequisites in `dependencies` and additional capabilities in `capabilities[].requires`. The base capability uses the module ID. Add `featureFlag` only when contextual rollout is intended. Run `node tools/framework.mjs module-ids`; use the generated C# identifiers and TypeScript types without editing generated files.
3. Register handlers, validators and providers explicitly. Keep inter-module calls behind Application contracts or versioned events. The shared EF model and migrations remain present when a module is disabled; use the module's schema for substantial owned data.
4. Mark endpoint groups with `OwnedByModule` and `RequireCapability`. Place accepted-obligation operations outside new-work gates and give them `ContinuesWhenDisabled` metadata with a concrete reason. Extend the independent URL-boundary coverage in `CapabilityTests` for a new module route. Preserve authorization, CSRF, ownership and input validation.
5. Declare Angular destinations in `core/destinations.ts` and consume the same requirement in navigation and `destinationGuard`; use `capabilityGuard` for embedded/composed features. Load translations through feature route resolvers, not generic guards. Add labels in both supported cultures.

## Runtime switches and lifecycle

Only descriptors with `runtimeConfigurable: true` appear in generic activation management. Required foundations cannot be runtime switches. Adding a switch needs a new forward migration seeding its versioned row, localized editor metadata, and a documented disable policy. Do not add a switch merely because a feature has a flag.

Generic activation rejects missing prerequisites and disabling enabled dependents. Preserve the stable transaction lock order: runtime rows first, then module-specific settings rows. Never introduce a writer that bypasses that protocol or a process-wide activation cache. Missing runtime rows fail closed. Keep generic activation free of module-specific branching.

Describe what stops accepting new work and what continues: accepted jobs/messages, retention, privacy erasure, subscription cancellation and reconciliation. Scheduled maintenance admission has its own `Maintenance:Enabled` setting; the contextual maintenance feature flag governs HTTP admission. Do not silently merge these policies.

## Verify and document

Run catalog/ID validation and relevant CLI regression tests. Cover composed capability restrictions, missing runtime state, endpoint gates and lifecycle exceptions. Runtime/persistence changes require real PostgreSQL tests for cross-instance visibility, conflicts, transactional audit and dependency races. Use synthetic test modules to exercise dependency relationships without adding product switches.

Regenerate OpenAPI and Angular clients for API changes through the owning tools. Run relevant builds, lint/format checks, and the browser-free capability regression tests. Browser/E2E execution follows root permission rules. Update the module guide and relevant ADR when introducing a new convention; link to canonical guidance rather than duplicating it here.

Use the current contracts directly. Do not introduce compatibility endpoints, adapters, aliases or fallback paths for superseded module/feature APIs.
