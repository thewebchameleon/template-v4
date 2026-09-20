# ADR 0041: site-wide Markdown blog with server-rendered public pages

Status: Accepted

## Decision

CMS is an optional foundation module owning `cms.articles` in the existing EF
migration stream. The existing module activation and delegated role permission
systems govern availability and authoring. Editors share one site-wide blog.

Each article stores one draft and one published content snapshot. Optimistic
versions protect saves and publication transitions; a database unique index
reserves each slug. Slugs and first-publication dates are permanent after the first
publication. Audit records exclude content and commit with the mutation.

Public `/blog` routes render HTML in the HTTP layer using only published data.
This supplies article content and metadata to crawlers without adding Angular SSR.
The web proxy forwards these routes to the API, while Angular owns authenticated
CMS editing. Canonical URLs use configured `Web:PublicUrl`, never request Host.

Markdig parses Markdown with raw HTML disabled. Custom link rendering allowlists
explicit destinations and suppresses images and automatic links. Metadata is HTML
encoded. The authenticated editor provides WYSIWYG authoring while preserving
Markdown as the stored source. All CMS responses are uncached to preserve unpublish
and disable behavior.

## Consequences

There is no full revision history, workflow engine, media library, organisation
scope or background publishing worker. Public pages follow system light/dark
preferences and use a small static stylesheet; the Angular editor retains existing
application appearance settings. Alternate proxies must route `/blog` to the API.
Accepted requests may finish after disablement, as for other modules.

See [Modules](../modules.md) for extension and lifecycle rules.
