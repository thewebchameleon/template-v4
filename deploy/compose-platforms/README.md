# TemplateV4 on EasyPanel

Create a Git-backed Compose service from the public TemplateV4 repository and use
`compose.production.yaml`. Keep the repository checkout and Compose project name stable so the
same PostgreSQL, key, and object-storage volumes are reused.

Copy `.env.example` into EasyPanel's environment editor. For the first deployment, set the normal
production values and `MODULE_DISTRIBUTION_URL`. Deploy the public application, complete
`/bootstrap`, and register it under **Administration → Private modules**. Copy the returned app,
environment, and build credentials back into the environment editor. Keep `MODULE_APP_TOKEN` so
the same app can register another environment; each environment receives its own
`MODULE_BUILD_TOKEN`.

Disable automatic deployments. EasyPanel's ordinary Deploy operation does not stop API and Worker
before a migration. For initial private-module installation and every later update, open a shell in
the service's actual Git checkout and run the repository helper with the same Compose project name:

```sh
COMPOSE_PROJECT_NAME=<easypanel-project-name> \
COMPOSE_FILE=compose.production.yaml \
COMPOSE_ENV_FILE=.env \
sh deploy/private-module-deploy.sh
```

The helper stops writers, resolves one provider-assigned compatible module set, downloads and
verifies compiled packages, builds all images, creates a PostgreSQL backup, runs a fresh migrator,
and starts API, Worker, and Web. A failure leaves writers stopped. Fix it with a later release and
run the helper again; do not roll back migrations or use `down -v`.

Configure the public domain against Web port 8080. Do not publish API, Worker, Migrator, or
PostgreSQL. Store `.local/backups` off-host according to your recovery policy. The build host needs
Node 24, Docker with Compose, Git, and enough disk for image builds; customers never need access to
the private source repository.

See [the private-module guide](../../documentation/docs/private-modules.md) for registration,
assignment, freeze, and release behavior.
