# Repository AI workflow

This workflow applies only to TemplateV4. Read it together with the root `AGENTS.md` and any guidance scoped to the affected files. It governs delegation, not application architecture, and does not relax repository boundaries or verification permissions.

## Objective and model preferences

Optimize Codex subscription allowance consumed per accepted result, including delegation, review, and rework. Do not assume that lower API prices, fewer tokens, faster completion, or more parallel workers prove allowance savings.

- Root: GPT-6 Sol, xHigh initially.
- Workers: GPT-6 Luna, High by default. Use xHigh selectively for bounded work that warrants deeper reasoning; do not assume it replaces a more capable model for difficult work.
- Use two levels: root and workers. There is no manager agent, and workers must not spawn other agents.
- Repository-local runtime defaults live in [.codex/config.toml](.codex/config.toml): Sol xHigh for the root, Luna High for workers, subagents enabled, and at most two concurrent workers. Explicit session or spawn overrides can change these defaults; Markdown cannot change the active root model. Select worker models explicitly when native tools support it; do not silently inherit a more expensive model and describe it as Luna. If the requested routing is unavailable, report the limitation and keep the task in the primary agent.
- Use native subagents, not separate user-facing tasks as a delegation workaround. If native subagents are unavailable, complete the work in the primary agent.

## Root responsibilities

The root owns requirements, scope, architecture, contracts, delegation decisions, integration, and final acceptance. It remains accountable for worker output and can inspect any underlying artifact.

Delegate only when the bounded assignment is likely to save work overall. The root may research, implement, and make small edits directly when writing instructions and reviewing a handoff would duplicate most of the effort. Do not create a contract or worker merely to satisfy the hierarchy.

The root resolves cross-cutting assumptions before dispatching dependent implementation. It owns integration of worker changes, including semantic conflicts, and reviews the combined result against the original requirements. Worker completion does not establish acceptance.

## Routing

| Work | Default approach |
| --- | --- |
| Independent research | Delegate bounded questions to Luna High; require sources or repository references and uncertainty. Parallelize only independent questions. |
| Routine edits | Delegate substantial, clearly scoped edits to Luna High using nearby patterns. Batch related edits to avoid repeated setup. Perform small obvious edits directly. |
| Complex debugging | Keep the central investigation with Sol. Delegate bounded evidence gathering or independent hypotheses when useful. |
| Features spanning layers | Sol owns design and public contracts. Delegate separable implementation after interfaces are settled; serialize dependent changes. Follow the repository's framework-change and module skills where applicable. |

## Worker contracts and authority

For delegated work, provide a short contract in the assignment; a separate contract file is unnecessary unless the task benefits from one. Include:

- Required outcome and relevant task context, including known findings to avoid repeated exploration.
- Allowed scope and file ownership; specify read-only work when appropriate.
- Decisions the worker may make and conditions requiring escalation.
- Dependencies and agreed interfaces.
- Required evidence, explicitly authorized verification, and a stopping point for stalled work.

Workers read root and applicable scoped guidance themselves. Pass task-specific context and pointers rather than copying the entire repository rulebook into each assignment.

Workers may reason, choose routine reversible implementation details, follow existing patterns, and correct their own mistakes within scope. Escalate changes to public contracts, architecture, dependencies, file ownership, or assigned scope. Challenge contradictory requirements or unsupported assumptions before proceeding with affected work.

Escalations include the relevant evidence, recommended decision, and consequences. The root resolves decisions within existing user authorization and asks the user when missing input materially changes scope, public behavior, data safety, or irreversible actions. Workers pause affected work while a decision is pending.

If a contract changes, the root identifies the revision and notifies affected workers before accepting dependent work. Do not accept results against superseded assumptions.

## Coordination and allowance controls

- Assign one owner to overlapping edits. Workers preserve unrelated changes and do not overwrite one another's work. Use isolated worktrees only when the task warrants their setup and integration cost.
- Bound concurrency by genuinely independent assignments; do not spawn workers simply because slots are available.
- Prefer native completion and wait mechanisms over routine status polling. Inspect progress when intervention is needed.
- After one unsuccessful corrective handoff, reassess the assignment. Narrow it, change the model where supported, or have the root take over rather than repeating the same loop.
- Avoid duplicate exploration, automatic independent reviews, and repeated verification. Add independent review when concrete risk justifies it.
- Keep reports concise and evidence-linked. The root inspects relevant artifacts without automatically repeating the entire investigation.

## Reporting and acceptance

Separate execution state (`RUNNING`, `BLOCKED`, `COMPLETED`) from acceptance evidence (`PASS`, `FAIL`, `UNVERIFIED`). Use `DECISION REQUIRED` for an escalation. Report suspected `DIVERGENCE` with observable evidence, such as an out-of-scope edit or a claim contradicted by a source, rather than an unsupported diagnosis of hallucination.

A completed worker report contains findings or changed artifacts, evidence references, verification actually performed, and unresolved issues. Any `PASS` claim must identify the criterion and evidence; it is not final acceptance. Mark unperformed checks `UNVERIFIED`.

The root audits scope, the relevant changes, and integration against the original request. Its final response states the outcome, checks actually performed, and remaining limitations.

## Verification permissions and measurement

Delegation does not authorize tests or supporting hardening. Preserve the root `AGENTS.md` restrictions on writing tests, ordinary validation, fallback behavior, and defensive error handling. Test execution requires explicit user request or permission; read `documentation/docs/verification.md` before running authorized checks. Convey the exact authorization to workers. Mandatory security, data-integrity, and public-contract obligations remain in force.

Keep measurement lightweight. If evaluating this workflow, compare allowance changes across several similar completed tasks alongside result quality and rework. Usage limits are account-wide: concurrent activity and resets can confound comparisons. Do not claim measured savings without sufficient evidence or build a monitoring system just to run ordinary tasks.
