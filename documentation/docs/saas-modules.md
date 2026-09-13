# Configurable SaaS modules

The starter is evolving into a modular monolith. Business modules own vertical slices across Domain, Application, Infrastructure, API, Angular and BackgroundWorker while preserving the existing assembly dependency rules. The deployment catalog is `modules/catalog.json`; `framework.json` links that catalog and its presets. The `framework.modules` list remains a technology/feature inventory, not an activation contract.

## Available now

| Module | Deployment switch | Disable behavior |
| --- | --- | --- |
| Identity | Required | Authentication and authorization remain active |
| Audit recording | Required | Security and business audit writes remain active |
| Delivery | Required | Accepted messages, jobs and cleanup continue |
| Organizations | `Modules:organizations` | New organization routes stop; memberships and data remain |
| Billing | `Modules:billing` | New checkout and trials stop; callbacks, cancellation and reconciliation continue |
| My Files | `Modules:my-files` | File routes return 404; navigation is hidden; retention continues |
| Support | `Modules:support` | Ticket APIs return 404; portal is hidden; data is retained and privacy erasure continues |
| Maintenance | `Modules:maintenance` | New HTTP and cron requests stop; accepted jobs drain |
| Operations | `Modules:operations` | Queue browsing/replay APIs and navigation are unavailable; worker delivery continues |
| Audit history | `Modules:audit-history` | Audit browsing API and navigation are unavailable; recording continues |

Set `ModulesPreset` to `baseline` (default, preserves existing behavior) or `minimal` (disables the seven optional modules). Explicit boolean `Modules:<id>` values override the preset. For environment variables use double underscores, for example `Modules__my-files=false`. Apply identical deployment settings to API, Worker and Migrator, then restart them together. Deployment activation is a startup snapshot. Administrators can additionally disable or re-enable My Files and Support application-wide under **Administration → Modules**, without restarting workloads. The PostgreSQL setting defaults to enabled and cannot override a deployment restriction. See [ADR 0023](adr/0023-runtime-module-administration.md).

`node tools/framework.mjs modules minimal` prints a resolved JSON configuration suitable for merging into host settings. It does not mutate running hosts. `node tools/framework.mjs validate` validates the catalog and every preset, including unknown dependencies, cycles, required capabilities and disabled prerequisites. Hosts repeat those validations at startup. Invalid booleans and unknown module names fail startup.

File and maintenance feature flags remain additional restrictions. For example, setting `Modules:my-files=true` still requires runtime activation and the `Features:my-files:Enabled` flag (both enabled by default) to expose files. User, tenant or environment feature overrides cannot enable a disabled deployment or runtime module. Permissions remain mandatory.

`GET /api/v1/capabilities` requires authentication and returns only effective boolean capabilities, never provider settings or secrets. The frontend uses this single response to hide destinations and guard direct routes. The former `/modules` and `/features` endpoints are removed. Failed loads clear capabilities; responses from a previous signed-in actor are discarded. Backend gates remain authoritative.

## Add a vertical slice

Run `node tools/framework.mjs new module Reports`. This creates an Application query, an API endpoint with a module gate, an Angular page, a disabled descriptor for review, ownership folders for Domain/Infrastructure/Worker, and extension documentation. It never overwrites existing files or automatically registers an incomplete slice.

Implement the use cases and explicit registrations; add the reviewed descriptor to the catalog. Register permission policies, mark endpoint groups with `OwnedByModule` and `RequireCapability`, declare shared Angular destination requirements in `core/destinations.ts`, use `destinationGuard` or `capabilityGuard`, and regenerate OpenAPI clients. A substantial module that owns persistent data uses a module-named PostgreSQL schema in the shared `FrameworkDb` and migration stream. Files owns `files.files` and `files.file_storage_settings`, and Support owns its tables in `support`; platform, Identity, messaging and audit data retain their cross-cutting schemas. Capability modules that expose another foundation's data, such as Operations and Audit History, do not duplicate that data in their own schemas. A module's mappings and migrations remain present when disabled so retained data stays readable by approved recovery and cleanup paths. Do not conditionally change the EF model based on module activation.

Modules communicate through explicit Application contracts or versioned events. They do not query another module's tables. Domain stays BCL-only; Application references only Domain and SharedKernel. Scheduling stays in BackgroundWorker. Scaffolds must describe pending-work behavior and data retention before activation. Physical source removal and hot-loaded plugins are outside this initial module system.

## Capability definitions and runtime dependencies

See [ADR 0031](adr/0031-declarative-capabilities.md) for the complete evaluation and concurrency contract. Each module declares a base capability with the same ID. Set `runtimeConfigurable: true` only for a supported administrator switch, and optionally associate a contextual `featureFlag`. Additional `capabilities` declare `id`, `requires`, and optional `featureFlag`; they automatically require their owning module.

For example, Organizations declares `organization-files` requiring `my-files`. Disabling My Files hides organization file access without disabling Organizations. A module-level `dependencies` entry is appropriate only when the whole module needs that prerequisite.

Run `node tools/framework.mjs module-ids` after changing the catalog. It generates C# `ModuleIds`/`CapabilityIds` and TypeScript `ModuleId`/`CapabilityId`; `validate` checks the catalog schema, graphs, presets and generated-file drift. Do not edit generated identifiers.

To add a feature to an existing module, run `node tools/framework.mjs new feature Reports --module support`. Review the generated capability fragment before merging it into the owner descriptor. Both feature and module scaffolds have explicit ownership/gates and stay unregistered until implemented. Consult the repo-local `.agents/skills/module-feature-development/SKILL.md` workflow.

Generic runtime activation is exposed at `/api/v1/auth/administration/modules/activation`. It reports versioned activation plus enable/disable blockers. My Files and Support are the current switches. Enabling requires available prerequisites; disabling with enabled dependents is rejected, never cascaded. Adding a runtime switch requires a new migration seeding its row, localized presentation and a disable policy. Missing rows fail closed.

Runtime updates serialize on runtime rows in stable ID order within the dispatcher transaction before acquiring module-settings locks. Preserve this order in every activation/settings writer. Audit and updates commit together; stale versions return 409. Typed My Files demo/slow-upload settings use `/api/v1/auth/administration/modules/my-files/settings` and their own file-settings version. Activation and file settings have independent versions; the original combined API and its contracts are removed.

Give accepted-obligation HTTP operations `ContinuesWhenDisabled` metadata and a concrete reason outside entry-point gates. Callbacks, cancellation, closure, retained-data cleanup and accepted delivery preserve their existing rules. New module URLs must extend the independent endpoint-boundary assertions in `CapabilityTests`. Do not apply the HTTP maintenance feature flag to cron: scheduled admission retains its separate `Maintenance:Enabled` setting.

`node --test tools/capabilities.test.mjs` verifies browser-free capability loading, request coalescing, failure and actor-switch behavior. PostgreSQL capability tests cover runtime dependency races, typed settings and version conflicts. Browser tests still require explicit permission.

## Approved implementation roadmap

| Phase | Deliverable | Status |
| --- | --- | --- |
| 1 | Catalog, validation, deployment switches, existing feature gates, presets, module scaffolding | Implemented; validation recorded in the change |
| 2 | Personal/organization/both modes, memberships, invitations, switching, fixed tenant roles and ownership transfer | Implemented; see customer billing guide |
| 3 | Plans, storage entitlements, trials, purchased seats, subscriptions and Stripe/PayFast adapters | Implemented with documented limits; merchant sandbox verification pending |
| 4 | Configurable onboarding, organization files/quotas, branding and customer self-service | Planned |
| 5 | API keys, service accounts, signed webhooks, retries and usage metering | Planned |
| 6 | Organization SSO, domain verification, SCIM, custom domains and audited support tools | Planned |

Personal subscription, team SaaS and combined product presets will be added with their working account and billing modules. They are not advertised as usable presets yet. Stripe and PayFast are the approved payment-provider choices; both adapters are implemented; see [provider setup and limitations](customer-billing.md). Verify their current payment and subscription contracts against official provider documentation when implementing phase 3.

See [module lifecycle](adr/0018-saas-module-lifecycle.md), [customer isolation](adr/0019-saas-customer-isolation.md), and [billing boundaries](adr/0020-saas-billing-providers.md).

See the [customer support portal](support.md) for Support setup, permissions and workflow.
