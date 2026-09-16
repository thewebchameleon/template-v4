# ADR 0031: declarative capabilities and module activation

Status: Accepted

## Decision

Keep the modular monolith, explicit service registration and shared EF migration stream. Extend `modules/catalog.json` with `runtimeConfigurable`, optional `featureFlag`, and optional additional `capabilities` containing `id`, `requires` and optional `featureFlag`. The module ID is its base capability. Additional capabilities automatically require their owning module. `organisation-files` composes Organisations and File Storage without requiring every organisation to use file storage.

`ModuleCatalog` validates module and capability graphs and evaluates immutable deployment state with supplied runtime state and feature decisions. `ICapabilities` owns request-time availability discovery. Its Infrastructure implementation reads committed runtime state once per evaluation; it has no process-local cache. Unknown capabilities and missing runtime rows fail closed. Permissions, customer ownership, storage quotas and subscription obligations remain separate operation checks.

`GET /api/v1/capabilities` is the authenticated frontend contract. The former `/modules` and `/features` discovery endpoints are removed; clients use `/capabilities` directly. Feature precedence remains tenant, user, environment, default. No override can bypass deployment/runtime restrictions or a capability prerequisite. The existing HTTP maintenance flag does not change cron admission, which retains deployment plus `Maintenance:Enabled`; accepted jobs continue draining.

Generate C# module/capability constants and TypeScript identifier unions using `node tools/framework.mjs module-ids`. CLI validation checks the JSON schema, every preset, graph validity and generated-file drift. `framework.json.modules` remains a technology inventory, not an activation contract.

## Runtime administration and concurrency

Runtime switches are declared by the current catalog and selected private descriptors. File Storage, Support, CRM and Invoicing are the current foundation switches. Generic activation discovery derives supported modules from catalog metadata and returns activation versions plus enable/disable blockers to Administrators. The activation store rejects enabling an unavailable prerequisite and disabling a prerequisite with enabled dependents; there is no implicit cascade.

All activation writers lock runtime rows in ID order inside the dispatcher transaction before validating the graph or taking module-settings locks. This serializes graph transitions across API instances. A stale version returns conflict. Updates and audit entries commit together. Required foundations cannot be runtime switches. Future switches need seeded rows in a new forward migration; existing migration history is permanent.

The clean activation API lives at `/api/v1/auth/administration/modules/activation`. Typed File Storage behavior settings live at `/api/v1/auth/administration/modules/file-storage/settings`, with their own settings version and existing file-settings locking. File behavior and activation versions are independent. The original combined module API and its contracts are removed. No database schema change is needed for this refactoring.

## Endpoint and frontend conventions

Endpoint groups declare `OwnedByModule` and `RequireCapability`. Individual endpoints use the same explicit ownership and capability declarations. Accepted-obligation endpoints explicitly declare `ContinuesWhenDisabled` with a reason and sit outside new-work gates. Billing callbacks, cancellation, provider configuration and organisation closure preserve their existing behavior. Retention and accepted delivery remain active.

Structural tests validate gate/exception metadata and independently check module URL boundaries, catching endpoints missing all metadata. New module boundaries must extend that coverage.

Angular uses one typed capability response, a shared capability guard, and destination metadata reused by route guards, navigation, administration landing and dashboard links. Failed discovery clears availability; stale responses from an earlier actor cannot restore it. Support translations load through its route resolver. New modules need localized presentation metadata, but generic availability code does not change.

## Validation

Cover graph failures, composed capability restrictions, missing runtime state, blocked transitions and concurrent prerequisite/dependent changes. PostgreSQL tests exercise the actual store, audit and optimistic conflicts, including independent activation and file-settings versions. Browser-free tests exercise Angular request coalescing, failure and sign-in races. E2E execution remains subject to repository permission rules.

See the [module guide](../saas-modules.md) for extension commands and the repository-local `module-feature-development` skill for the implementation workflow.

Administration safety, retained navigation, financial permissions and HTTP feature-context limits are clarified by [ADR 0036](0036-module-administration-safety.md).
