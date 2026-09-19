# CMS publishing

CMS is an optional foundation module (`cms`), enabled in the baseline and excluded
from the minimal preset. Its only dependencies are Identity and Audit Recording.
Run the Database Migrator before enabling it on an existing deployment. The new
forward migration creates `cms.articles` and seeds the runtime activation row.
The Migrator also synchronizes the built-in Administrator permission claims.

## Editors and publishing

Delegate `cms.edit` through the existing role management screen. This permission
allows editors to manage and publish every article in the shared site-wide blog.
No organisation membership is required. Administrators inherit this permission;
other roles receive no automatic grant. Open **CMS** in the workspace.

Each article has a title (200 characters), unique lowercase URL slug (160), excerpt
(500), public author name (120), and Markdown body (100,000). All are required.
The author is an explicit public byline, not a link to an editor's private profile.
Search, status, sorting and pagination are stored in the editor list's URL.

Save creates or updates the draft. Preview renders the current Markdown body
without publishing it. Publish copies the saved draft to the public snapshot.
Edits to title, excerpt, byline and body remain private until republishing.
Unpublish removes the article from public listings and makes its URL return 404.
The original publication date and slug remain fixed even after unpublishing.
Republishing updates the modification date. Duplicate slugs and stale versions
return 409; conflicting editor text is retained so it can be copied before reload.
All writes and metadata-only audit entries commit in the same transaction.

## Published content

CMS retains explicit published snapshots for articles and landing sections. The
application no longer includes a public website or anonymous CMS routes. Named external
applications can read published content through the scoped external API.

**CMS → Landing page sections** edits hero, about, services, testimonials/
commitment and contact sections. Text, image URLs and alternative text are stored
in a draft snapshot and explicitly published. Empty sections use bundled copy.
Section images support HTTPS URLs; article Markdown retains its existing image restrictions.

Markdown uses Markdig's basic syntax: headings, lists, emphasis, quotes, explicit
links and fenced code. Raw HTML is disabled. Explicit links allow HTTP(S), mailto,
root-relative paths and fragments, excluding control characters and backslashes.
Automatic links render as plain text. Images render their alternative text; media
uploads and embedded content are outside v1. Angular also sanitizes preview HTML.

## Disablement and scope

Administration → Modules disables editor access, preview and CMS public data
routes while retaining all articles and their last published snapshots. Requests
already admitted can finish, following the normal module admission policy.
Re-enabling restores published content. Deployment exclusion also blocks the module.
There are no background jobs or accepted obligations to drain, and no destructive
article-delete operation in v1. Publication records remain site-owned; editors'
public bylines are managed explicitly through article edits and republishing.

Deferred: media library, tags/categories, comments, scheduling, approval workflows,
revision browsing, per-article language variants and organisation-specific blogs.

## External API

Named external applications can read published articles and landing sections with
scoped API keys. Drafts, previews and publishing are never exposed to API keys. The
unversioned routes, credential format and rotation guidance are documented in the
[external API guide](../external-api.md). CMS deployment and runtime capability gates
remain authoritative for these routes.

## Validation

`CmsMarkdownTests` covers supported formatting and active-content filtering. Extend
the endpoint ownership test when adding routes. Follow [verification](../verification.md)
for OpenAPI/client generation and the repository's explicit browser-test permission.

