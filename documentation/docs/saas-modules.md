# Configurable SaaS modules

The starter is evolving into a modular monolith. Business modules own vertical slices across Domain, Application, Infrastructure, API, Angular and BackgroundWorker while preserving the existing assembly dependency rules. The deployment catalog is `modules/catalog.json`; `framework.json` links that catalog and its presets. The legacy `framework.modules` list remains a technology/feature inventory, not an activation contract.

## Available now

| Module | Deployment switch | Disable behavior |
| --- | --- | --- |
| Identity | Required | Authentication and authorization remain active |
| Audit recording | Required | Security and business audit writes remain active |
| Delivery | Required | Accepted messages, jobs and cleanup continue |
| Files | `Modules:files` | File routes return 404; navigation is hidden; retention continues |
| Maintenance | `Modules:maintenance` | New HTTP and cron requests stop; accepted jobs drain |
| Operations | `Modules:operations` | Queue browsing/replay APIs and navigation are unavailable; worker delivery continues |
| Audit history | `Modules:audit-history` | Audit browsing API and navigation are unavailable; recording continues |

Set `ModulesPreset` to `baseline` (default, preserves existing behavior) or `minimal` (disables the four optional modules). Explicit boolean `Modules:<id>` values override the preset. For environment variables use double underscores, for example `Modules__files=false`. Apply identical deployment settings to API, Worker and Migrator, then restart them together. Module activation is a startup snapshot; it is not an administrator feature flag.

`node tools/framework.mjs modules minimal` prints a resolved JSON configuration suitable for merging into host settings. It does not mutate running hosts. `node tools/framework.mjs validate` validates the catalog and every preset, including unknown dependencies, cycles, required capabilities and disabled prerequisites. Hosts repeat those validations at startup. Invalid booleans and unknown module names fail startup.

File and maintenance feature flags remain additional restrictions. For example, setting `Modules:files=true` still requires the existing `Features:files:Enabled` flag to expose personal files. User, tenant or environment feature overrides cannot enable a disabled module. Permissions remain mandatory.

`GET /api/v1/modules` requires authentication and returns only boolean module capabilities, never provider settings or secrets. The frontend uses it to hide destinations and guard direct routes. Failed loads clear capabilities; responses from a previous signed-in actor are discarded. Backend gates remain authoritative.

## Add a vertical slice

Run `node tools/framework.mjs new module Reports`. This creates an Application query, an API endpoint with a module gate, an Angular page, a disabled descriptor for review, ownership folders for Domain/Infrastructure/Worker, and extension documentation. It never overwrites existing files or automatically registers an incomplete slice.

Implement the use cases and explicit registrations; add the reviewed descriptor to the catalog. Register permission policies, gate navigation and lazy routes with the shared capability service and `moduleGuard`, and regenerate OpenAPI clients. A module's mappings and migrations remain present when disabled so retained data stays readable by approved recovery and cleanup paths. Do not conditionally change the EF model based on module activation.

Modules communicate through explicit Application contracts or versioned events. They do not query another module's tables. Domain stays BCL-only; Application references only Domain and SharedKernel. Scheduling stays in BackgroundWorker. Scaffolds must describe pending-work behavior and data retention before activation. Physical source removal and hot-loaded plugins are outside this initial module system.

## Approved implementation roadmap

| Phase | Deliverable | Status |
| --- | --- | --- |
| 1 | Catalog, validation, deployment switches, existing feature gates, presets, module scaffolding | Implemented; validation recorded in the change |
| 2 | Personal/organization/both modes, memberships, invitations, switching, tenant roles/settings and ownership transfer | Planned |
| 3 | Plans, entitlements, trials, seats, subscriptions, Stripe and PayFast checkout/callbacks/reconciliation | Planned |
| 4 | Configurable onboarding, organization files/quotas, branding and customer self-service | Planned |
| 5 | API keys, service accounts, signed webhooks, retries and usage metering | Planned |
| 6 | Organization SSO, domain verification, SCIM, custom domains and audited support tools | Planned |

Personal subscription, team SaaS and combined product presets will be added with their working account and billing modules. They are not advertised as usable presets yet. Stripe and PayFast are the approved payment-provider choices; no payment adapter is implemented by this foundation. Verify their current payment and subscription contracts against official provider documentation when implementing phase 3.

See [module lifecycle](adr/0018-saas-module-lifecycle.md), [customer isolation](adr/0019-saas-customer-isolation.md), and [billing boundaries](adr/0020-saas-billing-providers.md).
