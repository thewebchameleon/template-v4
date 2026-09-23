# ADR 0034: public foundation and private client module composition

Status: Accepted; selection storage updated by
[ADR 0035](0035-module-categories-and-client-configuration.md).

## Decision

The public foundation builds without private repositories. Private shared modules and
client-specific extensions are mounted in the ignored `business-modules/` directory for
source builds. `modules/client/client-modules.json` is the authoritative client
selection: its `privateModules` allowlist controls physical inclusion and its `foundation` map controls
optional foundation inclusion.

`modules/client/business-modules.enabled` is generated compatibility input for MSBuild,
not an editable configuration file. Discovery must regenerate it after
`modules/client/client-modules.json` changes; missing modules, dependencies, or stale
generated selection fail closed. Runtime
activation cannot add physically excluded code.

Private modules own implementation, tests, schema history, generator configuration, and
module documentation. Clean isolated builds prevent generated frontend imports, styles,
or dependency locks from crossing client boundaries. Release configuration records
reviewed source pins, selection, dependency locks, and immutable image digests.

Removing code does not drop its database schema or migration history. Existing
obligations, retention, export, and document references require an explicit removal
plan. See [Modules](../modules.md).
