# Foundation packages

The coordinated foundation release is 0.2.0: `TemplateV4.SharedKernel`,
`TemplateV4.Domain`, `TemplateV4.Application`, `TemplateV4.Infrastructure`,
`TemplateV4.Http`, `TemplateV4.ServiceDefaults` and `@templatev4/foundation`.
Executable hosts and business code remain application-owned. CRM, Invoicing and Files
ship in the foundation. Private business modules ship separately.

Run `pwsh tools/pack-foundation.ps1 -Version 0.2.0` to build NuGet and npm artifacts
under `artifacts/packages/0.2.0`. The script compiles a real partial-compilation Angular
library, including owned Helm components, styles, fonts and theme initialization.
Angular runtime libraries are peers; consumers must use the manifest-pinned compatible
Angular/Spartan versions. `node tools/build-business-frontend.mjs` builds selected business modules against
the built foundation declarations. Each module owns its package output and release instructions.

Run `pwsh tools/test-foundation-packages.ps1` after packing. It restores nupkg/tgz
artifacts into isolated consumers, rejects project references, builds a foundation-only
HTTP host, migrates a disposable PostgreSQL database, starts that host and checks
packaged styles/assets. It never copies foundation feature source into the consumer.
The fixture's branding/configuration remain application-owned. To exercise a compatible
candidate upgrade locally, pack `0.2.0-preview.1`, pack `0.2.0`, then pass
`-PreviousVersion 0.2.0-preview.1`. This tests two artifacts of the candidate API; it
does not claim that a historical 0.1.0 full foundation package existed.

A backend host references `TemplateV4.Http` and calls `FoundationHost.Run(args)`;
optional business contributions are explicit arguments. The frontend calls
`bootstrapApplication(App, foundationConfig(features))` from `@templatev4/foundation`.
Import `@templatev4/foundation/styles/styles.css`, configure Tailwind/PostCSS, copy the
package's `assets` contents into the public root, and provide application-owned
`runtime-config.json`. Keep branding overrides in your own stylesheet. Package updates
never rewrite those files. The committed consumer generator demonstrates the complete
Angular workspace configuration without workspace source aliases.

## GitHub Packages

No GitHub package owner or registry credentials were supplied. Set repository variable
`PACKAGE_OWNER` explicitly, set `NPM_PACKAGE_SCOPE` to that owner's lowercase npm scope,
and grant the publishing workflow package-write access. Consumers require read:packages
access and downstream repository access to each private package. Never commit tokens.
Local builds use the TemplateV4 identity and require no registry credentials.

For NuGet add `https://nuget.pkg.github.com/OWNER/index.json` as a credentialed source
using a local user-level configuration. Map `TemplateV4.*` exclusively to that feed;
map other dependencies to nuget.org. In `.npmrc`, map `@OWNER:registry` to
`https://npm.pkg.github.com` and use `${NODE_AUTH_TOKEN}` for authentication. Publish
with the explicitly selected scope; downstream imports must match the published scope.
Changing the npm scope is branding/configuration work, not an inferred owner choice.

Release tags must match framework.json. CI packs immutable artifacts and validates
consumers before publication. Do not overwrite a released version or use publication
as a local validation step. Review [upgrades](upgrades.md) and [business modules](business-modules.md).
