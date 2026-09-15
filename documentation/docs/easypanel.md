# EasyPanel deployment examples

For Coolify's Git-based Docker Compose build pack, see [Coolify deployment examples](coolify.md).

TemplateV4 includes two native Docker Compose examples: the unchanged public foundation
for demos, and a generic private client configuration with a representative business module.

The [EasyPanel deployment guide](https://github.com/thewebchameleon/template-v4/blob/main/deploy/compose-platforms/README.md)
contains the exact source settings, secrets, registry access and upgrade procedure.
The foundation workflow is `.github/workflows/compose-release.yml`; the generic caller
workflow and client selection are under `deploy/compose-platforms/client-example/`.

| Example         | Release workflow        | EasyPanel source branch                   |
| --------------- | ----------------------- | ----------------------------------------- |
| Foundation demo | Publish Compose release | `thewebchameleon/template-v4:deploy-demo` |
| Client example  | Release client example  | `your-organisation/client-example:deploy` |

Run the release workflow with current source refs to build updates. It composes a clean
checkout, uses reviewed dependency locks, validates the selected application and
publishes four images. One deployment-branch commit records their immutable digests,
the source commits and module selection. EasyPanel pulls the newest published release;
it does not load updated module source into already-built images. A client's Git key and
registry pull credential are separate from the CI credential for private module source.

The Web image includes its production Nginx configuration, while the generated release
includes the database initialization file, project-scoped persistent volumes, distinct
database roles with one shared password, environment-backed secrets and migration dependencies. EasyPanel owns
domains and TLS. Docker allocates networking and the API discovers its Web proxy through
DNS. Use separate SeaweedFS volumes and S3 credentials when installing both examples on one server.

For upgrades, stop application workloads before deploying. EasyPanel maintenance hides
HTTP traffic but does not stop Workers. A generated `upgrade.sh` explicitly runs a fresh
Migrator before starting API/Worker/Web and fails closed on migration errors. Generic
deployment triggers are not enabled by the examples because their documented `up`
command alone does not coordinate this stop/migrate/start sequence.

No runtime module defaults or demo authentication behavior change. New private modules
remain disabled until activated; client data and existing activation settings persist.
See [production](production.md), [business modules](business-modules.md), and
[release composition decision](adr/0038-compose-client-releases.md).
