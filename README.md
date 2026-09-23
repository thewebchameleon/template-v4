# TemplateV4

TemplateV4 is a starter app built with .NET, Angular, PostgreSQL, and Docker.
It includes sign-in, administration, background jobs, email, file storage, and
optional business modules.

## Deploy to production

The easiest deployment path is Docker Compose on **EasyPanel** or **Coolify**.
Both platforms run the same four parts:

- **Web** serves the website and sends API requests to the backend.
- **API** handles browser requests.
- **Worker** handles background jobs and email.
- **Migrator** prepares the database before the app starts.

### 1. Check out the source

Check out the intended public repository revision on the deployment server. The
server builds Web, API, Worker, and Migrator from this checkout. Private modules
are resolved as compiled packages during the coordinated build. Read
[Modules](documentation/docs/modules.md) before configuring a private client.

### 2. Set up your hosting platform

Follow the guide for your platform:

- [Deploy with EasyPanel](deploy/compose-platforms/README.md)
- [Deploy with Coolify](deploy/compose-platforms/COOLIFY.md)

Connect the platform to the source checkout and use `compose.production.yaml`.
Keep the checkout and Compose project name stable so updates reuse the same data
volumes.

### 3. Add production settings

Copy the names from
[`deploy/compose-platforms/.env.example`](deploy/compose-platforms/.env.example)
into your platform's environment settings. At minimum, provide:

- the public admin-portal URL;
- a strong database password;
- a production RSA signing key;
- private S3-compatible file storage credentials; and
- real email server credentials.

Keep these values secret. Do not copy development keys, passwords, databases, or
storage into production.

### 4. Start the app

Point your public HTTPS domain to the **Web** service on port `8080`. The hosting
platform should manage HTTPS certificates. Do not expose the API, Worker, Migrator,
or PostgreSQL directly to the internet.

PostgreSQL uses one `postgres` login and `POSTGRES_PASSWORD` for Migrator, API,
and Worker. For the first deployment, PostgreSQL becomes ready, the Migrator
updates the database, and then API, Worker, and Web start. If migration fails,
fix it before starting the rest of the app.

### 5. Create the first administrator

For a new installation, start with one API instance. Find the one-time setup token
in the protected API logs, open `/bootstrap` on your website, and create the first
administrator. Confirm that `/bootstrap` no longer works before adding more API
instances.

## Updating an existing deployment

Before every update:

1. Back up PostgreSQL, file storage, signing keys, and Data Protection keys.
2. Check out the intended source revision.
3. Disable automatic platform deployments and run `sh deploy/private-module-deploy.sh`
   from the preserved checkout with the platform's Compose file, environment file,
   project directory, and project name. The helper stops writers, resolves packages,
   builds images, backs up PostgreSQL, runs Migrator, and starts the workloads.
4. Check service health, then reopen the site.

Do not use `docker compose down -v`; `-v` removes persistent data volumes.

See [Deployment and operations](documentation/docs/deployment.md) for security,
monitoring, TLS, backups, recovery, and troubleshooting.

## Run locally

Install the versions listed in [`framework.json`](framework.json), plus Docker and
a trusted .NET development HTTPS certificate. Then run:

```powershell
npm ci --prefix src/TemplateV4.Angular
npm ci --prefix documentation
dotnet tool restore
node tools/framework.mjs dev
```

Aspire starts the app and its local services. Use the Web address shown by Aspire.
Local keys, Mailpit, and `compose.yaml` are for development only.

## More help

- [Developer guide](documentation/docs/README.md)
- [Verification and tests](documentation/docs/verification.md)
- [Modules](documentation/docs/modules.md)
- [Deployment and operations](documentation/docs/deployment.md)
