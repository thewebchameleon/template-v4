# ADR 0031: declarative capabilities and module activation

Status: Accepted; core/module classification updated by
[ADR 0051](0051-platform-core-and-file-library.md).

## Decision

`modules/catalog.json` is the activation contract. It declares module IDs, category,
dependencies, required/default state, runtime configurability, feature flags, and
additional capabilities. The module ID is its base capability; additional capabilities
automatically depend on their owner.

`ModuleCatalog` validates module and capability graphs. `ICapabilities` evaluates
deployment selection, runtime state, feature flags, and prerequisites. Unknown
capabilities and missing runtime rows fail closed. Permissions, actor state, storage
quota, and financial obligations remain separate operation checks.

`GET /api/v1/capabilities` is the authenticated frontend contract. No client hint,
tenant identifier, route identifier, or feature flag can bypass deployment/runtime
restrictions or prerequisites. Generate C# and TypeScript identifiers with
`node tools/framework.mjs module-ids`; do not hand-edit generated outputs.

## Runtime administration

Only catalog entries marked `runtimeConfigurable` are switches. Generic administration
derives them from the catalog and returns versions plus dependency blockers. Activation
writers lock affected rows in ID order, validate the graph inside the dispatcher
transaction, and commit the state change with its audit event. They never cascade
implicitly or seed missing rows.

Endpoint groups declare module ownership and required capabilities. Accepted-obligation
and cleanup endpoints explicitly remain outside new-work gates. Angular consumes one
typed capability response for routes, navigation, administration, and dashboard links;
failed discovery clears availability and stale responses from another actor are ignored.

Core storage and `organisation-files` do not depend on the optional `file-storage`
presentation module. See [ADR 0036](0036-module-administration-safety.md) for lifecycle
safety and [Modules](../modules.md) for extension workflow.
