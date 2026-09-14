# Coolify deployment examples

The foundation demo and a generic private client application can also deploy through
Coolify's Git-based Docker Compose build pack. They use the same release workflows
and deployment branches as the [EasyPanel examples](easypanel.md).

Follow the [Coolify deployment guide](https://github.com/thewebchameleon/template-v4/blob/main/deploy/compose-platforms/COOLIFY.md)
for Git and registry access, environment and secret files, domains, bootstrap,
module activation, upgrades and troubleshooting. Each generated release includes
`COOLIFY.md` beside the EasyPanel `README.md`.

Select branch `deploy-demo` for the public foundation or `deploy` for a private
client configuration repository, Base Directory `/`, and Docker Compose Location
`/compose.coolify.yaml`. Enable Preserve Repository During Deployment for mounted
configuration files. Leave Raw Compose Deployment disabled so Coolify generates its
proxy labels and networking. The Web domain uses `https://your-hostname:8080`, while
`PUBLIC_URL` uses the public HTTPS origin without that internal port suffix.

The Coolify-specific file adds `exclude_from_hc` for the two one-shot setup services;
it retains their successful-completion dependencies. Stop existing API and Worker
processes before deploying an upgrade. The plain Compose `upgrade.sh` must not be
run unchanged against a Coolify-managed application because it does not include
Coolify's processed labels, networks, environment-file flags or project identity.

See [production](production.md) and [business modules](business-modules.md) for the
shared storage, secrets and module lifecycle requirements. No live deployment is
claimed by these example guides.
