# TemplateV4 on EasyPanel

Deploying with Coolify instead? Use the accompanying [Coolify guide](COOLIFY.md).

This release is an image-based deployment of TemplateV4. `release.json` records the
foundation commit, business commit, selected modules and all four image digests.
No source checkout, private module token, SDK or image build is needed on the server.

## Two examples

| Deployment      | Configuration repository           | EasyPanel branch | Private modules               |
| --------------- | ---------------------------------- | ---------------- | ----------------------------- |
| Foundation demo | `thewebchameleon/template-v4`      | `deploy-demo`    | None                          |
| Client example  | `your-organisation/client-example` | `deploy`         | Representative private module |

The demo uses the foundation's normal defaults and administrator bootstrap. It does
not enable an authentication bypass, seed shared passwords or erase demo data.
The client example uses explicit placeholders for its private module, repository owner,
foundation dependencies and deployment values. Replace them in the client repository.
Deploying code makes a private module available; activate it under Administration →
Modules after bootstrap. Existing module activation settings survive redeployment.

## Create the release first

The foundation `main` branch must contain the Compose release workflow and helpers.
Local, uncommitted work is not included in a GitHub Actions release. Publish and
validate the intended foundation and business revisions before building a release.

For the demo, run **Publish Compose release** in the foundation repository's Actions
tab, with `foundation_ref=main` (or an explicit tag/commit). It checks out a clean
foundation with an empty private-module selection and creates `deploy-demo`.

For a private client, copy `deploy/compose-platforms/client-example` into its own
configuration repository and replace the organization/repository placeholders. Run
**Release client example** there. Its `main` branch contains
`client-modules.json`, reviewed `client-locks/`, and the caller workflow. Configure
the Actions secret `BUSINESS_MODULES_TOKEN` with read-only contents access to
the client's private business-module repository. Authorize it for the organization if required.
The ordinary `GITHUB_TOKEN` publishes images and the deployment branch within the
caller repository. Enable the organization's required Actions/package permissions.
Keep all client packages private; grant the deployment registry identity read access.

The workflow reads current source refs, records exact commits, runs locked restores,
Angular lint/build, foundation integration tests and selected module tests, then builds
and publishes API, Worker, Migrator and Web. Only after all four succeed does it
advance the deployment branch. A failed build leaves the previous release branch
unchanged. These workflows do not run browser/E2E tests or deploy to a live server.

If a dependency lock is stale, the release fails. In a clean workstation checkout,
select the same modules, intentionally restore without locked mode, review the
resulting `.local/client-locks/` changes and commit those locks in the private client
repository's `client-locks/` directory. Never silently unlock dependencies in release CI.

## EasyPanel configuration

Create a separate EasyPanel project and **Compose** service for each deployment:

1. Choose **Git** source with the repository and deployment branch from the table.
   Set **Build Path** to `/` and **Docker Compose File** to `compose.yaml`.
2. For a client's private Git source, add the service-specific SSH public key displayed
   by EasyPanel as a read-only deploy key on that client's repository, and use its
   private SSH clone URL.
3. Give the Docker identity used by EasyPanel read access to the GHCR packages.
   Git deploy keys do not authenticate container pulls. Configure registry access
   using your panel's registry facility, or `docker login ghcr.io` for the server
   account that runs Compose, with a read-only package credential. Do not store it
   in this repository or the Compose environment. Confirm a private image can pull.
4. Copy `.env.example` into EasyPanel's Environment editor and enable **Create .env
   file**. Set the public HTTPS origin, storage and SMTP details and secret directory.
   Use distinct secret paths, S3 buckets and unused subnets for each deployment.
   Suggested demo subnet/IP: `172.30.0.0/24` / `172.30.0.10`; client example:
   `172.31.0.0/24` / `172.31.0.10`. Avoid existing server/VPN networks.
5. Provision the secret files described below, then Deploy. Initial startup orders
   PostgreSQL, Migrator, API/Worker and Web using Compose dependencies.
6. Add a domain targeting internal service **web**, port **8080**, protocol **HTTP**.
   Let EasyPanel terminate HTTPS and manage redirects/certificates. Preserve WebSocket
   upgrades and replace untrusted forwarded headers at the outer proxy. Do not publish
   API, Worker or database ports. The Compose file has no fixed container names.
7. Read the initial administrator bootstrap token from protected API logs, visit
   `/bootstrap`, create your administrator and verify bootstrap is then unavailable.

The Web image includes its production Nginx configuration. The generated release includes
the PostgreSQL initialization script and uses project-scoped database and key-ring volumes.
Keep the EasyPanel project/service identity and volume definitions stable.

## Required secrets

`SECRETS_DIR` is an absolute protected directory on the Docker host, outside the Git
checkout. Supply these files; no example contains real credentials:

| Filename                                               | Contents                                                        |
| ------------------------------------------------------ | --------------------------------------------------------------- |
| `postgres_password`                                    | PostgreSQL administrator password                               |
| `migrator_password`, `api_password`, `worker_password` | Separate role passwords                                         |
| `migrator_connection`                                  | Npgsql string for `templatev4_migrator`                         |
| `api_connection`                                       | Npgsql string for `templatev4_api`                              |
| `worker_connection`                                    | Npgsql string for `templatev4_worker`                           |
| `jwt_key`                                              | Production RSA PEM private signing key, at least 3072 bits      |
| `dp_certificate`                                       | Password-protected PKCS#12 Data Protection wrapping certificate |
| `dp_password`                                          | Wrapping certificate password                                   |
| `s3_access_key`, `s3_secret_key`                       | Credentials for the private HTTPS S3 endpoint                   |
| `smtp_username`, `smtp_password`                       | Real SMTP provider credentials                                  |

Connection strings use `Host=postgres;Port=5432;Database=templatev4;Username=...;Password=...`.
Use correct Npgsql quoting if a password contains special characters. Password files
and connection strings must agree. File mounts must be readable by container UID 1654
and protected from other host users. Compose file secrets are not an encrypted vault.
On an existing database, provision roles deliberately: initialization scripts only run
on a fresh PostgreSQL volume. Do not mount development database volumes here.

## Updating to latest source

**Build a release, then deploy that release.** Run the release workflow again with
the desired refs (default `main`) to pull the latest foundation and configured business
source. EasyPanel then fetches the updated deployment branch. Clicking Deploy alone
pulls the newest _published release_; it does not compile unpublished source updates.

Before every upgrade, verify an off-host backup and enable EasyPanel maintenance mode.
It hides HTTP traffic but does **not** stop containers or background jobs.

For a panel-managed upgrade, **Stop the Compose service before Deploy**. Confirm API
and Worker are stopped, then deploy the new release branch. If the service remains
disabled, use Start after deployment. The new image digests and `Deployment__Version`
recreate the Migrator; its successful completion gates application startup. Inspect
deployment logs for this release's migration run and health checks before disabling
maintenance. A plain Restart is not an upgrade. For retrying an identical release,
use the explicit script below so a previous successful Migrator is never reused.

For an explicit server-side upgrade, use the EasyPanel service's actual Compose build
directory after its source has been updated to the intended release branch. With no
concurrent panel deployment, run:

```sh
sh upgrade.sh
```

The script validates and pulls first, stops Web/API/Worker, waits for PostgreSQL, runs a
fresh Migrator, and starts workloads only on success.
Never run it from an unrelated clone: that would create a different Compose project
and volumes. Do not use `down -v`. Failed migrations leave workloads stopped for
investigation. Do not enable a generic deployment webhook until an external rollout
process also stops workloads; EasyPanel's documented Deploy command alone does not
guarantee that old Workers are stopped before a new migration.

Verify API and Worker readiness and the expected version in System Health, then
disable maintenance. Image rollback is safe only when the retained schema remains
compatible. Schema recovery requires a reviewed forward fix or coordinated database
restore; do not delete migrations or assume changing image tags reverses migrations.

## Documentation and verification boundary

EasyPanel's current [Compose service documentation](https://easypanel.io/docs/services/compose)
documents Git build paths, `.env` creation, domain targets, dependencies and volumes,
and specifies that Deploy runs `docker compose up --build -d`. Maintenance does not
stop containers. These examples use native Compose, not Swarm stack conversion.

Repository validation cannot prove your registry permissions, secret mounts, DNS,
TLS renewal, SMTP, S3 or server network configuration. Validate those on your instance
before putting client data in service. No live EasyPanel deployment is implied by
the presence of these example files.
