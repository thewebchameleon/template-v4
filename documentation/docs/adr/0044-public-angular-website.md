# ADR 0044: independent public Angular SSR website

Status: Accepted

## Decision

Add `TemplateV4.Website` as a separate Angular SSR application. Deploy it on the
public hostname and keep the existing Angular admin portal on its own hostname.
The public app renders the business landing page, blog and contact page. It owns
canonical metadata, Open Graph, JSON-LD, robots and sitemap delivery. This replaces
the HTTP-layer blog rendering in ADR 0041; CMS editing and publication snapshots
remain in their existing module.

Website identity and explicit publication are foundation settings in `website`,
independent of CMS activation. Bootstrap creates the administrator using its existing
one-time token. After sign-in and any required account-security setup, administrators
with missing business details enter the website wizard. The wizard captures business
identity, contact information, branding, separate origins, SEO defaults and an enquiry
notification recipient. Saving details does not enable the website. Administrators
review the saved summary and explicitly enable it. Existing installations also start
with the public website disabled and are directed to setup when details are missing.

CMS owns draft and published snapshots for named landing sections and existing blog
articles. The public app uses bundled sections and sample posts when CMS is disabled.
Successful public CMS responses enter a bounded, per-process outage cache. Only
transient failures use that cache. Confirmed missing articles evict their cache entry.
CMS disablement clears cached content; published empty collections remain empty.
No draft, credential or notification address enters the public view model.

The website publication state is fetched on every request and is never cached. Before
publication, render a neutral Coming Soon page with noindex. If control state cannot
be read, return a noindex 503 instead of assuming the site is still enabled. The
sitemap uses live published articles and never outage-cache entries.

Contact is an independent runtime-configurable module with `contact.manage` permission.
Public submissions require both an enabled website and Contact capability. The inbox
and mark-read operation remain available for retained enquiries after disablement.
Enquiry creation, audit and a protected recipient/link notification commit atomically.
Accepted notifications use the existing outbox, SMTP and retry/lease mechanism and
continue after module disablement. Email contains a link to the inbox, not visitor text.

Uploaded website images use the existing provider-neutral storage contract, independent
of File Storage activation. Accept bounded PNG/JPEG/WebP files and generate opaque storage
keys. These are explicitly public assets; the administration upload control explains
that fact. External image URLs must use HTTPS. Canonical origins allow no credentials,
path, query or fragment. Admin setup endpoints retain role, permission and CSRF checks.

## Consequences

Deploy and monitor an additional Node process. Backend availability is still required
for site-control reads and contact delivery; disabling CMS does not remove that need.
Outage content is per replica and resets on restart. A previously published article may
remain visible during a CMS outage until a live response confirms its removal.

The wizard retains saved settings, with version conflicts reported for concurrent edits.
Unsaved form changes use the portal's navigation/unload protection. Images and enquiries
are retained; this change does not add an image deletion or enquiry retention scheduler.
The public sample copy is English; administrator controls have both supported cultures.

See [website setup and deployment](../website.md).
