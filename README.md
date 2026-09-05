# templatev4

Opinionated .NET 10 + Angular 22 / Spartan NG application framework. User management is the canonical vertical slice.

## Local development

Install the toolchains pinned in `framework.json`, Docker, and a trusted .NET development HTTPS certificate.

```powershell
npm ci --prefix src/Web
npm ci --prefix src/Documentation
dotnet tool restore
node tools/framework.mjs dev
```

The local initialization command creates an ignored RSA signing key and trusts the development certificate. Aspire starts PostgreSQL, migrates the database, and runs API, Worker, Web, Mailpit, and Documentation. On an empty database the API prints a one-time administrator bootstrap token to its console. Open the Web endpoint shown in Aspire, visit `/bootstrap`, and submit that token with the initial username and password. The token changes whenever the API restarts until setup is completed. Never reuse the local signing key in production.

Alternatively, copy `.env.example` to `.env`, replace its values, run `node tools/framework.mjs dev-init`, then `docker compose up --build`. Open https://localhost:8443 and trust the local Caddy CA for browser use. Mailpit is at http://localhost:8025. Compose is explicitly a development deployment.

## Verify

```powershell
node tools/framework.mjs validate
dotnet build templatev4.slnx
dotnet test tests/templatev4.Tests
npm run build --prefix src/Web
npm run lint --prefix src/Web
npm run validate --prefix src/Documentation
npm run build --prefix src/Documentation
```

See [the developer guide](docs/README.md), [security model](docs/security.md), and [user-management reference](docs/user-management.md). Framework maturity, known limitations, and upgrade rules are documented in [release notes](docs/upgrades.md).

See [verification](docs/verification.md) for test coverage, contract regeneration and the local end-to-end smoke command. CLI scaffolds require explicit implementation/registration; they do not silently activate new routes or jobs.
