# Production deployment

Use `compose.production.yaml` explicitly. `compose.yaml` remains local development with Mailpit and a Caddy local certificate. Production uses the Web image's Nginx as the single public TLS ingress; `/api/` and Angular share the same HTTPS origin. API/Worker/PostgreSQL have no public ports. Docker DNS resolution refreshes API upstream addresses after replica replacement. Only the Nginx address is trusted for forwarded headers, and Nginx overwrites client-provided forwarding headers.

Set PUBLIC_URL (for example https://app.example.com), JWT_KEY_ID, SMTP_HOST, SMTP_PORT and SMTP_FROM in the deployment environment. Set SECRETS_DIR to an absolute, access-controlled host directory outside the checkout. The Compose secrets section lists every required file. Connections are separate Npgsql strings for templatev4_migrator, templatev4_api and templatev4_worker on postgres/templatev4. The corresponding password files initialize those roles on a fresh volume. Do not point this configuration at a development database volume. For an existing database, provision roles deliberately before running the migrator.

Supply a 3072-bit or stronger RSA PEM signing key, a password-protected PKCS#12 Data Protection wrapping certificate, its password, SMTP credentials, and the public TLS full chain/private key. Secret files need permissions readable by the intended container UID (1654 for .NET; 101 for Nginx) and protected against other host users. Compose file-backed secrets are host files, not an encrypted secret vault. The key volume is initialized with mode 0700 and persists across deployments.

For a new database, initially run one API replica and read its generated administrator token from the protected server console. Visit `/bootstrap` through the public HTTPS origin and create the first administrator. Confirm the bootstrap page is unavailable, then scale the API normally. Each API replica has its own in-memory token, so multi-replica routing is intentionally unsuitable during this one-time operation. Treat console access as privileged because the token is printed there.

Run:

```sh
docker compose -f compose.production.yaml config --quiet
docker compose -f compose.production.yaml up --build -d --scale api=1 --scale worker=2
```

After creating the first administrator and confirming `/bootstrap` is unavailable, scale the API with `docker compose -f compose.production.yaml up -d --scale api=2`.

The migrator owns schema changes and grants runtime DML privileges after each migration. Runtime roles cannot perform schema changes; only Worker receives Quartz access. Audit access is insert/select, and migration history is not accessible to runtime roles. Application health probes execute through the .NET entry point without requiring a shell in the chiseled image. Shutdown grace is 60 seconds, exceeding the Worker 45-second drain timeout. Restart policies recover exited processes; external monitoring must detect unhealthy but still-running workloads.

Use your server's ACME client or certificate automation to renew the public certificate. Mount the renewed PEM files and recreate/reload Web after renewal. The HTTP listener supports the shared `acme` volume for HTTP-01 challenges and redirects other requests to HTTPS. Test renewal before launch; monitor expiry and alert at least 14 days ahead. Keep certificate issuance credentials out of API/Worker.

Back up PostgreSQL, the Data Protection key ring and its wrapping certificate, signing-key material, and required file storage to encrypted off-host storage. Suggested initial targets: RPO 15 minutes using PostgreSQL WAL archiving and RTO 4 hours, confirmed by a timed restore drill. Retain daily restore points for 30 days according to the application's data policy. Restore into an isolated server, verify migration state, exercise authentication and a queued job, then validate public-origin/TLS configuration before routing traffic. Never claim the targets until measured.

Monitor each `/health/ready` endpoint privately, certificate expiry, database capacity, and oldest pending delivery. The admin operations endpoints under `/api/v1/auth/operations` expose bounded failure summaries. Replay requires settings permission and a CSRF-protected POST to `/operations/replay` with `{id,kind}` (kind `job` or `message`). Investigate the provider failure before replaying; external delivery can duplicate side effects.

Production certificates, real SMTP delivery, off-host backup credentials and a public DNS cutover are deployment inputs; development/browser-test success does not validate those external systems.
