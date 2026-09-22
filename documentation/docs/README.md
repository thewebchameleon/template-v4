# Developer guide

TemplateV4 is a .NET and Angular modular-monolith starter backed by PostgreSQL.
`framework.json` is the source of truth for tool versions, projects, modules, extension
points, and generated outputs.

## Start locally

Install Docker and the toolchain versions listed in `framework.json`, trust the .NET
development HTTPS certificate, then run:

```powershell
npm ci --prefix src/TemplateV4.Angular
npm ci --prefix documentation
dotnet tool restore
node tools/framework.mjs dev
```

Aspire starts the application and local dependencies. Use the Web address it reports.
Development keys, Mailpit, and `compose.yaml` are not production configuration.

## Where to look

- [Architecture](architecture.md): layer boundaries, request flow, persistence, and
  compatibility contracts.
- [Modules](modules.md): ownership, layout, capabilities, and composition.
- [CMS](cms.md): schema-driven collections, relationships, approval and delivery APIs.
- [Editable dashboards](dashboards.md): shared defaults, personal layouts, and module-owned cards.
- [Security](security.md): authentication, authorization, secrets, recovery, and data
  handling.
- [Deployment and operations](deployment.md): production, upgrades, monitoring,
  recovery, and troubleshooting.
- [Private modules](private-modules.md): registration, provider assignments, compiled artifacts,
  and the Compose maintenance deployment.
- [Verification](verification.md): the smallest relevant checks and generated-code
  workflow.
- [Decision log](adr/README.md): concise architectural history.

Platform-specific deployment details live beside the deployment assets under
`deploy/compose-platforms`. Feature behavior belongs with its owning source module.

## Change workflow

Start at the owning module and implement the smallest complete vertical slice. Add a
Domain invariant only for business behavior; otherwise add the Application
command/query, permission, validator, and explicit handler directly. Add focused
Infrastructure persistence or provider behavior, expose a versioned endpoint, regenerate
the API client when its contract changes, and compose the lazy Angular route.

Keep code, `framework.json`, module manifests, migrations, generated contracts,
scaffolding, documentation, and CI consistent. Do not edit generated clients, EF
designer/snapshot files, or generated module/capability files manually. Preserve
existing migration history and public identifiers.

Before changing a convention or public contract, read the relevant maintained page and
the [decision log](adr/README.md). Add a decision entry only for a durable architectural
choice, not routine implementation detail.
