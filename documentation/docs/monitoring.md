# Monitoring and recovery

## Actionable alerts

Apply `compose.monitoring.yaml` alongside `compose.production.yaml`. It adds an OTLP metrics collector, Prometheus, Blackbox Exporter and Alertmanager. Prometheus binds only to loopback; use an SSH tunnel for operator access. API/Worker health endpoints remain private. DNS discovery probes each resolved replica address, not just a single load-balanced hostname.

Supply `${SECRETS_DIR}/alert_webhook` with an Alertmanager-compatible destination URL, and configure `deploy/monitoring/public-targets.json` with your real public origin, for example:

```json
[{"targets":["https://app.example.com"],"labels":{"application":"templatev4"}}]
```

The committed empty target list intentionally sends no probes to a guessed public domain. Alerts cover failed work, a five-minute backlog, replica readiness, stale/missing delivery metrics, public-origin failure and certificate expiry within fourteen days. Change the Prometheus backlog threshold together with `Operations:BacklogWarningSeconds`. Configure notification delivery and test a controlled alert before relying on it; files in the repository are not proof of a working external alert channel.

Worker samples bounded, payload-free gauges every thirty seconds using the existing `templatev4` Meter. Names are `platform.delivery.pending`, `platform.delivery.failed`, `platform.delivery.oldest_seconds`, `platform.jobs.active` and `platform.delivery.sample_timestamp_seconds`. Prometheus normalizes dots to underscores. Take the maximum across replicas for database-wide gauges; never sum duplicate snapshots. A timestamp detects stale collection instead of interpreting stale zeroes as success. The supplied collector handles metrics; route traces to your existing trace backend separately if required.

The Operations page provides current counts, last maintenance, an explicit checked timestamp and deployment version. Set `DEPLOYMENT_VERSION` to a release or commit identifier. A healthy process is not proof of readiness or successful delivery.

The supplied collector accepts traces through a no-op exporter so the application's shared OTLP endpoint does not produce unsupported-service errors. Replace `nop` with your trace backend to retain traces; payload logging is never enabled.

## Repeatable database restore drill

Produce an encrypted off-host PostgreSQL custom-format backup using your established backup system. Decrypt a selected backup into an access-controlled local location, then run:

```powershell
./tools/restore-drill.ps1 -BackupPath /absolute/path/database.dump -ReportPath .local/restore-report.json
```

The script creates a uniquely labelled PostgreSQL 18 container without a network or published ports, restores into a new database, checks migrations and critical schemas, records row counts and elapsed restore time, then removes only its own labelled container and anonymous volumes. It cannot accept a production database connection and never runs `pg_restore --clean`. The JSON report contains no credentials or records. Keep the input backup under the operator's access controls.

This verifies database restoration only. A complete drill additionally restores the Data Protection keys/wrapping certificate, signing keys and object storage into an isolated application deployment; verifies authentication, a queued job, and a sample private file; and measures total elapsed recovery plus backup age. The generated report explicitly leaves these checks false. Do not treat database restore time as RTO or claim RPO from an unverified backup. Record the full drill and repeat after significant schema/provider changes. Existing suggested targets remain RPO fifteen minutes and RTO four hours, subject to measured evidence.

Local execution of browser/E2E validation still requires explicit user permission. Operational drills against real infrastructure require deliberate deployment inputs; this change does not run one against production.
