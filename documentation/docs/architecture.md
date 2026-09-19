# Architecture

`framework.json` is the authoritative inventory for versions, projects, generated code,
modules, and extension points. This page records only the boundaries that contributors
must preserve.

## Layers

| Layer | Owns | May depend on |
| --- | --- | --- |
| SharedKernel | CQRS, results, and provider contracts | BCL |
| Domain | Business invariants and domain events | BCL |
| Application | Commands, queries, validation, permissions, and event contracts | Domain, SharedKernel |
| Infrastructure | EF Core, Identity, providers, transactions, and outbox | Application |
| Http | HTTP adapters, authorization, Problem Details, and OpenAPI | Infrastructure, ServiceDefaults |
| ApiService | Explicit host composition | Http and selected module APIs |
| BackgroundWorker | Outbox delivery and Quartz jobs | Infrastructure, ServiceDefaults |
| DatabaseMigrator | Migrations and built-in grant seeding | Infrastructure |
| AppHost | Local orchestration only | Executable projects |
| Angular | Browser application | Generated API clients and Spartan |

Domain and SharedKernel are BCL-only. Application never imports EF, Identity, HTTP, or
provider packages. ApiService adapts HTTP and never schedules work directly; the Worker
owns scheduling and delivery. Replace providers through Infrastructure registration,
not runtime service lookup.

## Request and data flow

Commands and queries pass through tracing, authorization, validation, optional
decorators, and an explicitly registered handler. Commands run inside the transaction
boundary. Expected caller failures use `Result<T>` with stable error codes; exceptions
represent unexpected failures.

Use focused EF operations rather than generic repositories. Only DatabaseMigrator
changes schemas. Existing migration IDs, designer files, and snapshots are permanent
history; corrections require a new forward migration. Outbox delivery is at least once,
so irreversible consumers must be idempotent. Persist culture and W3C trace context with
background work, but never payloads or secrets in diagnostics.

HTTP endpoints are versioned, permission protected, and grouped by feature. Stable
operation IDs drive generated Angular clients. Regenerate generated outputs using the
owner listed in `framework.json`; never edit them manually. Pagination is one-based,
capped at 100, and uses a stable identifier as the final sort key.

## Frontend

Angular routes are lazy and permission/capability guarded, while the API remains the
authority. Spartan Brain provides behavior and copied Helm components under
`src/TemplateV4.Angular/libs/ui` provide styling. Use semantic theme tokens, native form
semantics, labelled errors, accessible dialogs, runtime localisation, and the shared
server-side data table for application data.

Keep shell services in `core`, reusable controls in `shared`, and feature code with its
owning module. See [Modules](modules.md) for layout and composition rules.

## Public contracts

Treat API schemas, error codes, permission IDs, capability IDs, serialized background
messages, migration history, package APIs, and generated-client inputs as compatibility
contracts. Coordinate changes across code, manifest, documentation, scaffolding, and CI.
Record a new decision only when introducing or reversing an architectural convention;
see the [decision log](adr/README.md).
