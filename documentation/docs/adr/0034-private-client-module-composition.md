# ADR 0034: public foundation and private client module composition

Status: Accepted

Supersedes the include-every-module discovery policy in
[ADR 0033](0033-business-module-discovery.md). Each client has its own deployment and
database. The public foundation must build without access to private repositories.

Private shared modules and client-specific extensions live in a separate repository,
mounted at ignored `business-modules/` for source builds. Ignored
`business-modules.enabled` is an explicit build allowlist, shared by backend and frontend
composition. An absent or empty file includes no business modules. Missing selections
or dependencies fail closed. Runtime activation cannot add excluded code.

Modules own their implementation, tests, schema history, generator configuration and
documentation. Foundation tools are generic; foundation tests use synthetic business
fixtures. Generated frontend imports/styles and client host dependency locks are local
build artifacts. Public host lockfiles retain foundation-only dependencies.

Private release configuration records foundation/business commit pins, selection,
reviewed dependency locks and image digests. Clean isolated client builds prevent stale
outputs from crossing client boundaries. Current source integration uses the documented
mount layout and foundation public APIs. Package composition is a future distribution
option, not a claim that arbitrary standalone layouts are already supported.

Shared modules use configuration; unique client behavior uses extension modules through
explicit application contracts. Source delivery to clients must select agreed module
content without exposing the private repository's unrelated modules or history.

No schema is dropped on module removal, and existing migration IDs and file sets remain
permanent. See the [integration guide](../business-modules.md).
