# Production deployment

The platform baseline now requires a private HTTPS S3 endpoint and app credentials in production. Follow [object storage](object-storage.md) before deploying API/Worker, and apply the PlatformBaseline migration through the migrator. Add [monitoring](monitoring.md) to configure alerts and repeatable restore verification. Set `DEPLOYMENT_VERSION` to identify the release in System Health.

Use `compose.production.yaml` explicitly. `compose.yaml` remains local development and is the only deployment that includes Mailpit. The Web image's Nginx serves Angular and proxies `/api/` in both environments, so they share one origin. The `/api/` proxy preserves WebSocket upgrades used by SignalR notifications; the hosting platform ingress must preserve them as well. In production, publish Nginx's HTTP port 8080 through the Coolify/Easypanel proxy and let the platform terminate TLS and manage certificates. Do not expose Web directly or expose API, Worker, or PostgreSQL publicly. Docker DNS resolution refreshes API upstream addresses after replica replacement. The API trusts only the Nginx container address for forwarded headers. Configure the platform ingress to replace untrusted client forwarding headers; Nginx then preserves that trusted client address for API rate limiting.

Set PUBLIC_URL (for example https://app.example.com), JWT_KEY_ID, SMTP_HOST, SMTP_PORT and SMTP_FROM in the deployment environment. Set SECRETS_DIR to an absolute, access-controlled host directory outside the checkout. The Compose secrets section lists every required file. Connections are separate Npgsql strings for templatev4_migrator, templatev4_api and templatev4_worker on postgres/TemplateV4. The corresponding password files initialize those roles on a fresh volume. Do not point this configuration at a development database volume. For an existing database, provision roles deliberately before running the migrator.

Supply a 3072-bit or stronger RSA PEM signing key, a password-protected PKCS#12 Data Protection wrapping certificate, its password, and SMTP credentials for a real delivery provider. Secret files need permissions readable by the intended .NET container UID (1654) and protected against other host users. Compose file-backed secrets are host files, not an encrypted secret vault. The key volume is initialized with mode 0700 and persists across deployments. Mailpit is not part of the production manifest.

For a new database, initially run one API replica and read its generated administrator token from the protected server console. Visit `/bootstrap` through the public HTTPS origin and create the first administrator. Confirm the bootstrap page is unavailable, then scale the API normally. Each API replica has its own in-memory token, so multi-replica routing is intentionally unsuitable during this one-time operation. Treat console access as privileged because the token is printed there.

Run:

```sh
docker compose -f compose.production.yaml config --quiet
docker compose -f compose.production.yaml up --build -d --scale api=1 --scale worker=2
```

After creating the first administrator and confirming `/bootstrap` is unavailable, scale the API with `docker compose -f compose.production.yaml up -d --scale api=2`.

The migrator owns schema changes and grants runtime DML privileges after each migration. Runtime roles cannot perform schema changes; only Worker receives Quartz access. Audit access is insert/select, and migration history is not accessible to runtime roles. Application health probes execute through the .NET entry point without requiring a shell in the chiseled image. Shutdown grace is 60 seconds, exceeding the Worker 45-second drain timeout. Restart policies recover exited processes; external monitoring must detect unhealthy but still-running workloads.

Configure the hosting platform to route the public HTTPS origin to the Web service on port 8080. Coolify/Easypanel owns HTTP-to-HTTPS redirects, ACME issuance, renewal, HSTS, and the external proxy trust boundary; the application Compose stack does not mount public TLS keys. Test issuance and renewal before launch and monitor certificate expiry. Keep certificate issuance credentials out of the application containers.

Back up PostgreSQL, the Data Protection key ring and its wrapping certificate, signing-key material, and required file storage to encrypted off-host storage. Suggested initial targets: RPO 15 minutes using PostgreSQL WAL archiving and RTO 4 hours, confirmed by a timed restore drill. Retain daily restore points for 30 days according to the application's data policy. Restore into an isolated server, verify migration state, exercise authentication and a queued job, then validate public-origin/TLS configuration before routing traffic. Never claim the targets until measured.

Monitor each `/health/ready` endpoint privately, certificate expiry, database capacity, and oldest pending delivery. The admin operations endpoints under `/api/v1/auth/operations` expose bounded failure summaries. Replay requires settings permission and a CSRF-protected POST to `/operations/replay` with `{id,kind}` (kind `job` or `message`). Investigate the provider failure before replaying; external delivery can duplicate side effects.

Platform TLS configuration, real SMTP delivery, off-host backup credentials and a public DNS cutover are deployment inputs; development/browser-test success does not validate those external systems.
