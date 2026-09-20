# TemplateV4 on Coolify

Create a Git-backed Docker Compose application from the public TemplateV4 repository. Use
`compose.production.yaml`, preserve the repository during deployment, and keep the application and
volume identities stable. Configure Web port 8080 as the only public domain target.

Set the production values from `.env.example` and `MODULE_DISTRIBUTION_URL`. Deploy the public app,
complete `/bootstrap`, then register under **Administration → Private modules**. Store the returned
credentials in Coolify. `MODULE_APP_TOKEN` pairs later environments to the same app;
`MODULE_BUILD_TOKEN` is unique to this environment.

Turn off automatic and preview deployments. Coolify's normal redeploy does not own the full
stop/build/backup/migrate/start sequence. For private-module installation and updates, SSH to the
server and run the helper from Coolify's preserved checkout. Use the exact processed Compose file,
environment file, and project name shown by that Coolify application so its proxy labels, network,
and volumes are retained:

```sh
COMPOSE_PROJECT_NAME=<coolify-compose-project> \
COMPOSE_FILE=<absolute-path-to-coolify-processed-compose-file> \
COMPOSE_ENV_FILE=<absolute-path-to-coolify-environment-file> \
COMPOSE_PROJECT_DIRECTORY=<absolute-path-to-preserved-checkout> \
sh deploy/private-module-deploy.sh
```

Do not guess these paths or run the command from another clone; that would create another Compose
project. The helper stops writers, resolves and verifies assigned packages, builds all images,
backs up PostgreSQL, runs a fresh migrator, and starts the matching workloads. If Coolify rewrites
the processed file during a deployment, do not run both operations concurrently.

The server needs Node 24, Docker with Compose, Git, and enough build disk. Copy `.local/backups`
off-host. A failed migration remains a forward-fix operation; never use `down -v` or assume an image
rollback reverses schema changes.

See [the private-module guide](../../documentation/docs/private-modules.md) for provider and release
operations.
