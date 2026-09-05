# Verification

Verified locally: 16 passing .NET tests (including real PostgreSQL, session reuse/expiry, transaction/outbox behavior, Quartz persistence and actual execution), CLI regression test, Angular production build/lint/format, Spartan healthcheck, reproducible generated clients, and NuGet/npm vulnerability audits. API/Worker/Migrator/Web container builds and the Compose smoke flow passed. Aspire startup and its HTTPS Web endpoint were also checked. GitHub workflows have been authored but have not been run on GitHub from this local workspace.

Run `node tools/verify.mjs` for manifest, locked restore, .NET formatting/build/tests, Angular formatting/lint/build and npm audit. Run `node tools/audit-nuget.mjs` for all .NET production/test dependencies. Docker must be running for the PostgreSQL tests. Stop a running Aspire instance before rebuilding Debug binaries on Windows.

`node --test tools/cli.test.mjs` verifies deterministic generation, no-overwrite behavior and path validation. `npx ng g @spartan-ng/cli:healthcheck --interactive=false` inside Web verifies the copied component conventions.

The API integration test exports OpenAPI when TEMPLATEV4_EXPORT_OPENAPI points to the absolute `contracts/openapi.json` path. Then run `node tools/framework.mjs clients`. Generation cleans only its owned output path. CI compares the generated contract/client with checked-in files. Never format or edit generated client sources manually.

After `docker compose up --build -d`, `pwsh tools/smoke-compose.ps1` checks sign-in, idempotent invitation, Worker delivery to the local Mailpit sink, durable maintenance request and logout. It reads the ignored local `.env`, never prints credentials, and creates clearly named smoke-test accounts. Its certificate bypass is limited to local development. Query the separate audit schema to verify job completion.

Container images run nonroot with ICU-enabled .NET runtime images for localisation. Compose initializes key-volume ownership before starting workloads. The local PostgreSQL host port is 55432 to reduce collisions with installed databases.
