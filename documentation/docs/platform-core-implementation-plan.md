# Platform core and optional modules: implementation plan

Status: implemented. Test execution remains subject to repository permission requirements.

## Agreed outcome

Modules are complete optional business feature sets. Shared platform services belong in core, with one deliberate presentation exception: File Storage remains selectable, but its switch controls only the library navigation and library pages.

| Ownership | Features |
| --- | --- |
| Core platform | Identity/access, organisation identity and settings, auditing/history, operations/maintenance, delivery/notifications, action items, privacy, shared payment infrastructure, storage services and administration |
| Optional foundation business modules | CMS, Support, CRM, Invoicing, Commercial Billing |
| Optional foundation presentation module | File Storage library |
| Private business modules | Vehicle Licensing, Client Management |

Vehicle Licensing remains private, with its existing build selection, descriptor, contracts, migrations and release boundary. Client Management remains provider-side private functionality; customer-side license verification and update infrastructure remain core.

Core ownership does not require one new project, a generic service framework, or moving every file into a `Core` folder. Preserve focused capability/use-case folders within the existing application layers and coordinated packages.

## Required File Storage behavior

| Surface or operation | Library enabled | Library disabled |
| --- | --- | --- |
| Library rail entry, dashboard links and library navigation | Available subject to authorization | Hidden |
| Direct navigation to library pages, including saved deep links | Available subject to authorization | Blocked by the shared route availability guard |
| Core file APIs and services | Available subject to existing authorization | Available subject to existing authorization |
| Storage administration and settings pages | Available to authorized administrators | Available to authorized administrators |
| Attachments in CRM, Invoicing, Support and Vehicle Licensing | Follow their owning workflow and permissions | Same behavior; independent of the library switch |
| Existing public download/share links and their public viewing pages | Existing token and expiry rules | Same token and expiry rules |
| Cleanup, retention, privacy processing and accepted work | Continue | Continue |
| Existing files, folders, shares, quotas and metadata | Retained | Retained |

The library switch is presentation availability, not an API authorization boundary. Keep permissions, active-account checks, public-token validation, quotas, concurrency and destructive-action protections authoritative. Disabling a business module still applies that module's own admission and retained-obligation rules.

## Phase 1: establish the boundary and compatibility contract

1. Reconcile with the current working tree before editing. The audit observed active Commercial Billing/Payments, API and UI changes; use the completed current implementation as the baseline and preserve unrelated work.
2. Add an ADR covering required platform capabilities, optional business modules and the File Storage presentation-only exception. Explicitly supersede affected portions of ADRs 0031, 0035, 0036 and 0048; retain historical decisions.
3. Document two separate inventories: platform technologies/capabilities and selectable modules. `framework.json.modules` is currently a technology inventory, not the activation contract. Clarify this first; rename its schema field only if needed, updating every reader and scaffold together.
4. Keep existing stable IDs where practical. Required core descriptors may remain internal dependency/capability metadata, but must not be presented as optional product modules. Avoid a wholesale catalog-engine rewrite.
5. Inventory deployment overrides, client selection, runtime rows, feature flags, endpoint ownership, capability restrictions and license rules affected by these decisions. Record how obsolete core-disable configuration is removed during upgrades; do not silently ignore invalid configuration.

Completion: one documented ownership model and an explicit upgrade path, without changing namespaces, URLs, permission values or migration history solely for classification.

## Phase 2: make existing platform foundations mandatory

Affected areas: `modules/catalog.json`, `modules/presets`, module composition/tooling, organisation endpoints, audit endpoints, operations and Worker scheduling.

1. Make Organisations, Audit History and Maintenance required platform facilities, without runtime module switches. Identity, audit recording, delivery and shared Payments remain core.
2. Remove their disabling entries from the minimal preset and reconcile other presets, examples and deployment configuration. A minimal deployment must still provide organisation settings, auditing and operational upkeep.
3. Remove obsolete module-admission checks and disablement exceptions from always-available organisation/settings and audit workflows. Preserve authorization and auditing.
4. Separate maintenance's operational controls from module availability. Preserve schedule configuration, `Maintenance:Enabled`, pause/resume, retries and retained jobs; remove redundant module/feature availability controls over the core maintenance facility.
5. Keep organisation and audit navigation permission-filtered. Core availability does not grant a user access.

Completion: business-module selection cannot remove the organisation foundation, audit history or maintenance facility; intentional operational pause controls still work.

## Phase 3: separate core storage from the library switch

Affected areas: FileStorage and Organisations services, HTTP file/attachment groups, runtime settings, capability declarations, Angular destinations/routes/administration and private module descriptors.

1. Keep `file-storage` as the optional library presentation identifier, retaining existing activation state and user selection. Clarify its label/help text and behavior in both supported cultures.
2. Make file persistence, provider access, quotas, sharing, retention and administration unconditional platform registrations. Reuse the existing implementation; reorganize only code whose current ownership is misleading.
3. Remove the dependency from `organisation-files` to the selectable library. Preserve that stable capability as a core storage capability where consumers need compatibility. Ensure `crm-files`, `invoicing-files` and `vehicle-licensing-files` do not become unavailable when the library is disabled.
4. Remove library availability gates from shared file APIs, public-share access, attachment contracts and storage settings. Update ownership metadata and its structural expectations to describe core endpoints accurately. Retain every existing authorization and integrity check.
5. Remove the deployment-availability check in `FileStorageModuleSettingsStore` that currently blocks settings changes when File Storage is excluded. Separate library activation from core storage behavior/settings ownership while preserving independent versions and destructive-setting protections.
6. Apply the library capability only to library destinations and routes, including dashboard links and mobile navigation. Keep core storage administration and public share/view routes outside that route guard. Update administration landing selection accordingly.
7. Ensure deployment/client exclusion, runtime activation, feature flags and license-derived availability cannot indirectly disable core storage. Existing restrictions may affect library presentation only.
8. Preserve activation records and data on disable/re-enable. No file-table move, object-key rewrite, data deletion or reset is needed for this ownership change.

Completion: every row of the File Storage behavior table is represented by the implementation, and the library switch can change without disabling business-module attachments.

## Phase 4: give core ownership of storage quota enforcement

Affected areas: `FileStorageService`, `OrganisationFiles`, `ICommercialEntitlements`, the Commercial Billing entitlement implementation and explicit service composition.

1. Introduce a narrowly scoped core-owned contract for effective storage allowance. Core owns configured quotas, storage usage/reservations and enforcement.
2. Replace storage's direct dependency on the Commercial Billing contract with that core contract. Keep the implementation small and follow existing explicit registration patterns.
3. Have Commercial Billing supply purchased storage allowances through an adapter to the core contract. Keep subscriptions, plans, trials, invoices and purchased-entitlement records owned by billing.
4. Preserve the existing precedence of valid purchased allowance over configured quota, including expiry, unlimited-value semantics and current upload reservation/transaction locking behavior. Do not change commercial policy as part of the refactor.
5. Keep retained purchased allowances effective according to their existing validity when billing admission is disabled. Absence of a purchased allowance uses the configured core quota; do not treat a provider/database error as absence of an allowance.
6. Move storage usage calculation to its storage owner and let billing consume that information through the focused contract when needed. Avoid reciprocal dependencies between core storage and optional billing.

Completion: core storage has no dependency on a Commercial Billing-owned application contract, while existing paid limits and accounting behavior remain intact.

## Phase 5: align module composition, generated contracts and documentation

1. Retain CMS, Support, CRM, Invoicing and Commercial Billing as optional foundation modules. Preserve their current lifecycle controls; this plan does not introduce new runtime switches for Commercial Billing.
2. Retain Vehicle Licensing and Client Management as private modules. Update their dependency declarations only where necessary for the new core storage boundary; preserve physical build exclusion and independent migration ownership.
3. Keep payment provider adapters/configuration in core and commercial policy in its owning business modules. Do not expand payment-provider functionality in this work.
4. Update capability identifier generation, catalog/schema consumers, discovery, scaffolds, client selection and settings-destination metadata together. Generate affected identifiers through their owning tools.
5. Preserve existing API URLs and wire contracts wherever possible. If contracts change, regenerate OpenAPI and affected clients through the approved export/generation workflow, never by hand.
6. Update module ownership, lifecycle, File Storage, billing, deployment and extension documentation. Explain that disabling the library does not stop uploads through authorized module workflows or invalidate public links.
7. Use forward migrations only if persisted state actually needs adjustment. Preserve all prior migrations, schemas, runtime choices and permanent IDs; classification alone does not justify a schema migration.

Completion: documented configuration, generated artifacts, private integrations and module tooling agree with the implemented boundaries.

## Acceptance and validation plan

These are acceptance scenarios, not authorization to write or execute tests. Follow repository instructions: read `verification.md` before requested checks; obtain explicit permission for test execution and specific permission for browser/E2E checks. Add tests or extra hardening only when explicitly requested, while preserving mandatory security, data-integrity and public-contract checks throughout implementation.

| Scenario | Expected outcome |
| --- | --- |
| Minimal deployment | Core organisation, auditing, storage administration and operations remain available to authorized users; business modules/library can be absent |
| Library disabled with CRM/Invoicing/Vehicle Licensing enabled | Owning workflows can still upload/read attachments; no library dependency blocks activation |
| Library disabled with Support tickets enabled | Support attachments retain their existing behavior and permissions |
| Library disabled or excluded at deployment | Library navigation disappears and direct library routes are unavailable; storage APIs/settings remain available under existing access rules |
| Existing public share while library disabled | Valid link works; expired, revoked or invalid token remains rejected |
| Disable and re-enable library | Existing files, folders, links, settings and activation versions are preserved |
| Billing absent or no valid purchased allowance | Configured core storage quota applies |
| Billing admission disabled with a valid purchased allowance | Existing allowance remains effective under retained-obligation policy |
| Concurrent uploads or quota changes | Existing reservation locking and quota integrity remain intact |
| Maintenance paused/resumed | Operational scheduling behaves as configured, independently of optional modules |
| Private module excluded | Its business surface remains excluded without removing core functionality |
| Unauthorized settings/file access | Existing permission, actor and token checks still deny access |

Once authorized, choose the smallest relevant catalog/capability, HTTP boundary, storage/quota and Worker checks. Use PostgreSQL-backed checks for quota concurrency or migration behavior where changed. Validate framework metadata and build affected consumers when required. Browser checks should focus on the library rail, direct routes, core administration and public shares; avoid a full application E2E sweep.

## Suggested delivery sequence

1. ADR, inventory clarification and mandatory core catalog/preset changes.
2. Core storage/library separation across backend, capability graph and UI as one coordinated change.
3. Storage-owned quota contract and billing adapter.
4. Final integration/documentation alignment and the authorized focused validation.

Keep each implementation increment internally consistent and reviewable. Stop once the agreed behavior and required checks are satisfied; further hardening is a separate user-directed step.
