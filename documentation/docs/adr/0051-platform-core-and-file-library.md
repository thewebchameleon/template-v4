# ADR 0051: platform core and selectable file library

Status: Accepted

Supersedes the optional-core classifications in ADRs 0031, 0035 and 0036 and the File Storage dependency described in ADR 0048. Historical migration and lifecycle decisions remain valid.

## Decision

Modules are complete optional business feature sets. Identity/access, the singleton organisation, audit recording and history, delivery/notifications, maintenance, action items, privacy, shared payment infrastructure and storage services are platform core. Organisations, Audit History and Maintenance are required catalog entries and cannot be disabled by a preset or deployment override.

CMS, Support, CRM, Invoicing and Commercial Billing remain optional foundation business modules. Vehicle Licensing and Client Management remain private modules with their existing physical selection, release and migration boundaries.

`file-storage` remains an optional runtime-configurable presentation module. Its deployment, runtime, feature-flag and licensing state controls the authenticated File Storage library navigation, dashboard links and direct library pages. It does not gate file persistence, file APIs, public links, storage administration, quotas, retention, privacy processing or attachments owned by other workflows.

The stable `organisation-files` capability is core and no longer requires `file-storage`. CRM, Invoicing and private modules may continue to compose their attachment capabilities from `organisation-files`. Their own module gates and permissions remain authoritative.

Storage owns usage calculation, configured quotas and enforcement through core Application contracts. Commercial Billing contributes a currently valid purchased storage allowance through a storage-owned extension contract. When no purchased allowance exists, the configured core quota applies. Billing remains responsible for plans, subscriptions, entitlement records and commercial presentation. Disabling billing admission does not discard a still-valid purchased allowance.

## Lifecycle and compatibility

Existing module and capability IDs, runtime activation rows, URLs, permissions, audit action names, object keys, file rows, shares and migration history remain unchanged. Disabling and re-enabling the library preserves all stored state. Valid public links and accepted cleanup continue while the library is disabled.

Storage behavior settings are core administration and do not require deployment or runtime library availability. Their writer locks the storage settings row directly; it does not acquire the independent runtime activation rows.

Maintenance retains `Maintenance:Enabled`, persisted pause/resume and retry controls. These are operational controls over a core facility rather than module availability. Audit history and organisation surfaces remain permission-filtered even though they are always deployed.

Existing deployment settings that disable `organisations`, `audit-history` or `maintenance` must be removed before upgrade; required module validation rejects them. The minimal preset now disables only optional features.

## Enforcement

Core storage endpoint groups do not use module/capability admission metadata. The Angular File Storage destination and route use the `file-storage` capability. Storage administration and public-share routes remain outside that guard. Capability composition must not make `organisation-files` depend on the library presentation capability.

See [Modules](../modules.md) for module administration and
[Deployment](../deployment.md) for migration and recovery rules.
