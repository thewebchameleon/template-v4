# Example client deployment configuration

Copy this directory into a private client configuration repository such as
`your-organisation/client-example`.

This example composes TemplateV4 with a private business module. Replace
`replace-with-module-id` in `client-modules.json` with the selected module IDs and add
any required foundation dependencies. Application source remains in the TemplateV4
foundation and the organization's private business-module repository.

## Files

- `client-modules.json`: build-time feature selection.
- `client-locks/`: reviewed NuGet host locks for this selection.
- `.github/workflows/release.yml`: builds a coordinated release from chosen refs.
- `deployment/`: local reference copies of the Compose template and deployment guide.

Publish the foundation's new Compose workflow and helper files to its `main` branch
before running this caller. Publish the desired module revisions too; uncommitted
work is not included in CI. Add a read-only module-repository credential as the Actions
secret `BUSINESS_MODULES_TOKEN`. The token is used only for checkout, not Docker build
arguments or runtime containers.

Replace `your-organisation/business-modules` in the example workflow before running it.

Run **Release client example** from Actions. The source refs default to `main`; immutable tags
or commits may be supplied instead. Reviewed lock mismatches stop the release. The
workflow publishes private GHCR images and advances this repository's `deploy` branch
only after validation and all four images succeed.

In EasyPanel, create a Compose Git service for this repository, branch `deploy`, build
path `/`, filename `compose.yaml`. Add its SSH key as a read-only Git deploy key and
configure separate GHCR read access. Copy the generated `.env.example` into the panel
environment, enabling `.env` creation. Use a dedicated secret directory, PostgreSQL
volume and S3 bucket; suggested subnet/IP are `172.31.0.0/24` / `172.31.0.10`.
Route the public domain to `web:8080` using internal HTTP and public HTTPS.

For Coolify, use [the Coolify guide](deployment/COOLIFY.md) and the generated
`compose.coolify.yaml` on the same `deploy` branch. Enable repository preservation
and route the Web domain with the internal `:8080` suffix as described there.

Follow [the EasyPanel deployment guide](deployment/README.md) for secret provisioning,
bootstrap, module activation, backups and stop/migrate/start upgrades. The Compose
template in `deployment/` contains placeholders and is not itself deployable: the
release workflow generates `deploy:compose.yaml` with real image digests.

Private modules start disabled until an administrator activates them. Existing
activation settings and business data survive upgrades. Releasing images does not
automatically deploy to the live server.
