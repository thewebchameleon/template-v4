# Developer guide

The framework manifest is the inventory and version contract. CLI and CI load it directly. `global.json`, central NuGet versions, NuGet lockfiles, npm's exact versions and lockfile pin builds.

| Layer            | Responsibility                                                    | Permitted dependencies           |
| ---------------- | ----------------------------------------------------------------- | -------------------------------- |
| SharedKernel     | Packaged CQRS/results/provider contracts                          | BCL only                         |
| Domain           | User profile invariants and domain events                         | BCL only                         |
| Application      | Feature validation, permissions, handlers and app event contracts | Domain, SharedKernel             |
| Infrastructure   | EF, Identity, sessions, outbox, SMTP, storage                     | Application                      |
| ApiService       | HTTP, policy authorization, Problem Details, OpenAPI              | Infrastructure, ServiceDefaults  |
| BackgroundWorker | Durable delivery, Quartz scheduling and execution                 | Infrastructure, ServiceDefaults  |
| DatabaseMigrator | Explicit schema and role-metadata seeding                         | Infrastructure                   |
| AppHost          | Local orchestration only                                          | Executable project references    |
| Angular          | Independent Angular/npm workspace                                 | Generated API contracts, Spartan |
| Documentation    | Independent DocMD/npm workspace                                   | Markdown under `docs`            |

Start with [user management](user-management.md), then [security](security.md), [operations](operations.md), and [upgrades](upgrades.md). Decisions live in [adr](adr).

The developer guide is rendered by the DocMD project in `documentation`. Aspire runs it locally; `npm run validate --prefix documentation` checks internal links and `npm run build --prefix documentation` produces the static site.

## Golden path

Define a Domain invariant only when it represents business behavior. Add an Application command/query, permission, validator, and explicit handler. Add focused persistence operations to an Infrastructure implementation; never wrap EF in a generic repository. Register the handler and validator in `Registration.cs`. Expose a versioned endpoint with a stable operation ID and permission policy in a cohesive `ApiService/Endpoints/*Endpoints.cs` file; `Program.cs` only composes endpoint groups through `MapApiEndpoints`. Run the contract-export API test and regenerate Angular clients. Compose Helm components on a lazy route. Add behavioral tests and update documentation and ADRs.

Dispatcher ordering is tracing → authorization → validation → custom decorators → handler, with the decorator/handler chain wrapped in a database transaction for commands. Expected failures are `Result<T>`; exceptions represent failures the caller did not reasonably cause. Error codes are the client contract; translated text is display-only. Pagination is 1-based, capped at 100 items, with stable secondary identifier sorting.

## Extension points

Replace `IIntegrationTransport`, `IEmailSender`, `IFeatureFlags`, or `IFileStorage` through Infrastructure registration. Domain and Application never import a provider. Outbound HTTP uses the shared HttpClient defaults: cancellation, discovery, tracing, bounded resilience, and no retries for unsafe methods. Opt-in idempotency needs a stable actor-scoped key and payload hash. Requests without a key execute normally.

`IExecutionContext` is scoped. HTTP resolves claims and culture; jobs/messages populate an explicit background context. Never pass HttpContext into Application. W3C context is stored with events; diagnostic logs exclude payloads. Security/business audit records are separate from logs.

## Localisation and UI

Supported examples are en-ZA and af-ZA. User preference precedes Accept-Language and the application default. Background event contracts carry culture explicitly. Angular switches UI text at runtime and formats dates, numbers, and currency with Intl. Backend feature flags are authoritative; permission checks remain mandatory regardless of flag state.

Spartan Brain supplies behavior; copied Helm components in `src/TemplateV4.Angular/libs/ui` supply customizable styling. Use semantic theme colors, fields with labels/errors, accessible dialogs with titles, and native form semantics. `components.json` records ownership and paths. Use `npx ng g @spartan-ng/cli:info --json` before adding components.

Display tabular application data through `src/TemplateV4.Angular/src/app/shared/data-table.ts`, the shared implementation of [Spartan's Data Table guide](https://www.spartan.ng/components/data-table). Feature pages own typed TanStack column definitions and server-side query state; render rich or interactive cells as Angular components with `flexRenderComponent`. Extend the shared composition for cross-cutting table behavior, and do not add page-local table implementations or competing grid libraries.

Authenticated page navigation uses `src/TemplateV4.Angular/src/app/shared/breadcrumbs.ts` in the root header. Add `data: { breadcrumb: 'translationKey' }` to route levels for explicit localized labels; levels without data are derived from their URL segment. A page that needs runtime labels, such as an entity name, can inject `Breadcrumbs` and call `set([{ label: 'users', link: '/users' }, { label: user.displayName }])`. The override lasts until the next navigation starts, and `clear()` restores route-derived values. The current level is text, ancestor levels are links, middle levels collapse on mobile, and the back action follows browser history when a previous in-app page is known.

User feedback follows Spartan's distinction between persistent and transient content: keep `hlmAlert` in the page for state, warnings, and actions that must remain visible, and publish operation results through the single root `hlm-toaster`. Toast copy is localized at publication time; HTTP Problem Details show only their human-readable title. Error codes and trace identifiers remain diagnostic data and must not appear in user notifications. Expected setup-only access failures do not produce a toast because the profile's persistent MFA setup alert provides the required guidance.

The header appearance control offers Light, Dark and System (default), including before sign-in. Following [Spartan dark-mode guidance](https://www.spartan.ng/documentation/dark-mode), `Theme` toggles the root `dark` class; the existing semantic tokens and `color-scheme` style controls and overlays. The browser-local `templatev4-theme` preference persists across reloads and synchronizes across tabs. System mode follows live device changes. `public/theme-init.js` applies the initial preference before Angular renders using an external script permitted by the production CSP. Keep its storage key and normalization consistent with `core/theme.ts`; storage failures must not prevent rendering or changing appearance.

## CLI

`node tools/framework.mjs inspect|validate|doctor|dev|clients|upgrade` inspects the manifest, verifies its schema, reports toolchains, starts development, regenerates clients, or explains supported upgrades. `new <kind> <PascalCaseName>` creates deterministic files without overwriting existing work. Supported kinds are command, query, entity, permission, event, consumer, endpoint, job, email, localisation, page, adr, feature, migration. Scaffolds require explicit implementation/registration review; they are not automatically enabled endpoints or jobs.

## Production and security settings

See [production deployment](production.md), [MFA and passkey policy](adr/0005-configurable-mfa-and-passkeys.md), [interactive administrator bootstrap](adr/0007-interactive-administrator-bootstrap.md), [delivery recovery](adr/0006-delivery-leases-and-reconciliation.md), and [package reuse](packages.md). Users land on their own profile; the directory and security settings require administrative permissions. The bootstrap administrator completes factor setup before managing users.

## UI customization

The template follows [Spartan Sidebar 2](https://spartan.ng/blocks/sidebar#sidebar-2), [Login 2](https://spartan.ng/blocks/login#login-2), and [Signup 2](https://spartan.ng/blocks/signup#signup-2). See [ADR 0010](adr/0010-spartan-design-tokens.md).

- `src/TemplateV4.Angular/src/brand.css`: the project brand guide. Configure the complete primary and neutral shade palettes, light/dark semantic color mappings, chart palette, and separate heading/body font stacks here. The default primary is blue; components continue to consume semantic tokens rather than palette shades directly.
- `src/TemplateV4.Angular/src/styles.css`: global Tailwind/Spartan setup, color-scheme behavior, radius, and base element styles. Tailwind's `--spacing`, `--text-*`, and font-weight theme variables are the shared scales; override them with `@theme` to customize every copied component consistently.
- `src/TemplateV4.Angular/src/design-tokens.css`: sidebar dimensions, header/content spacing, form widths, page titles, authentication panel spacing and image treatment. Keep responsive breakpoints aligned with the Sidebar config and Tailwind breakpoints when changing them.
- Shared `hlmCard` panels use a muted rounded shell with an inset semantic card surface. Tune the `--panel-*` variables in `src/TemplateV4.Angular/src/design-tokens.css`; keep structural card styling centralized in `libs/ui/card` so light, dark and responsive treatments remain consistent across feature pages.
- `src/TemplateV4.Angular/src/app/features/auth-layout.ts`: shared two-column authentication composition and the local `public/auth-background.jpg` artwork. Change the `appBrand` translation for branding.
- `src/TemplateV4.Angular/libs/ui`: owned Helm variants and component styles. Extend these for control-wide changes; prefer their variants and semantic tokens in page templates. Use `hlm-native-select` for native dropdowns, not an unsupported `hlmNativeSelect` attribute.

Public registration is disabled by default. Administrators enable **Allow public registration** under **Admin settings** without additional credential or factor confirmation. New users register at `/signup`, verify email, and receive Reader access. MFA policy still applies. See [registration policy](adr/0009-configurable-public-registration.md).
