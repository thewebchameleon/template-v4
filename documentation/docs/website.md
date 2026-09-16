# Public business website

`src/TemplateV4.Website` is a separate Angular SSR application for a business landing
page, journal/blog, contact form and admin sign-in links. It uses the same Angular
version as the portal. It renders meaningful HTML and SEO metadata on the server,
then hydrates for client navigation and form submission.

## First run

1. Run the Database Migrator. The forward migration creates Website settings,
   CMS sections and Contact enquiries; the public website starts disabled.
2. Use the portal's existing bootstrap token flow to create the first administrator.
3. Sign in and finish any required MFA/passkey setup. The website wizard opens when
   business details are missing, including for existing installations.
4. Enter the business name and optionally upload a PNG, JPEG or WebP logo up to
   1 MB using the dropzone.
5. Save the setup. Choose **Enable public website** when it is ready for visitors.

Saving settings never enables the website. Before enablement, visitors see **Coming
soon** and crawlers receive `noindex`. Return to **Administration → Website setup**
to edit settings or disable the website. Saved settings survive restarts and interrupted
sessions; unsaved inputs trigger the portal's existing leave-page warning.

The reduced setup stores removed business-detail fields as empty values. The public
website omits optional logo, contact, sign-in and metadata values when they are absent
and uses its current request origin for canonical metadata. `Web:PublicUrl` in the
backend still means the admin portal for existing account email links.

## CMS and contact modules

Open **Blog & news → Landing page sections** to edit hero, about, services,
testimonials/commitment and contact text and images. Save a draft, inspect its preview,
then publish the saved sections. Empty sections use the bundled business copy.
Article editing retains its existing save/preview/publish workflow. Blog URLs live on
the public website; admin/API hosts no longer render `/blog` themselves.

When CMS is disabled, the website uses bundled sections and two bundled sample posts.
When CMS is enabled, a successful empty blog stays empty. During CMS request failures,
the SSR process uses the last successful public response, or bundled content if it has
none. Confirmed 404s clear the affected cached article and return 404. Each process
caches at most 100 CMS responses; cache contents reset on restart and CMS disablement.
Control-state failures produce a 503 rather than republishing an explicitly disabled site.

Contact enquiries belong to **Support**. Enable them and set their notification
recipient under **Modules submenu → Support**. The public form requires an
enabled/configured Website, active Support and the effective `support-enquiries`
capability. Disabling submissions leaves the retained inbox and accepted notifications
available. Delegate `contact.manage` for **Administration → Contact enquiries**;
Administrator receives it through Migrator permission synchronization. See
[Support features](support.md) for upgrade and configuration details.

Website image uploads accept PNG/JPEG/WebP up to 1 MB, through the existing local/S3
storage provider. My Files need not be enabled. Uploaded assets are public and retained.
External image URLs must use HTTPS. Provide meaningful alternative text for section images.

## Run and deploy

```sh
npm ci --prefix src/TemplateV4.Website
npm run start --prefix src/TemplateV4.Website
```

Set `WEBSITE_API_URL` to the backend origin before starting. Aspire supplies its HTTPS
endpoint and enables Node's system certificate trust; trust the local .NET development
certificate first. The public dev server uses `http://localhost:4300`; the existing
admin portal uses `https://localhost:4200`.

For production, run `npm run build` in the Website directory, then `npm run serve:ssr`.
The Website Dockerfile and Compose service run on port 4300 as a nonroot Node process.
Route the public hostname to that service through your HTTPS ingress and the admin
hostname to the existing web service. `WEBSITE_API_URL=http://api:8080` is used inside
Compose. Do not expose an authenticated reverse proxy from the public Node app; it
only forwards explicitly supported public reads, images and contact submissions.

Contact submissions allow five attempts per visitor per ten minutes in each SSR
process, plus an API-side aggregate limit. Behind an ingress, set
`WEBSITE_TRUSTED_PROXIES` to its exact IP addresses or private CIDRs so `req.ip` uses
only trusted forwarded addresses. Do not use a wildcard. For several SSR replicas,
apply the same per-visitor limit at the shared ingress. API aggregate limits account
for the SSR server aggregating many visitors.

Avoid CDN/full-page caching for website HTML and control responses so explicit disablement
takes effect on subsequent requests. Hashed static bundles may be cached. Robots and
sitemap are served by Node; unconfigured sites disallow indexing. Sitemaps use live
published articles and return 503 during CMS failure rather than indexing stale data.

## Verification

Run the Website build, type checks and `npm test` (Node unit tests, no browser), portal
lint/build, manifest/capability checks and focused `WebsiteTests`/`ModuleOwnershipTests`.
`WebsiteTests` covers URL validation and endpoint ownership/capability metadata
without a database.

Browser/SSR HTTP smoke checks require repository E2E permission. See
[verification](verification.md) and [ADR 0044](adr/0044-public-angular-website.md).
