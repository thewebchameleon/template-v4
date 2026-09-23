# ADR 0035: module categories and client configuration

Status: Accepted; current core boundaries are defined by
[ADR 0051](0051-platform-core-and-file-library.md).

## Decision

The catalog distinguishes required `core`, optional `foundation`, and physically
selected `private` modules. The catalog is authoritative for current category and
dependency membership; ADRs must not duplicate its inventory.

Ignored `modules/client/client-modules.json` uses schema version 1, a `foundation`
boolean map, and a `privateModules` list. Foundation keys must name catalog foundation modules. Private IDs
must be unique kebab-case identifiers. An absent file selects no private modules and
uses preset/default foundation state.

The discovery tool generates `modules/client/business-modules.enabled` and all
build-owned host and frontend composition. Stale generated selection fails before compilation. Explicit
client choices override presets, while deployment restrictions may disable but never
enable client-excluded modules.

Unavailable modules retain activation rows, migrations, and data. Re-inclusion restores
availability subject to current runtime state, dependencies, permissions, and normal
authorization. Package updates never rewrite client-owned selection or source.
