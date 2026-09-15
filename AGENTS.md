# Repository guidance

## Working agreement

- Invoke the `ponytail:ponytail` skill at `full` intensity for every coding task in this repository. Keep it active throughout the task unless the user explicitly says `stop ponytail` or `normal mode`.
- Complete the requested work within its authorized scope. Make routine, reversible implementation decisions using existing conventions. Ask and wait when missing input materially affects scope, public behavior, data safety, or an irreversible action; do not ask again for authorization already given.
- Inspect the working tree before editing and preserve unrelated local changes. Work in the primary agent; parallelize independent reads and checks when useful.
- Scale inspection and validation to the change. Use focused searches and read relevant sections once; avoid full-repo audits for local fixes. Use available timing information without building a separate timing harness.
- Keep updates concise. Finish with the outcome, validation performed, and any remaining limitation. Do not claim checks that were not run.

## Context and ownership

Before changes spanning layers, contracts, dependencies, or conventions, read [framework.json](framework.json), the relevant sections of the [developer guide](documentation/docs/README.md), and applicable [ADRs](documentation/docs/adr). Small local edits need only the affected code and guidance.

- `framework.json` is the source for project paths and toolchain versions; do not duplicate version pins here.
- Use the repo-local [framework-change skill](.agents/skills/framework-change/SKILL.md) for changes spanning framework layers, modules, providers, or public API contracts.
- Angular work also follows [its scoped guidance](src/TemplateV4.Angular/AGENTS.md). Load UI details only when working on the UI.
- Keep affected code, manifest, docs, scaffolding, and CI consistent. New architectural or extension-point conventions need an ADR and extension documentation; routine fixes and instruction refactoring do not.
- Follow the [module layout convention](documentation/docs/module-layout.md): group source by module and use case, use PascalCase module/backend/test folders, and lowercase or kebab-case folders inside `Frontend`. Preserve existing public namespaces and migration histories during source moves.
- Follow [module ownership](documentation/docs/module-ownership.md) and the [module-feature-development skill](.agents/skills/module-feature-development/SKILL.md) when adding or converting modules. Keep registration and permission declarations with their owners, composition explicit, and disabled-module recovery dependencies registered. Use existing Support, CMS, CRM and Invoicing workflows as references; keep coordinated packages and the shared database unless a concrete requirement justifies changing them.

## Boundaries

- Domain and SharedKernel are BCL-only. Application references only Domain and SharedKernel; no generic repositories or runtime service location. Register handlers explicitly.
- Infrastructure owns EF, Identity, providers, and transactions. ApiService adapts HTTP and never references Quartz; BackgroundWorker owns scheduling.
- Regenerate OpenAPI contracts/clients and EF-generated files through their owning tools. Never hand-edit generated clients, migration designers, or model snapshots.
- Never delete and regenerate an existing EF migration. Treat every generated migration name, ID, and file set as permanent migration history; make later schema corrections with a new forward migration so retained databases remain aligned with the migration history table.
- Never log secrets, authorization headers, email action URLs, refresh tokens, or message payloads.

## Validation

Run the smallest checks that demonstrate the changed behavior and affected contracts. Focused reproduction tests may run early; complete relevant formatting/lint, manifest checks, builds, and behavioral tests before delivery. Broaden or repeat checks only for new changes, failures, or unresolved risks. Documentation-only edits need content/link/format checks, not application builds or test suites.

Persistence, session, and messaging changes require real PostgreSQL integration tests. Read [verification guidance](documentation/docs/verification.md) and the affected package scripts or CI steps when choosing commands; do not run every check by default.

E2E tests require explicit user permission: ask and stop if it has not already been granted for this work. This includes browser accessibility checks, Angular's `npm test` (Playwright), and end-to-end smoke scripts. Complete other authorized validation before requesting that permission.
