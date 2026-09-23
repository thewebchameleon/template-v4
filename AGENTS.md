# Repository guidance

## Working agreement

- Complete the requested work within its authorized scope. Make routine, reversible implementation decisions using existing conventions. Ask and wait when missing input materially affects scope, public behavior, data safety, or an irreversible action; do not ask again for authorization already given.
- Read and follow [AI workflow](SUBAGENTS.md) for repository-specific orchestration, model preferences, delegation contracts, and acceptance. Keep orchestration in the primary agent and delegate selectively through native subagents as described there.
- Inspect the working tree before editing and preserve unrelated local changes. Parallelize independent reads and authorized checks when useful.
- Use only the repository-root `.temp/` directory for AI-generated temporary files and folders. Do not create temporary work elsewhere in the repository; remove it when finished.
- Scale inspection and validation to the change. Use focused searches and read relevant sections once; avoid full-repo audits for local fixes. Use available timing information without building a separate timing harness.
- Keep routine work simple: follow the nearest existing pattern, avoid speculative analysis and elaborate scaffolding, and stop once the requested behavior and required checks are satisfied.
- Keep updates concise. Finish with the outcome, validation performed, and any remaining limitation. Do not claim checks that were not run.

## Context and ownership

Before changes spanning layers, contracts, dependencies, or conventions, read [framework.json](framework.json), the relevant sections of the [developer guide](documentation/docs/README.md), and the [decision log](documentation/docs/adr/README.md). Small local edits need only the affected code and guidance.

- `framework.json` is the source for project paths and toolchain versions; do not duplicate version pins here.
- Use the repo-local [framework-change skill](.agents/skills/framework-change/SKILL.md) for changes spanning framework layers, modules, providers, or public API contracts.
- Angular work also follows [its scoped guidance](src/TemplateV4.Angular/AGENTS.md). Load UI details only when working on the UI.
- Keep affected code, manifest, docs, scaffolding, and CI consistent. New architectural or extension-point conventions need an ADR and extension documentation; routine fixes and instruction refactoring do not.
- Follow the [module conventions](documentation/docs/modules.md): group source by module and use case, use PascalCase module/backend/test folders, and lowercase or kebab-case folders inside `Frontend`. Preserve existing public namespaces and migration histories during source moves.
- Follow [module ownership](documentation/docs/modules.md) and the [module-feature-development skill](.agents/skills/module-feature-development/SKILL.md) when adding or converting modules. Keep registration and permission declarations with their owners, composition explicit, and disabled-module recovery dependencies registered. Use existing Support, CMS, CRM and Invoicing workflows as references; keep coordinated packages and the shared database unless a concrete requirement justifies changing them.

## Boundaries

- Domain and SharedKernel are BCL-only. Application references only Domain and SharedKernel; no generic repositories or runtime service location. Register handlers explicitly.
- Infrastructure owns EF, Identity, providers, and transactions. ApiService adapts HTTP and never references Quartz; BackgroundWorker owns scheduling.
- Regenerate OpenAPI contracts/clients and EF-generated files through their owning tools. Never hand-edit generated clients, migration designers, or model snapshots.
- Never delete and regenerate an existing EF migration. Treat every generated migration name, ID, and file set as permanent migration history; make later schema corrections with a new forward migration so retained databases remain aligned with the migration history table.
- Never log secrets, authorization headers, email action URLs, refresh tokens, or message payloads.

## Implementation and validation workflow

Start with the smallest clear implementation that makes the requested core behavior work. Keep the core process visible and easy to understand; do not front-load supporting machinery that obscures it.

Do not write tests, ordinary validation, fallback behavior, or defensive error handling unless the user explicitly requests them. When invalid input can fail naturally with an adequately clear failure, do not add a separate error check. This restriction does not remove mandatory security, data-integrity, or public-contract checks; include those from the start when the change requires them.

After the core implementation is clear, explain the process and let the user use it to build shared understanding. If the user explicitly requests further hardening, work through concrete scenarios with them step by step, then add only the targeted tests, important checks, and justified fallbacks arising from those scenarios. Keep the user in control of that progression: do not infer permission to add these supporting layers from a general implementation request.

Any test execution also requires an explicit user request or permission. Read [verification guidance](documentation/docs/verification.md) before running requested checks, and choose the smallest relevant command set.
