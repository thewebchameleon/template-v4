# ADR 0038: coordinated client Compose releases

Status: Accepted

Native EasyPanel Compose deployments need the same compiled module selection in Web,
API, Worker and Migrator. Independently moving image tags can mix release components;
building private source on the server also unnecessarily places source credentials there.

A reusable GitHub Actions workflow checks out the public foundation and optional private
business repository into a clean workspace. The caller owns its client selection and
reviewed host NuGet locks. Locked restore failures require a deliberate reviewed update.
A build-context-only Docker ignore exception includes those locks without including
other `.local` data. Runtime secrets remain outside source and images.

After application validation and all image publications succeed, one commit advances a
dedicated deployment branch containing digest-pinned Compose, required mount files and
source/selection metadata. The public demo uses `deploy-demo`; private clients use
`deploy` in their own configuration repository. Initial examples are foundation-only and
a generic client with explicit module/repository placeholders. Client details and private locks stay in the private repo;
the foundation contains only a non-secret example selection and caller workflow.

The same bundle includes a Coolify guide and `compose.coolify.yaml`. Its only Compose
difference is Coolify's `exclude_from_hc` flag on the completed Migrator job; startup
dependencies and image digests remain identical. Coolify must process this variant to
add platform labels/networks and consume its extension before invoking Docker Compose.

Native Compose dependencies gate initial startup. Upgrades additionally stop existing
API/Worker processes before migrations; a helper always creates a fresh migration run.
EasyPanel maintenance alone is insufficient because it does not stop background work.
Release publication and live rollout remain separate. This introduces no runtime plugin
loader, new module contract, persistence changes, or destructive migration behavior.

See [EasyPanel examples](../easypanel.md) and [private composition](0034-private-client-module-composition.md).
