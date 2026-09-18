# ADR 0050: scoped API keys for external applications

Status: Accepted

## Decision

External integrations authenticate with a dedicated credential for each named
application. Administrators with `api-keys.manage` create and revoke keys under
**Administration → API Keys**. The raw credential is generated cryptographically,
shown once, sent as `Authorization: ApiKey tv4_<id>.<secret>`, and never persisted;
only its SHA-256 hash is stored. Optional expiry, revocation, last-used time and an
aggregate authenticated-request count belong to the key. Create and revoke actions
write security audit entries in the same database save as the key change.

API scopes are an independent allowlist rather than user permissions. Each endpoint
requires one explicit scope and its owning module capability. Module disablement
therefore stops new external calls without deleting credentials. Keys are not users,
service accounts or organisation members and do not receive interactive JWT claims.

External routes use the stable `/api/external/<module>` boundary without a version
segment. Breaking contract changes require a deliberate replacement contract rather
than silently changing an existing operation. Internal browser APIs retain their
existing `/api/v1` boundary and CSRF controls.

The first surface is read-only published CMS data: `cms.articles.read` allows article
listing/detail and `cms.sections.read` allows published landing sections. Drafts and
CMS mutations remain interactive-user operations. Per-key rate limits, IP allowlists,
service accounts, webhooks and key rotation workflows are deferred.

## Consequences

Credential lookup parses the embedded key ID and verifies the stored hash with a
constant-time comparison. Authentication failures disclose no key state. Every
authenticated request updates usage metadata; consumers should cache published data
appropriately. Rotation is create-new, deploy-new, then revoke-old so applications do
not lose access unexpectedly.
