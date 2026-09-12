# ADR 0023: application-wide module administration

Status: Accepted

## Decision

Administration → Modules (`/administration/modules`) lets built-in Administrators enable or disable Files for the entire application. Delegated `settings.manage` alone is insufficient. The page and endpoints require both settings permission and the Administrator role; the save store also checks current database role membership. Setup-only sessions cannot manage modules.

Persist one versioned row per supported runtime module in PostgreSQL (`app.runtime_modules`). The generated RuntimeModules migration seeds Files as enabled for existing and new installations. Updates use an explicitly registered Application command, validator and handler. The dispatcher transaction commits the conditional version update and audit entry together. Concurrent edits return 409 without overwriting another administrator's change; the editor retains its draft until reload or retry. Audit actions are `module.files_enabled` and `module.files_disabled`, with actor and time but no file names or content.

Runtime activation is an additional application-wide gate below the immutable deployment catalog. Deployment presets and `Modules:files=false` remain hard restrictions. Existing file feature flags can restrict availability further; neither tenant nor user overrides can bypass a disabled runtime module. The Modules page exposes only the supported Files setting, indicates deployment unavailability and cannot enable a deployment-disabled module. Other deployment capabilities remain outside this page.

The complete file endpoint group, including administrator downloads and quotas, checks committed runtime state on each request without a process-local cache. Disabled requests return 404. `/api/v1/modules` reports effective deployment/runtime activation; `/api/v1/features` also applies feature flags. Angular uses the evaluated feature for file navigation, file route guards and embedded user-file controls. Saving refreshes the current browser's navigation; other browsers refresh capability state on navigation or reload. Existing requests already admitted may finish; subsequent requests are blocked. No push invalidation is required.

Disabling does not modify files, folders, quotas or object storage. Re-enabling restores access. Existing privacy deletion and retention cleanup continue independently, so disabling does not suspend established retention rules.

## Extension points and validation

Run DatabaseMigrator before the updated API. Future runtime modules need a seeded row, an explicit validator allowlist entry, an effective-state endpoint gate, localized editor content and navigation/route guards. Update the deployment dependencies separately; runtime activation must never enable a missing provider or dependency. Module scaffolds remain disabled deployment descriptors requiring implementation review; they do not automatically become runtime switches. Regenerate EF migrations and OpenAPI clients using the existing tooling.

Validate PostgreSQL persistence across API instances, role/permission/CSRF denial, optimistic conflicts and transactional audit, complete file API gating and file preservation after re-enabling. Browser tests cover keyboard operation, unsaved changes, save failure, guards, navigation, both themes and narrow reflow, and require explicit permission before execution. Existing CI already discovers the integration and browser test files; browser execution stays opt-in.
