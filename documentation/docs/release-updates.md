# Releases and client updates

TemplateV4 supports a centrally hosted authenticated release feed, independent private
module versions, administrator notifications, and client upgrade pull requests.
[ADR 0039](adr/0039-component-releases-and-client-updates.md) defines the contracts.

## Host the central feed

Build `services/release-feed/Dockerfile` from the repository root or run
`docker compose --profile release-feed up release-feed`. The service binds to the
localhost `RELEASE_FEED_PORT`. Put it behind your HTTPS reverse proxy. Keep its HTTP port private,
limit request rates and request bodies at the proxy, and disable authorization-header
logging. It needs no access to client databases or the GitHub package registry.

Mount a persistent `/data` volume and read-only
`/run/secrets/release-credentials.json`. The image runs as Node's nonroot user; mounted
files must be readable by UID 1000 and the data volume writable by that user. Back up
the data and credential configuration. Run one instance per local volume; replicas
need a filesystem supporting atomic create/link operations and shared storage.

The credential file has this shape (replace hashes with SHA-256 of independently
generated random tokens of at least 32 bytes; do not use these placeholder values):

```json
{
  "credentials": [
    {
      "sha256": "<64 lowercase hex characters>",
      "role": "publisher",
      "modules": ["foundation", "reports"]
    },
    {
      "sha256": "<a different token hash>",
      "role": "client",
      "modules": ["foundation", "reports"]
    }
  ]
}
```

Assign a separate client credential per deployment and preferably another for its CI.
Store raw tokens in your secret manager, not this file or source control. Rotate by
adding the new hash, updating the consumer secret and removing the old entry. Set
`disabled: true` to revoke an entry. Configuration is reread on every request; replace
the host file atomically and ensure your bind mount reflects the replacement.

`GET /healthz` is public and reports process liveness. `GET /v1/releases` requires a
bearer credential and returns only its entitled components. `POST /v1/releases` requires
a publisher credential entitled to that component. Repeating identical metadata is
idempotent; changing an existing component/version returns 409. Do not overwrite old
versions. Publish a corrective newer version. Feed failures fail closed and never
cause clients to upgrade automatically. The current feed is bounded to 1,000 records
per client and 4 MiB; monitor growth and extend pagination before reaching these limits.

## Publish foundation releases

Before tagging, update the coordinated framework/package versions using the existing
[upgrade conventions](upgrades.md), `releases/foundation.json` and
`releases/migration-notes.txt`. Set repository variable `RELEASE_FEED_URL` and secret
`RELEASE_PUBLISH_TOKEN`, along with the existing package-publishing configuration.

The tag workflow publishes NuGet/npm packages and images, then creates release notes
and announces metadata. It does not announce failed artifact builds. If announcement
fails after artifacts succeed, retain the exact release metadata and retry
`node tools/releases/cli.mjs publish <metadata.json>` with the publisher environment.
No artifact rebuild or migration-history replacement is required.

## Version and publish each business module

Keep these fields in the module's `module.json`:

```json
{
  "version": "1.2.0",
  "foundationCompatibility": { "min": "0.2.0", "maxExclusive": "0.3.0" },
  "dependencyVersions": {
    "another-private-module": { "min": "1.0.0", "maxExclusive": "2.0.0" }
  }
}
```

These supplement the existing descriptor. Declare version intervals for each private
dependency; foundation capabilities such as CRM are covered by the foundation interval.
Each release has a stable `major.minor.patch` version without leading zeroes or
prerelease/build suffixes. An interval is a compatibility claim that the publisher
must validate, not proof of every possible client combination. Scaffolds start at
module version 0.1.0 with a conservative foundation interval.

Add module-owned `release.json` containing `notesUrl` (HTTPS), `migrationNotes` (text,
including required forward migrations) and `breaking` (boolean). Keep a private release
validation selection at `business-modules/releases/client-modules.json` and its reviewed
host locks under `business-modules/releases/client-locks`. The selection must include
the module being released and its prerequisites.

From the private repository, call the reusable
`.github/workflows/publish-business-module.yml` workflow at an immutable foundation
commit. Supply `foundation_commit`, `module_id`, `package_name` such as
`@your-owner/reports-source`, and the publisher secret. Configure the caller's
`RELEASE_FEED_URL` variable. Grant its GitHub token permission to publish that package.
This validates the selected composition and module tests, publishes one package, then
announces that module's release. The package contains only that module's tracked
source, excluding hidden files and build-output folders; symlinks are unsupported.
Unrelated private modules and repository history are not included. Inspect the bundle
before your first publication. Required additional frontend dependencies must already
be covered by the foundation/client's reviewed npm lockfile.

The underlying commands are `module`, `bundle`, `digest` and `publish` in
`tools/releases/cli.mjs`; publication credentials come from environment variables.
If package publication succeeds but feed announcement fails, retry only announcement
with the same metadata. A duplicate npm version is intentionally not overwritten.

## Initialize a versioned client repository

Obtain the chosen published records from the entitled feed and place them unchanged in
an input manifest:

```json
{
  "schemaVersion": 1,
  "channel": "stable",
  "components": [
    "replace with the complete foundation and selected module records"
  ]
}
```

The strings above are explanatory placeholders, not a valid lock. Keep the full
foundation record and one full record per selected private module. They pin commit,
package digest, release notes and compatibility. Then run:

```sh
node tools/releases/cli.mjs init-client /path/to/chosen-releases.json /path/to/client
```

This creates `client-template.json` and pinned `release.yml`, `updates.yml`, and
`validate.yml` workflows without overwriting existing files. Keep the usual
`client-modules.json` and reviewed `client-locks/` alongside them. Client repositories
must track `client-template.json`; it is ignored only in the foundation's development
workspace. These workflows require the chosen foundation commit to contain this tooling.

Set client variable `RELEASE_FEED_URL`, secret `RELEASE_FEED_TOKEN`, and secret
`MODULE_PACKAGES_TOKEN` with read access to only the entitled GitHub Packages. Enable
Actions permission to create pull requests. Workflow-pin updates also require a token
allowed to update workflow files; use a narrowly scoped GitHub App token if your
repository policy restricts the built-in token.

The daily update workflow compares current pins to the newest entitled releases,
checks the complete proposed dependency combination and opens one draft PR. It keeps
reviewer changes on that branch and updates foundation workflow pins when needed.
An incompatible newest combination leaves pins unchanged and fails the check for
operator attention; choose an intermediate compatible set manually if appropriate.
Dependency lock mismatches fail validation. Review and update those locks in the PR,
then rerun validation. The explicit validation job checks bot-generated proposals even
when GitHub does not trigger the normal pull-request workflow.

After review and merge, manually run **Build pinned client release**. It checks out the
pinned foundation, downloads selected module artifacts from GitHub Packages, verifies
digests and descriptors, builds the coordinated images and publishes the deployment
branch. The release record includes each installed component. Deploy that branch using
the existing [EasyPanel](easypanel.md) or [Coolify](coolify.md) procedure.

## Enable deployed notifications

The API and Worker use the version metadata embedded by host generation, so the page
reports the deployed build rather than the current repository branch. Unpinned local
builds can view installed metadata but cannot enable feed checks. Run the new forward
foundation migration before starting upgraded hosts.

For API and Worker, configure:

| Setting            | Value                                                     |
| ------------------ | --------------------------------------------------------- |
| `Updates__Enabled` | `true`                                                    |

Set `UPDATES_ENABLED=true` in the deployment environment. The API and Worker appsettings
contain placeholder feed URL and token values; replace both before enabling updates.
Deployments without a feed leave updates disabled.

Administrators see **Deployment health** under **Administration → System Health**. The Worker checks at startup and
every six hours, notifying current Administrators once per newly detected component
release. Disabled compiled modules are still checked. A module absent from the build
does not appear or produce a notice. Failures retain prior results and show an
unavailable status; results older than 48 hours are marked stale. Refresh reloads the
saved results; it does not bypass the worker interval. No update is installed by the
running application. Client rollout remains a separate reviewed operation.

Copied template repositories with custom source still need a reviewed source merge;
the generated client workflows target composition-based repositories.
