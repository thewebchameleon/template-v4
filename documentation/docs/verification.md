# Verification

CI runs browser-free frontend tests, backend tests, documentation builds, C# and Angular lint/format checks, and npm/NuGet vulnerability audits. Successful `main` pushes build and publish the five runtime images to GHCR, including the public SSR website. CI does not run browser E2E or package-consumer checks.

The Website project's `npm test` runs Node unit tests, while the admin Angular
project's `npm test` still runs Playwright and requires permission. `WebsiteTests`
runs without a database; see [website](website.md).

Run `node tools/verify.mjs` for the broader local verification suite. Run `dotnet restore src/TemplateV4.Backend.slnx --locked-mode` followed by `node tools/audit-nuget.mjs --no-restore` to audit backend production/test dependencies. Stop a running Aspire instance before rebuilding Debug binaries on Windows.

`node --test tools/cli.test.mjs` verifies deterministic generation, no-overwrite behavior and path validation. `npx ng g @spartan-ng/cli:healthcheck --interactive=false` inside Web verifies the copied component conventions.

Run `node tools/framework.mjs clients` after updating the OpenAPI contract. Generation cleans only its owned output path. Never format or edit generated client sources manually.

After `docker compose up --build -d`, `pwsh tools/smoke-compose.ps1` checks sign-in through the local Nginx proxy, idempotent invitation, Worker delivery to the local Mailpit sink, durable maintenance request and logout. It reads the ignored local `.env`, never prints credentials, and creates clearly named smoke-test accounts. Its certificate bypass is limited to local development. Query the separate audit schema to verify job completion.

Container images run nonroot with ICU-enabled .NET runtime images for localisation. Compose initializes key-volume ownership before starting workloads. The local PostgreSQL host port is 55432 to reduce collisions with installed databases.

`node --test tools/auth-retry.test.mjs` runs isolated Node/RxJS regression checks against the actual interceptor and route-reuse source. It launches no browser. Browser/E2E and merchant sandbox verification remain separate.

Module/capability changes also use `node --test tools/cli.test.mjs tools/capabilities.test.mjs` and `node tools/framework.mjs validate`. `CapabilityTests` covers graph composition and runtime transition rules. See [ADR 0031](adr/0031-declarative-capabilities.md).

Export contracts using the API host's development-only `OpenApi:ExportPath` setting.
`OpenApi:DocumentName` defaults to `v1`; select a registered module document such as
`vehicle-licensing` when regenerating that module's contracts. Use the owning client
generators after exporting; never edit generated contracts by hand.
