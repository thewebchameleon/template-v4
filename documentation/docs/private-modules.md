# Private modules

Private modules are provider-assigned, compiled extensions. A customer never receives access to
the private source repository and cannot select modules. Installed modules continue to run without
the distribution service; the service is contacted only for registration, update checks, release
resolution, and artifact downloads.

## Register an application

Deploy the public foundation first and create its administrator. Configure the provider endpoint as
`ModuleDistribution__Url` or `MODULE_DISTRIBUTION_URL`, then open **Administration → Private
modules**. Enter the application name, environment and public HTTPS URL. Registration displays the
following values once:

```dotenv
MODULE_DISTRIBUTION_URL=https://modules.example.com
MODULE_APP_ID=<app-id>
MODULE_APP_TOKEN=<reusable-app-registration-token>
MODULE_ENVIRONMENT_ID=<environment-id>
MODULE_ENVIRONMENT=production
MODULE_BUILD_TOKEN=<environment-build-token>
```

Store them in EasyPanel or Coolify. Treat both tokens as secrets and do not commit or print them.
Keep the app token in the platform secret store so another installation can register staging or
development under the same app. Every environment receives a different revocable build token.
Registration grants no modules. The provider assigns modules in its private Client Management
module; dependencies are assigned with them.

## Deploy assigned modules

Disable panel auto-deploy for this stateful Compose application. From the checked-out repository on
the deployment server, with the same environment and Compose project used by the panel, run:

```sh
sh deploy/private-module-deploy.sh
```

Set `COMPOSE_FILE`, `COMPOSE_ENV_FILE`, `COMPOSE_PROJECT_DIRECTORY`, and
`COMPOSE_PROJECT_NAME` to the exact values used by the platform. The script takes a local lock,
stops API/Worker/Web, resolves one compatible release manifest, builds all four images, starts
PostgreSQL, creates a verified local `pg_dump` backup, runs a fresh migrator, and starts the matching
API, Worker, and Web images. The maintenance window includes package resolution and image builds.
Only after all workloads become healthy does the helper advance the local deployed-release record.

The migrator activates a newly installed private module and its dependency closure once. Later
deployments preserve saved activation settings. A migration failure leaves application writers
stopped for inspection and a higher forward-fix release. Keep database backups off-host according
to the deployment recovery policy.

EasyPanel's ordinary Compose deployment runs `docker compose up --build -d`; it does not stop old
writers before migration. Coolify deployment hooks run inside old or new containers and do not own
this complete host sequence. Use the script for private-module upgrades on both platforms and do not
run a panel deployment concurrently.

## Update and freeze behavior

Each deployment resolves the latest compatible release admitted to the registered app. The provider
can freeze a module's updates. Freezing keeps every release already admitted downloadable and does
not disable installed functionality. Resuming updates admits current releases again. If a frozen
module is incompatible with a later public foundation checkout, the build fails without omitting or
downgrading the module.

## Run the provider service

Client Management is itself a private module. Bootstrap the provider deployment from the private
source checkout once; it cannot download its own first copy from a service that is not running yet.
After that deployment, configure these API settings:

```dotenv
MODULE_PUBLISHER_TOKEN_HASH=<sha256-of-64-character-publisher-token>
MODULE_PUBLISHER_MODULES=vehicle-licensing,client-management
MODULE_ARTIFACT_HOSTS=packages.example.com
MODULE_ARTIFACT_TOKEN=<optional-storage-read-token>
```

The comma-separated artifact host allowlist is required. Downloads reject redirects and verify the
published SHA-256 digest.

Provider administrators assign a module to an app on the Client Management page. Assignment also
assigns its dependency graph and admits every release published so far. Publishing a later release
admits it only to apps whose update grant is active. Freeze preserves all previously admitted
versions; resume admits current releases again.

## Build and publish a private release

From a committed `business-modules` checkout, build the compiled artifact:

```sh
node tools/build-compiled-module.mjs vehicle-licensing artifacts/vehicle-licensing-0.2.0
```

Upload the generated compiled `.tgz` to immutable HTTPS storage. Then create, digest, and publish
release metadata from the public repository:

```sh
node tools/releases/cli.mjs module modules/Private/VehicleLicensing \
  @templatev4/vehicle-licensing-compiled release.json https://packages.example.com/vehicle-licensing-0.2.0.tgz
node tools/releases/cli.mjs digest release.json artifacts/vehicle-licensing-0.2.0/templatev4-vehicle-licensing-compiled-0.2.0.tgz
RELEASE_FEED_URL=https://modules.example.com/api/v1/client-management/ \
RELEASE_PUBLISH_TOKEN=<publisher-token> node tools/releases/cli.mjs publish release.json
```

`module.json` and the module's `release.json` supply compatibility and release notes. A published
module/version is immutable. Keep its artifact available while any app has that release admitted.
