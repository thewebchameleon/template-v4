# Developer guide

The framework manifest is the inventory and version contract. CLI and CI load it directly. `global.json`, central NuGet versions, NuGet lockfiles, npm's exact versions and lockfile pin builds.

| Layer | Responsibility | Permitted dependencies |
| --- | --- | --- |
| Framework.Core | Packaged CQRS/results/provider contracts | BCL only |
| Domain | User profile invariants and domain events | BCL only |
| Application | Feature validation, permissions, handlers and app event contracts | Domain, Framework.Core |
| Infrastructure | EF, Identity, sessions, outbox, SMTP, storage | Application |
| API | HTTP, policy authorization, Problem Details, OpenAPI | Infrastructure, ServiceDefaults |
| Worker | Durable delivery, Quartz scheduling and execution | Infrastructure, ServiceDefaults |
| DatabaseMigrator | Explicit schema and role-metadata seeding | Infrastructure |
| AppHost | Local orchestration only | Executable project references |
| Web | Independent Angular/npm workspace | Generated API contracts, Spartan |
| Documentation | Independent DocMD/npm workspace | Markdown under `docs` |

Start with [user management](user-management.md), then [security](security.md), [operations](operations.md), and [upgrades](upgrades.md). Decisions live in [adr](adr).

The developer guide is rendered by the DocMD project in `src/Documentation`. Aspire runs it locally; `npm run validate --prefix src/Documentation` checks internal links and `npm run build --prefix src/Documentation` produces the static site.

## Golden path

Define a Domain invariant only when it represents business behavior. Add an Application command/query, permission, validator, and explicit handler. Add focused persistence operations to an Infrastructure implementation; never wrap EF in a generic repository. Register the handler and validator in `Registration.cs`. Expose a versioned endpoint with a stable operation ID and permission policy. Run the contract-export API test and regenerate Angular clients. Compose Helm components on a lazy route. Add behavioral tests and update docs/ADRs.

Dispatcher ordering is tracing → authorization → validation → custom decorators → handler, with the decorator/handler chain wrapped in a database transaction for commands. Expected failures are `Result<T>`; exceptions represent failures the caller did not reasonably cause. Error codes are the client contract; translated text is display-only. Pagination is 1-based, capped at 100 items, with stable secondary identifier sorting.

## Extension points

Replace `IIntegrationTransport`, `IEmailSender`, `IFeatureFlags`, or `IFileStorage` through Infrastructure registration. Domain and Application never import a provider. Outbound HTTP uses the shared HttpClient defaults: cancellation, discovery, tracing, bounded resilience, and no retries for unsafe methods. Opt-in idempotency needs a stable actor-scoped key and payload hash. Requests without a key execute normally.

`IExecutionContext` is scoped. HTTP resolves claims and culture; jobs/messages populate an explicit background context. Never pass HttpContext into Application. W3C context is stored with events; diagnostic logs exclude payloads. Security/business audit records are separate from logs.

## Localisation and UI

Supported examples are en-ZA and af-ZA. User preference precedes Accept-Language and the application default. Background event contracts carry culture explicitly. Angular switches UI text at runtime and formats dates, numbers, and currency with Intl. Backend feature flags are authoritative; permission checks remain mandatory regardless of flag state.

Spartan Brain supplies behavior; copied Helm components in `src/Web/libs/ui` supply customizable styling. Use semantic theme colors, fields with labels/errors, accessible dialogs with titles, and native form semantics. `components.json` records ownership and paths. Use `npx ng g @spartan-ng/cli:info --json` before adding components.

## CLI

`node tools/framework.mjs inspect|validate|doctor|dev|clients|upgrade` inspects the manifest, verifies its schema, reports toolchains, starts development, regenerates clients, or explains supported upgrades. `new <kind> <PascalCaseName>` creates deterministic files without overwriting existing work. Supported kinds are command, query, entity, permission, event, consumer, endpoint, job, email, localisation, page, adr, feature, migration. Scaffolds require explicit implementation/registration review; they are not automatically enabled endpoints or jobs.

## Production and security settings

See [production deployment](production.md), [MFA and passkey policy](adr/0005-configurable-mfa-and-passkeys.md), [interactive administrator bootstrap](adr/0007-interactive-administrator-bootstrap.md), [delivery recovery](adr/0006-delivery-leases-and-reconciliation.md), and [package reuse](packages.md). Users land on their own profile; the directory and security settings require administrative permissions. The bootstrap administrator completes factor setup before managing users.
