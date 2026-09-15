# Module layout and vertical slices

Organize code by its owning module and then by business operation. Use the same
operation names across Application, Infrastructure, HTTP, frontend and tests so a
change such as replying to a ticket is easy to trace.

## Folder names

Private modules keep their existing kebab-case IDs and these PascalCase roots:

```text
business-modules/<module-id>/
  module.json
  Domain/
    Tickets/
  Application/
    Tickets/
      CreateTicket.cs
      ReplyTicket.cs
    Contracts/
  Infrastructure/
    Tickets/
      CreateTicket.cs
      ReplyTicket.cs
    Persistence/
    Migrations/             # retain an existing migration location/history
  Api/
    Tickets/
  Frontend/
    tickets/
      create/
      detail/
    configuration/
    public-api.ts
  Tests/
    Tickets/
    Persistence/
    E2E/
  Docs/
  Tools/
  Contracts/                # generated wire contracts, when present
```

Folders below `Frontend` use lowercase or kebab-case. Backend and test subfolders
use PascalCase. Keep C# filenames and identifiers in PascalCase and Angular
filenames in kebab-case. Descriptor keys such as `host.feature` and `tools.frontend`
retain their existing spelling; their path values follow the folder convention.

Create folders only for implemented concerns. The tree illustrates ownership; it
does not require empty directories or a project for every operation.

## Foundation modules

Foundation keeps its coordinated package and project boundaries. Each layer groups
its source by module: `TemplateV4.Application/Support/Tickets`,
`TemplateV4.Infrastructure/Support/Tickets`, and `TemplateV4.Http/Support`.
The existing Angular host uses `src/app/features/support/tickets`; its internal
folders remain lowercase. Foundation tests use
`TemplateV4.Application.Tests/Support`. Tests spanning multiple modules belong in
`Integration`; existing shared test fixtures retain their lifecycle and isolation.

Module-specific pages, resolvers, translations and services live together under
`features/<module>`. Shell services and genuinely shared controls remain in `core`
and `shared`. Generated API clients stay in their generator-owned output directory.

Existing namespaces, public type names, URLs and operation IDs are preserved by
the layout migration. Folder ownership is not a reason to break an API or rewrite
EF history. New code should use module/use-case namespaces where practical.

## File contents and dependency boundaries

- A small request, validator and handler can share one use-case file. Keep models
  used only by that operation nearby. Put integration interfaces and shared module
  contracts under `Contracts`; do not make every implementation detail public.
- Keep endpoint registration thin and explicit. Several short mappings for one
  concern can share a file. Shared registration and HTTP security helpers remain
  in `TemplateV4.Http/Endpoints`.
- Keep provider-dependent execution in Infrastructure. Existing large services
  are split into operation files using partial classes, retaining their shared
  constructor, helpers, DI lifetime and transaction owner. This is a source layout
  convention, not a new runtime abstraction. Do not introduce a new partial file
  for every trivial helper or spread one operation across unrelated files.
- Keep narrowly scoped policy helpers with their module. Introduce a separate
  service only when a concern needs an independent dependency or lifecycle; avoid
  generic repositories and service location.
- Module-owned persistence entities and mappings live under that module. The
  existing foundation `FrameworkDb` remains the model composition point; its
  shared transaction, migrations and history remain unchanged. Cross-module model
  composition may remain here; do not change database ownership during a file move.
- Preserve actor/organisation checks, command transactions, audit/outbox atomicity,
  concurrency and idempotency. File placement does not relax these boundaries.

## Scaffolding and changes

For module-owned registration, permission declarations and existing reference
workflows, follow [module ownership](module-ownership.md).

`node tools/framework.mjs new feature Reports --module support` creates its
Application slice under `Support/Reports`, its HTTP adapter under `Http/Support`,
and its page under `features/support`. Registration and activation remain explicit.
`new business-module Reports` creates the conventional `Frontend/public-api.ts`
entry point and module-owned guidance in `Docs` and `Tests`.

Update discovery, descriptor tool paths, imports, test harnesses, package inputs
and documentation together when moving source. Record case-only renames through
Git so Linux builds receive the same spelling. Never edit generated clients,
migration designers or model snapshots to accommodate a move; use their owning
tools if their content must change.

Run the manifest and scaffold/discovery checks, affected .NET builds and tests,
and Angular formatting/lint/build. Persistence and session changes require real
PostgreSQL integration coverage. Browser/E2E checks require explicit permission.
See [verification](verification.md) and [ADR 0042](adr/0042-module-vertical-slices.md).
