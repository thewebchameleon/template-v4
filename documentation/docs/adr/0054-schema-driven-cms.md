# ADR 0054: schema-driven CMS collections and revision approval

Status: Accepted

## Decision

CMS owns user-defined collections, versioned field schemas, items, immutable content
revisions, relationships, scoped role grants, and revision-specific reviews. These
use fixed tables in the existing `cms` schema and the shared EF migration stream.
Field values are JSONB; creating a collection never creates a database table.
Collection and field API keys remain stable. Additions and display-label changes
are supported; removals and incompatible changes are rejected. Adding required
fields to populated collections requires a deliberate content migration.

Articles is the initial collection. The forward migration preserves IDs, slugs,
dates, drafts and published snapshots. `cms.articles` remains a transactional
compatibility projection for retained article endpoints and public blog rendering.
All article writes go through the generic content store, including legacy writes.
Legacy clients preserve fields they cannot represent. Existing sections remain
independent. New collections have no generated website pages.

An item has a draft revision and an independent published revision. Editing creates
a new revision and closes outstanding review work. Submission captures the revision
and approval policy. Reviewers are selected from configured users/roles, intersected
with current collection review permissions. Empty selection uses all authorized
reviewers. Neither the content author nor the submitting user receives their own
review assignment. Distinct approvals are counted against the captured threshold;
permission loss removes a reviewer's authority. Approval can publish automatically
when explicitly configured; the default is a separate publication action.
Published items remain available while replacements are drafted or reviewed.

Action Items owns the inbox and direct assignments; CMS owns decisions and resolves
its system items in the same transaction. `ISystemActionEligibility` lets the owning
workflow enforce current source visibility in inbox and dashboard reads. Ordinary
manual completion cannot approve content. Workflow settings, content transitions,
audit and assignment notifications commit together. Audit excludes content and
review comments. Module runtime locks precede the shared account/access lock;
publication rechecks runtime activation inside that boundary. Disabling CMS stops
new reads and mutations, preserving pending work for reactivation.

CMS permissions support global and collection-specific grants. Schema management
does not itself grant draft reading. Editing, reviewing and publishing include the
read access needed for those operations. Legacy `cms.edit` retains article
read/edit/publish access but grants neither schema management nor review permission.
Scoped changes obey protected-role, self-edit, delegation and session-revocation
rules. `IScopedRoleDelegation` extends role assignment/invitation checks to owned
scoped grants. `IAccessIndicators` adds navigation-only indicators to access tokens;
`cms.access` never authorizes an operation.

External keys use `cms.content.read` plus an explicit collection allowlist. Old
article/section scopes do not imply generic collection access. New collections
default to authenticated access; anonymous published reads require a public-read
setting. Related content must independently be published and accessible. Expansion
is one level and all queries are bounded. Files remain organisation-owned and
are checked through `IFileReferences`; CMS publication never makes a private file
public. Rich text remains Markdown.

## Consequences

This extends ADR 0041's draft/published model and ADR 0050's external API surface.
The legacy article publication action now enforces the configured approval policy.
The initial Articles policy requires one approval; existing published articles stay
published. Built-in administrator grants are synchronized by DatabaseMigrator.

Directus's collections, fields, relationships and versioning inform the authoring
model. Directus itself is not installed or used as a runtime dependency. There is
no general workflow engine, page builder, GraphQL endpoint or scheduled publisher.

See [CMS](../cms.md) for usage, API examples, limits and upgrade steps.
