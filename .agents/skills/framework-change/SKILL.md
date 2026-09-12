---
name: framework-change
description: Implement TemplateV4 changes spanning application layers, modules, provider boundaries, or public API contracts. Use for coordinated framework changes; skip isolated UI styling, copy edits, and local refactors without contract changes.
---

# Framework changes

Use repository-root paths for commands below. Root `AGENTS.md` owns execution and validation policy; this skill supplies the cross-layer workflow.

## Locate the affected slice

Read [framework.json](../../../framework.json) for current paths and [the developer guide](../../../documentation/docs/README.md) for the relevant extension point. Follow one nearby implemented feature through its entry point, handler/use-case service, registration, and persistence/provider implementation. Reuse that pattern without copying unrelated behavior.

Read only decisions relevant to the change under [documentation/docs/adr](../../../documentation/docs/adr):

- CQRS and transactions: `0001-golden-path.md`.
- Scheduling or delivery: `0003-durable-worker.md`, `0006-delivery-leases-and-reconciliation.md`.
- HTTP or account security: `0013-endpoint-registration-files.md`, `0014-account-security-use-case-boundaries.md`.
- Module lifecycle or isolation: `0018-saas-module-lifecycle.md`, `0019-saas-customer-isolation.md`; runtime activation also uses `0023-runtime-module-administration.md`.

For other features, select their ADR from the directory; do not load the entire decision history.

## Implement and connect

Follow the guide's Golden path for the affected layers. Register handlers, validators, permissions, and endpoint groups explicitly; scaffolding does not activate them. Commands own transaction boundaries, and state, audit, and outgoing events commit atomically. Keep expected failures in `Result<T>` and stable error codes; translated text is display-only.

For new scaffolds, inspect the relevant `node tools/framework.mjs new` template before invoking it with the requested kind and PascalCase name. Review generated stubs and complete their registrations. For modules, also check catalog/preset entries, endpoint and route gates, and disable/drain behavior. Use current manifest paths rather than assuming every feature touches every project.

## Synchronize contracts and validate

- For HTTP contract changes, use the existing API integration test with `TEMPLATEV4_EXPORT_OPENAPI` set to the absolute `contracts/openapi.json` path, then run `node tools/framework.mjs clients`. Inspect the generated diff and build the affected consumer after regeneration. See [verification](../../../documentation/docs/verification.md) for prerequisites.
- For persistence changes, generate EF migrations through the existing tooling and review schema/data effects. Validate with real PostgreSQL integration tests under the root policy.
- Update only affected inventory, scaffold, deployment/CI, and developer-documentation surfaces. Run `node tools/framework.mjs validate` when those framework contracts change.
- Choose focused checks from current package scripts and CI. Surface missing prerequisites and remaining validation; do not substitute mocks for required PostgreSQL coverage or bypass E2E permission.
