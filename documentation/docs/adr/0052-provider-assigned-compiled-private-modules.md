# ADR 0052: provider-assigned compiled private modules

Status: Accepted

Supersedes the source-bundle delivery in [ADR 0039](0039-component-releases-and-client-updates.md)
and the runtime commercial licensing decision in
[ADR 0046](0046-commercial-client-management.md). Composition remains build-time and follows
[ADR 0034](0034-private-client-module-composition.md).

## Decision

The provider runs the template with a private Client Management module. Customers self-register an
app and separate deployment environments. Registration issues an environment-scoped build credential
but grants no module access. The provider assigns modules and their dependencies. Assignments admit
immutable releases; freezing stops admission of later releases while retaining download access to
every already admitted release.

Private CI publishes a bounded compiled bundle containing NuGet packages, one Angular package, a
descriptor, and member digests. Customer builds authenticate to Client Management, resolve the latest
complete compatible release set once, and download artifacts through its entitlement-checked proxy.
The generated release manifest and staged packages are shared by Migrator, API, Worker, and Web
builds. Customer builds do not clone private source or hot-load assemblies.

Installed code has no runtime licence dependency. Local module activation, permissions, feature
flags, and capability restrictions continue to govern behavior. A newly installed private module and
its dependency closure are activated by the migrator; subsequent deployments preserve runtime
settings. Freeze and credential revocation affect future downloads only.

Customers deploy through a repository-owned Compose maintenance script. It stops writers, resolves
and builds, backs up PostgreSQL, runs a fresh forward migrator, and starts the matching images. This
first version accepts build-time downtime. Failure after writers stop leaves them stopped for a
forward fix; no automatic downgrade, module removal, schema reversal, or restore occurs.

## Consequences

The central service is a build dependency but not a runtime dependency. Credentials can be copied,
and compiled code can be inspected by administrators of customer infrastructure. Artifact signing
and digest verification protect distribution integrity rather than secrecy. A frozen private module
can constrain future foundation upgrades when no admitted compatible release exists.
