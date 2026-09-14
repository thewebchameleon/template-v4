# TemplateV4 on Coolify

This guide covers the same foundation demo and generic client releases as the accompanying
[EasyPanel guide](README.md). Both platforms use the same four immutable image digests,
module selection, database roles and persistent data. Coolify uses the generated
`compose.coolify.yaml`; EasyPanel uses `compose.yaml`.

## Build a release

| Deployment      | Git repository                     | Release workflow        | Deployment branch |
| --------------- | ---------------------------------- | ----------------------- | ----------------- |
| Foundation demo | `thewebchameleon/template-v4`      | Publish Compose release | `deploy-demo`     |
| Client example  | `your-organisation/client-example` | Release client example  | `deploy`          |

Publish the foundation's Compose workflow/helpers to `main` before running either
workflow. A private client also needs the Actions secret `BUSINESS_MODULES_TOKEN`, with
read-only access to its business-module repository. The demo selects no private modules;
replace the client example's module and repository placeholders before using it.

Run the workflow with the desired foundation/business refs, normally `main`. It
validates the composed application, builds all four images, and advances the deployment
branch only after every image succeeds. The branch contains `release.json`, both
Compose files, the guides, `.env.example`, and the required `deploy/` bind-mount files.
If `compose.coolify.yaml` is absent, publish the updated release tooling and build a
new release before configuring Coolify. Never paste the unresolved source template.

## Create the Coolify application

1. Open a project and environment, select **+ New**, and choose a **Git repository**
   source. For the demo, use the public repository URL. For a client, use an authorized
   GitHub App or a read-only deploy key for its private configuration repository.
2. Select the deployment branch from the table. Under **Configuration → General**,
   choose **Docker Compose** as the **Build Pack**, set **Base Directory** to `/`,
   and **Docker Compose Location** to `/compose.coolify.yaml`.
3. Enable **Preserve Repository During Deployment**. This is required for
   `deploy/nginx.production.conf` and `deploy/init-database.sh` to remain available
   as file bind mounts. A missing file can become a directory and prevent startup.
4. Leave **Raw Compose Deployment** disabled. Coolify must generate the proxy labels
   and platform networking. Leave **Connect To Predefined Network** disabled unless
   a separately reviewed integration requires it. Keep the default Compose start
   command; do not substitute the EasyPanel upgrade script.
5. Save and review **Docker Compose Content**. Confirm all services, image digests,
   health checks, secret mounts and migration completion dependencies are present.
   The Coolify variant adds `exclude_from_hc: true` to `key-permissions` and `migrator`
   so successfully completed one-shot jobs do not make the application unhealthy.
   It does not remove their completion dependencies. This is a Coolify extension;
   use Coolify's processed definition for direct Docker commands, not this source file.
6. Disable automatic deployments and preview deployments for this stateful resource.
   Use the controlled upgrade procedure below. A Git update must not start migrations
   while the old API or Worker still runs.

Use a separate Coolify application and persistent volumes for the demo and each client.
Do not create **Docker Compose Empty** for these examples: it stores pasted YAML and
does not track the Git deployment branch.

## Registry, environment and secrets

Git access and registry access are separate. SSH to the deployment server as the user
configured for that server in Coolify and run `docker login ghcr.io`. Use a read-only
package credential with access to the required images. Authenticate every server that
must pull them. Do not put registry tokens in Compose or Git. Client packages stay private.

Under **Environment Variables**, enter all values from the release's `.env.example`.
Coolify discovers interpolated variables; add any missing network or secret-path
variables explicitly. Required variables must be nonempty before deployment.

| Variable                                | Example or purpose                                                |
| --------------------------------------- | ----------------------------------------------------------------- |
| `PUBLIC_URL`                            | `https://client.example.com`, without the internal `:8080` suffix |
| `JWT_KEY_ID`                            | Identifier for your retained production signing key               |
| `SECRETS_DIR`                           | Absolute server directory, e.g. `/etc/templatev4/client/secrets`  |
| `S3_ENDPOINT`, `S3_BUCKET`, `S3_REGION` | Private HTTPS object storage and client bucket                    |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_FROM`   | Real SMTP delivery configuration                                  |
| `COMPOSE_SUBNET`, `WEB_PROXY_IP`        | An unused subnet and matching fixed Web address                   |

Suggested demo subnet/IP: `172.30.0.0/24` / `172.30.0.10`; client example:
`172.31.0.0/24` / `172.31.0.10`. Avoid existing Docker, LAN and VPN ranges, including
other EasyPanel or Coolify deployments on the server. Review Coolify's processed
network configuration and confirm Web retains that address: the API trusts it for
forwarded HTTPS/client headers. Do not solve address mismatches by trusting all proxies.

Provision the files in [Required secrets](README.md#required-secrets) before Deploy.
They include separate database passwords and connection strings, the RSA signing key,
the Data Protection wrapping certificate/password, S3 credentials and SMTP credentials.
Coolify environment variables do not automatically create these file-backed secrets.
The files must exist on the Docker host and be readable by container UID 1654 with
appropriate host access restrictions. Preserve the key volume and wrapping certificate.

For a fresh database, the included initialization script creates the three application
roles. Existing volumes need deliberate role provisioning; initialization does not
rerun on an already initialized PostgreSQL volume. Never reuse a development volume.

## Domain and first deployment

In the **web** service's **Domains** field, enter `https://client.example.com:8080`
(or your demo hostname with the same suffix). In Coolify, `:8080` selects the internal
container port; users still visit the normal HTTPS origin on port 443. `PUBLIC_URL`
must remain `https://client.example.com`. Configure DNS to the Coolify server and let
Coolify issue the public TLS certificate and manage HTTP-to-HTTPS redirects.

Assign no domains to API, Worker, Migrator or PostgreSQL, and add no host `ports:`.
Web serves Angular and proxies `/api/`, including WebSocket upgrades, over the private
network. The outer proxy must replace untrusted client forwarding headers.

Select **Deploy**, then inspect **Deployments** and individual service **Logs**.
PostgreSQL must be healthy, key setup and Migrator must exit successfully, and API,
Worker and Web must become healthy. Compose defines the health checks; Coolify's
standard Application Healthcheck page does not configure Compose workload probes.

Read the one-time administrator token from protected API logs and complete `/bootstrap`.
Confirm bootstrap is unavailable afterward. For a client deployment, activate the
selected private module under Administration → Modules, satisfying displayed dependencies.
Activate Invoicing if the integration is needed. Installing code alone does not enable
new private modules; existing activation settings survive subsequent releases.

## Redeploying updated releases

Run the release workflow again to build the latest desired foundation and selected
business module source. A Coolify redeploy pulls the latest published deployment-branch
commit, not unbuilt changes in the source repositories. Verify the intended
`release.json` before rollout.

1. Verify backups of PostgreSQL, object storage, the key ring and wrapping/signing
   material. Arrange a maintenance window and keep automatic deployment disabled.
2. **Stop the application in Coolify** and confirm the existing API and Worker are
   stopped. Blocking HTTP alone does not stop background jobs.
3. Deploy the new deployment-branch commit. Changed image digests and the release
   version recreate the Migrator; completion dependencies gate API/Worker startup.
4. Confirm this release's Migrator ran successfully and all long-running workloads
   are healthy. Check System Health's deployment version and the public HTTPS origin.
   If migration fails, keep workloads stopped and investigate before retrying.

For retries of the _same_ release, do not rely on a previously completed Migrator.
An operator must run a fresh migration container while API/Worker remain stopped,
using Coolify's actual processed Compose file, environment file and project identity.
Use its deployment logs to identify these; do not guess paths or project names.
Resume through Coolify only after that migration succeeds.

Do **not** run the supplied `upgrade.sh` unchanged for a Coolify-managed application.
It targets the plain `compose.yaml`, which lacks Coolify-generated labels/networking
and may select a different Compose project. Similarly, a custom start command must
use the same processed definition Coolify parsed. The examples do not configure such
an automated rollout hook; the stop/deploy procedure is the supported guide path.

Retain the same resource and volume identities. Do not use `down -v` or rename volumes
to fix deployment errors. Old image digests can be redeployed only if the retained
schema is compatible; image rollback does not undo migrations or restore data.

## Troubleshooting and sources

- **Unauthorized image pull:** authenticate the server user Coolify uses, not only
  your workstation or GitHub source integration.
- **Mount is a directory:** verify Preserve Repository During Deployment, the Git
  file and its host source path. Fix the mount source without deleting data volumes.
- **No Available Server:** inspect Web health, the `:8080` domain suffix, API health
  and generated proxy/network configuration.
- **Completed setup job shown as unhealthy:** confirm the selected file is
  `compose.coolify.yaml` and Coolify consumed its `exclude_from_hc` settings.
- **Database login failure:** confirm role password files agree with connection
  strings; changing an environment value does not rotate existing PostgreSQL roles.

Based on Coolify's current [Docker Compose documentation](https://coolify.io/docs/applications/builds/docker-compose)
and [registry authentication documentation](https://coolify.io/docs/applications/builds/docker-registries).
These document Git applications, bind-file preservation, domain port suffixes, one-shot
health exclusions, processed networking and server-user Docker credentials.
No live Coolify deployment, certificate renewal or backup restore has been tested by
adding this guide; verify those on the target instance before admitting client data.
