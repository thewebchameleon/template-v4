# Schema-driven CMS

The CMS manages **collections** (content types), **schemas** (field definitions),
and **items** (content). Articles is included initially. Users with schema-management
permission can create collections in `/cms` without code or database changes.

## Authoring

Open a collection to list its items or create an entry. Item lists use server
pagination, title/name search, status filtering and sorting. Open **Schema and
settings** to configure fields, public API access and approval rules.

Supported fields: text, rich text (Markdown), numbers, booleans, dates, files,
images, dropdowns, groups, and references to another collection. Any field can
allow multiple values. Groups and references can have nested fields. Keys are
stable API identifiers; labels can change. Existing fields cannot be removed or
converted to an incompatible type, and existing dropdown choices cannot be
removed. Add optional fields directly; required additions to populated collections
need a content migration. Schema versions remain attached to content revisions.

File selection uses the existing organisation library. Files retain their own
access, retention and quota rules; selecting one does not make it public.

### Recipe example

1. Create **Ingredients** (`ingredients`) with a required text `name` field.
2. Create **Equipment** (`equipment`) with a required text `name` field.
3. Create **Recipes** (`recipes`) with `title`, `servings`, `instructions` and `image`.
4. Add a multiple reference field `ingredients` targeting Ingredients. Add nested
   `quantity` (number), `unit` (dropdown or text) and `notes` (text) fields.
5. Add a multiple reference field `equipment` targeting Equipment.

The shared Flour item identifies the ingredient. A recipe's relationship to Flour
stores that recipe's quantity and unit. Values can be reordered in the editor.
Publish reusable ingredients/equipment before publishing recipes that reference
them. The item list displays `title`, then `name`, then the item ID.

## Review and publication

The default is one approval, no self-approval, and a separate publish action.
Collection settings can disable approval, change the required count, select users
and roles as reviewers, or enable automatic publication after approval. Leaving
reviewers empty selects all currently authorized reviewers except the author and
submitter. Assignment does not grant review permission.

Save a draft, submit it, then open the resulting action item to approve or request
changes. Decisions apply to the submitted revision and captured workflow policy.
Editing creates a new revision and closes outstanding tasks; changed content must
be submitted again. A publish operation rechecks the required approvals and current
reviewer authority. The published revision stays visible throughout editing and
review. Unpublishing hides delivery immediately and retains content.

Pending reviews survive module disablement. They cannot publish while CMS is
disabled; re-enable CMS to resume them. If configured reviewers are no longer
eligible, an editor can save and resubmit under an updated reviewer selection.

## Permissions

| Permission | Scope |
| --- | --- |
| `cms.schema.manage` | Define collections and configure schemas/workflows |
| `cms.content.read` | Read drafts and review state |
| `cms.content.edit` | Create/edit entries and submit revisions |
| `cms.content.review` | Review assigned revisions |
| `cms.content.publish` | Publish approved content and unpublish |

Grant these globally through role management or for a specific collection through
its settings. Editing, reviewing and publishing include draft reading. Schema
management alone does not expose content. Global grants are additive; collection
settings cannot restrict an existing global grant.

Changing collection grants requires `roles.manage` and authority over the grants
being delegated. Protected built-in roles and the operator's own roles cannot be
changed here. Affected sessions are revoked. Role assignment and invitation actions
also consider collection-scoped grants. `cms.access` is a derived navigation hint,
not a grantable authorization permission.

Existing `cms.edit` retains article editing/publishing and section access. It does
not grant access to new collections, schema editing or content approval.

## API

Authenticated browser management uses `/api/v1/auth/cms/collections` with existing
JWT/session and CSRF protection:

| Method | Relative path | Purpose |
| --- | --- | --- |
| GET | `/` | Available collections |
| POST | `/` | Create/update a collection with its concurrency version |
| GET | `/{key}` | Collection schema and permitted actions |
| GET | `/access-options` | Reviewer/role choices for authorized managers |
| POST | `/{key}/grants` | Save scoped role grants |
| GET | `/{key}/items` | Paginated draft items |
| POST | `/{key}/items` | Save values as a new draft revision |
| GET | `/{key}/items/{id}` | Current draft, state, decisions and actions |
| POST | `/{key}/items/{id}/transition` | Submit, approve, request changes, publish or unpublish |

New-item payload:

```json
{
  "id": null,
  "version": null,
  "values": {
    "title": "Chocolate cake",
    "servings": 8,
    "ingredients": [
      { "id": "00000000-0000-0000-0000-000000000001", "quantity": 200, "unit": "g", "notes": "Sifted" }
    ]
  }
}
```

Replace example reference IDs with real items. Updates send the item's ID and
latest `version`. Transitions send `{ "version": "…", "action": "submit" }`.
Other actions are `approve`, `changes`, `publish`, and `unpublish`; review decisions
can include `comment`. Stale versions return `concurrency.conflict`.

Published delivery:

```text
GET /api/external/cms/collections/recipes/items
GET /api/external/cms/collections/recipes/items/{id}
GET /api/public/cms/collections/recipes/items
GET /api/public/cms/collections/recipes/items/{id}
```

External routes require an API key with `cms.content.read` and an explicit
collection allowlist configured in **Administration → API Keys**. Include related
collections in that allowlist if consumers need their references. Rotation retains
the same restrictions. Public routes work only for collections explicitly marked
public. Existing article/section scopes and routes remain available.

Query parameters:

- `pageNumber` is one-based; `pageSize` supports 5, 10, 25 or 50.
- `search` matches title/name (or ID when neither exists).
- `sort` accepts `title`, `updatedAt`, or a scalar field key; `direction` is `asc`
  or `desc`. Management also supports `state` and `published` sorting.
- `filter` is a JSON object of equality matches against top-level scalar fields,
  for example `{"servings":8}`; URL-encode it when constructing requests.
- `fields=title,ingredients` selects top-level delivery fields.
- `expand=1` includes each accessible published reference under its `item` key.
  `expand=0` returns references and relationship details without expansion.

Delivery always uses published revision values, including relationship metadata.
Inaccessible/unpublished relationships are omitted; a single inaccessible reference
becomes null. Private or unavailable file references are also omitted. File bytes
still require the existing file-sharing API and its share credential; CMS responses
do not expose private storage keys or sharing tokens. API keys do not authorize
draft access or mutations. Responses are uncached to respect revocation.

## Upgrade and compatibility

Deploy the coordinated API/frontend and run the normal DatabaseMigrator to apply
`20260922164204_SchemaDrivenCms` and synchronize built-in permissions. Generate later
schema corrections as new forward migrations; never replace this migration.

The migration copies article IDs, slugs, timestamps, draft values and published
snapshots into the generic model. Existing article URLs and response shapes remain;
existing sections continue working. Article compatibility data is updated in the
same transaction as generic writes. Old article clients preserve custom fields
when saving. Their publish action now enforces the collection approval policy.

The initial Articles policy requires one approval. Previously published articles
stay published. Users may need to sign in again to receive updated administrator
permissions. New collections are API-only: no page builder or generated routes are
added to the public website.

See [ADR 0054](adr/0054-schema-driven-cms.md) for ownership and persistence decisions.
