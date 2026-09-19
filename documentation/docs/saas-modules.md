# Configurable SaaS modules

The starter is evolving into a modular monolith. Business modules own vertical slices across Domain, Application, Infrastructure, API, Angular and BackgroundWorker while preserving the existing assembly dependency rules. The deployment catalog is `modules/catalog.json`; `framework.json` links that catalog and its presets. The `framework.modules` list remains a technology/feature inventory, not an activation contract.

## Available now

| Module | Deployment switch | Disable behavior |
| --- | --- | --- |
| Identity | Required | Authentication and authorization remain active |
| Audit recording | Required | Security and business audit writes remain active |
| Delivery | Required | Accepted messages, jobs and cleanup continue |
| Organisations | Required | Singleton organisation identity, settings and access context remain active |
| Payments | Required | Provider adapters and payment-method configuration remain available to payment consumers |
| Commercial Billing | `Modules:commercial-billing` | New checkout and trials stop; callbacks, cancellation and reconciliation continue |
| File Storage library | `Modules:file-storage` | Library navigation and authenticated library pages are hidden; core storage, administration, attachments, public links and retention continue |
| CRM | `Modules:crm` | New CRM work stops; records remain; disable Invoicing first |
| Invoicing | `Modules:invoicing` | New issuance and navigation stop; retained documents, settlement and correction remain available through direct links |
| Support | `Modules:support` | New enquiries and ticket access stop; retained enquiry inbox, accepted delivery and privacy erasure continue |
| CMS | `Modules:cms` | Editing and published CMS APIs stop; the public website uses bundled content |
| Maintenance | Required | Operational enable/pause controls govern scheduling; accepted jobs drain |
| Audit history | Required | Permission-filtered audit browsing remains active with audit recording |

Set `ModulesPreset` to `baseline` (default, preserves existing behavior) or `minimal` (disables optional modules). Explicit boolean `Modules:<id>` values override the preset. Required core entries cannot be disabled. For environment variables use double underscores, for example `Modules__file-storage=false`. Apply identical deployment settings to API, Worker and Migrator, then restart them together. Deployment activation is a startup snapshot. Administrators can additionally disable or re-enable the File Storage library, Support, CRM and Invoicing application-wide under **Administration → Modules**, without restarting workloads. The PostgreSQL setting defaults to enabled and cannot override a deployment restriction. See [ADR 0023](adr/0023-runtime-module-administration.md).

`node tools/framework.mjs modules minimal` prints a resolved JSON configuration suitable for merging into host settings. It does not mutate running hosts. `node tools/framework.mjs validate` validates the catalog and every preset, including unknown dependencies, cycles, required capabilities and disabled prerequisites. Hosts repeat those validations at startup. Invalid booleans and unknown module names fail startup.

The File Storage feature flag remains an additional presentation restriction. Setting `Modules:file-storage=true` still requires runtime activation and the `Features:file-storage:Enabled` flag (both enabled by default) to expose the library navigation and authenticated pages. These controls do not disable core storage APIs or attachments. User or environment feature overrides cannot enable a disabled deployment or runtime module. Permissions remain mandatory.

`GET /api/v1/capabilities` requires authentication and returns only effective boolean capabilities, never provider settings or secrets. The frontend uses this single response to hide destinations and guard direct routes. The former `/modules` and `/features` endpoints are removed. Failed loads clear capabilities; responses from a previous signed-in actor are discarded. Backend gates remain authoritative.

Enabled organisation module destinations remain visible in the navigation rail throughout the application. Within an organisation workspace they open that organisation's module directly. Elsewhere they open an organisation selection page and continue to the chosen module after selection. This applies to contributed business module destinations as well as CRM and Commercial Billing; module activation remains global and organisation data remains isolated.

## Add a vertical slice

Follow [module ownership](module-ownership.md) for registration, permissions and
existing Support/CMS/CRM/Invoicing reference workflows.

Run `node tools/framework.mjs new module Reports`. This creates an Application query, an API endpoint with a module gate, an Angular page, a disabled descriptor for review, ownership folders for Domain/Infrastructure/Worker, and extension documentation. It never overwrites existing files or automatically registers an incomplete slice.

Implement the use cases and explicit registrations; add the reviewed descriptor to the catalog. Register permission policies, mark endpoint groups with `OwnedByModule` and `RequireCapability`, declare shared Angular destination requirements in `core/destinations.ts`, use `destinationGuard` or `capabilityGuard`, and regenerate OpenAPI clients. A substantial module that owns persistent data uses a module-named PostgreSQL schema in the shared `FrameworkDb` and migration stream. File Storage owns `file_storage.files` and `file_storage.file_storage_settings`, and Support owns its tables in `support`; platform, Identity, messaging and audit data retain their cross-cutting schemas. Capability modules that expose another foundation's data, such as Audit History, do not duplicate that data in their own schemas. Core Operations APIs expose delivery state and remain protected by their explicit permissions. A module's mappings and migrations remain present when disabled so retained data stays readable by approved recovery and cleanup paths. Do not conditionally change the EF model based on module activation.

Modules communicate through explicit Application contracts or versioned events. They do not query another module's tables. Domain stays BCL-only; Application references only Domain and SharedKernel. Scheduling stays in BackgroundWorker. Scaffolds must describe pending-work behavior and data retention before activation. Private source inclusion/removal follows the explicit client selection in [business module composition](business-modules.md); hot-loaded plugins remain unsupported.

## Capability definitions and runtime dependencies

See [ADR 0031](adr/0031-declarative-capabilities.md) for the complete evaluation and concurrency contract. Each module declares a base capability with the same ID. Set `runtimeConfigurable: true` only for a supported administrator switch, and optionally associate a contextual `featureFlag`. Additional `capabilities` declare `id`, `requires`, and optional `featureFlag`; they automatically require their owning module.

For example, Organisations declares the core `organisation-files` capability. CRM, Invoicing and private modules compose attachment capabilities from it without depending on the selectable File Storage library. A module-level `dependencies` entry is appropriate only when the whole module needs that prerequisite.

Run `node tools/framework.mjs module-ids` after changing the catalog. It generates C# `ModuleIds`/`CapabilityIds` and TypeScript `ModuleId`/`CapabilityId`; `validate` checks the catalog schema, graphs, presets and generated-file drift. Do not edit generated identifiers.

To add a feature to an existing module, run `node tools/framework.mjs new feature Reports --module support`. Review the generated capability fragment before merging it into the owner descriptor. Both feature and module scaffolds have explicit ownership/gates and stay unregistered until implemented. Consult the repo-local `.agents/skills/module-feature-development/SKILL.md` workflow.

Generic runtime activation is exposed at `/api/v1/auth/administration/modules/activation`. It reports versioned activation plus enable/disable blockers. The catalog currently declares the File Storage library, Support, CRM and Invoicing as foundation runtime switches; selected private modules contribute their own switches. Enabling requires available prerequisites; disabling with enabled dependents is rejected, never cascaded. The library has no storage dependents because its switch controls presentation only. Adding a runtime switch requires a new migration seeding its row, localized presentation and a disable policy. Missing rows fail closed.

Runtime updates serialize on runtime rows in stable ID order within the dispatcher transaction before acquiring module-settings locks. Preserve this order in every activation/settings writer. Audit and updates commit together; stale versions return 409. Typed File Storage demo/slow-upload settings use `/api/v1/auth/administration/modules/file-storage/settings` and their own file-settings version. Activation and file settings have independent versions; the original combined API and its contracts are removed.

Support is the reference for independently configured features: Enquiries and Tickets (including attachments) use typed versioned Support settings and module-owned
`ICapabilityRestrictions`. Providers return restrictive capability decisions, combined
before catalog dependencies are evaluated; they cannot enable an otherwise disabled
capability. Register providers explicitly and fail closed for missing owned settings.
Use contextual feature flags only for rollout restrictions. Settings writers preserve
the runtime-row-before-settings-row lock order. See
[ADR 0049](adr/0049-support-features.md) and [Support](support.md).

Give accepted-obligation HTTP operations `ContinuesWhenDisabled` metadata and a concrete reason outside entry-point gates. Callbacks, cancellation, retained-data cleanup and accepted delivery preserve their existing rules. New module URLs must extend the independent endpoint-boundary assertions in `CapabilityTests`. Maintenance is core: scheduled admission uses `Maintenance:Enabled` and the persisted pause setting, while manual triggering remains permission-protected.

`node --test tools/capabilities.test.mjs` verifies browser-free capability loading, request coalescing, failure and actor-switch behavior. PostgreSQL capability tests cover runtime dependency races, typed settings and version conflicts. Browser tests still require explicit permission.

## Approved implementation roadmap

| Phase | Deliverable | Status |
| --- | --- | --- |
| 1 | Catalog, validation, deployment switches, existing feature gates, presets, module scaffolding | Implemented; validation recorded in the change |
| 2 | One organisation, application roles and one shared subscription | Implemented; see customer billing guide |
| 3 | Plans, storage entitlements, trials, purchased seats, subscriptions and Stripe/PayFast adapters | Implemented with documented limits; merchant sandbox verification pending |
| 4 | Configurable onboarding, organisation files/quotas, branding and customer self-service | Planned |
| 5 | API keys, service accounts, signed webhooks, retries and usage metering | API keys and aggregate usage implemented; remaining items planned |
| 6 | Organisation SSO, domain verification, SCIM, custom domains and audited support tools | Planned |

Stripe and PayFast are the approved payment providers. The required Payments core and optional Commercial Billing module are implemented; see [provider setup and limitations](customer-billing.md). Personal subscription, team SaaS and combined product presets are not advertised as separate usable presets yet.

See [module lifecycle](adr/0018-saas-module-lifecycle.md), [customer isolation](adr/0019-saas-customer-isolation.md), and [billing boundaries](adr/0020-saas-billing-providers.md).

See the [customer support portal](support.md) for Support setup, permissions and workflow.

## Administration and recovery

The catalog, rather than this document, is authoritative for supported switches. Inspect `modules/catalog.json` and selected private descriptors. Missing runtime rows appear as incomplete setup in Administration and remain unavailable until the owning forward migrations have run. No activation request repairs missing rows implicitly.

Activation controls show enable and disable blockers. A version conflict reloads current values and requires another deliberate choice. Module-specific settings load independently on their module-owned settings pages; private features contribute `moduleSettingsDestination` on `FoundationFeature`. An editor owns its request, version, errors and retry, and remains usable while its module is runtime-disabled. A failed settings request cannot disable module activation controls.

Enabling File Storage demo mode requires an explicit destructive warning and the current administrator's password. The server verifies the password for every off-to-on transition, with five attempts per fixed 15-minute window shared across API instances. Attempts commit independently of the settings transaction. Cancel sends no request; failed proof changes no settings. The warning includes the configured expiry and covers all existing organisation files, permanent deletion, and cleanup continuing while the library is disabled. Turning demo mode off requires no password; it stops future demo expiry claims, but cannot cancel already claimed deletions. Storage settings remain available when the library is runtime-disabled or excluded from a deployment.

The separate `file-storage.purge` permission controls the File Storage **Purge all data** operation. The server requires the exact confirmation phrase and a fresh current-password proof, rechecks the persisted permission, revokes all shares, and atomically marks every non-purged File Storage record for irreversible retention cleanup. Object deletion is retryable background work; the purge request is audited and cannot be reversed.

Invoicing navigation is hidden when the module is disabled. Retained documents remain available through existing direct links for viewing and permitted settlement or correction. Existing account membership discovery and selection remain available for reaching these obligations. Issuance/quotation acceptance requires `invoicing.issue`; payment recording requires `invoicing.settle`; credits/refunds require `invoicing.correct`. These are explicit role permissions in addition to live organisation membership. Run the Database Migrator to synchronize built-in Administrator claims; delegated roles receive no automatic financial grants. Configure their permissions deliberately.

Capability discovery failures remain fail-closed and show a retryable page preserving the intended URL. Confirmed unavailability has a separate explanation. HTTP feature overrides currently support user, environment and default decisions. Tenant overrides are removed; see [ADR 0047](adr/0047-single-organisation.md).

Disabling stops new admissions after the committed activation change. Requests already admitted may finish; accepted jobs and retained obligations continue. Disablement is not cancellation or a guarantee that no later writes occur. See [ADR 0036](adr/0036-module-administration-safety.md).

See [CMS: site-wide public blog](modules/cms.md) for Markdown authoring, publication snapshots and public routing.
