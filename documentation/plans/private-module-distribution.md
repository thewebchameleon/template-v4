# Private module distribution implementation plan

Status: implemented; focused verification and live platform drills remain pending.

## Outcome

Customers deploy the public template on their own EasyPanel or Coolify server.
They register from their deployed application's administration page and configure
environment credentials once. The provider assigns private modules centrally.
Each deliberate rebuild installs the latest compatible releases the app may receive.
Installed modules operate indefinitely without a runtime licensing connection.

Use Docker Compose, the existing migrator, and a small repository-owned deployment
helper. Do not introduce a permanent deployment agent, custom platform controller,
or marketplace/payment workflow for the first version. Updates have a maintenance
window and use forward migrations and forward releases only.

## Agreed behavior

- One registered app has multiple environments with separate revocable credentials.
- Customers register and view status in their own app; no separate customer portal.
- Only the provider selects modules. Required dependencies are included automatically.
- Registration alone grants no private package access.
- Customers receive compiled backend packages and compiled Angular libraries, not
  access to the private source repository.
- Customers control which public repository revision they deploy. Module compatibility
  is evaluated against that checkout; the distributor does not overwrite their source.
- An active module grant admits published releases. Freezing the grant preserves all
  releases already granted, whether installed or not, and admits no later releases,
  including security fixes. Re-enabling updates resumes release admission.
- Freezing or revoking a download credential does not disable installed functionality.
- No automatic module removal, database deletion, downgrade, or database restore.
- Provider assignment is collected at build time; it does not remotely modify a
  running app. Customers still initiate deployment.
- Application contact with the central service is limited to registration, explicit
  environment/credential management, update checks, and package acquisition. No
  heartbeat, usage reporting, or time-limited permission to run is required.

## Existing implementation and changes needed

The public repository already contains source-based discovery in
`tools/discover-business-modules.mjs`, MSBuild composition in `Directory.Build.targets`,
release/update contracts, runtime capability evaluation, and a DatabaseMigrator with
an advisory lock and `IMigrationContributor` support.

The local `modules/Private/` checkout contains Vehicle Licensing and Client
Management. At inspection, GitHub `brinksolutions/business-modules` main contained
Vehicle Licensing but not Client Management and differed from the local checkout.
Reconcile intended source revisions before changing or publishing either module;
preserve unrelated local work and never assume the remote contains local changes.

Current delivery includes source bundles. Current licensing contracts can restrict
runtime capabilities and Client Management contains payment/subscription workflows.
These mechanisms must be replaced for private distribution; unrelated foundation
Payments, Commercial Billing, and Vehicle Licensing business functionality remain.

## Implementation sequence

### 1. Establish compiled delivery with Vehicle Licensing

Start with this existing module rather than building the administration UI first.

- Define one immutable module release manifest: module identity/version, supported
  foundation interval, required dependency intervals, backend/frontend artifact
  coordinates and hashes, and host registration entry points.
- Publish .NET assemblies and their migrations as NuGet packages and frontend code
  as an Angular package using the existing library entry point. Preserve namespaces,
  migration IDs, schema names, and history tables.
- Reconcile descriptor/package version differences under one release identity.
- Use the existing public foundation contracts; ensure a customer build does not
  include duplicate foundation assemblies or Angular instances through module packages.
- Include frontend assets, translations, lazy imports, and required styling in the
  package contract. The existing source-directory Tailwind discovery needs a packaged
  equivalent. Do not ship private TypeScript/C# source or embedded source maps by default.
- Extend owning generation tools to emit package references and static host/frontend
  registration. Do not hand-edit generated files or use runtime assembly hot-loading.
- Preserve source composition for publisher development where useful, but customer
  builds use the compiled path exclusively and must not need private Git credentials.

Completion: a clean public checkout can compose Vehicle Licensing from compiled
artifacts, including its migrations and frontend, without its source directory.

### 2. Implement one release-resolution and Compose preparation path

- Add a short repository-owned helper with prepare and deployment operations. It runs
  on the customer's server and exits; it is not a daemon and requires no public endpoint.
- Preparation contacts the distributor on every requested build, before Docker cache
  reuse. Resolve the complete assigned dependency graph against the checkout version.
  Search eligible compatible releases, rather than rejecting an incompatible newest
  release when an older permitted compatible release exists.
- Produce one deployment manifest and generated composition inputs before building
  API, Worker, frontend, and migrator. Every image embeds the same manifest identifier.
  Never resolve independently in separate Dockerfiles.
- Keep generated selection separate from provider-maintained source selections.
  Registered customer builds derive private selection from assignments; customers do
  not edit `client-modules.json` to select private modules.
- Feed exact artifact identities into normal cached builds. A fresh preparation run
  must detect a new permitted release even when the public Git revision is unchanged.
- Download only authenticated, entitled artifacts and verify identity and digest.
  Keep package-source credentials out of manifests, logs, Git, and final image layers.
- Support environment-provided configuration, proposed as
  `MODULE_DISTRIBUTION_URL`, `MODULE_APP_ID`, `MODULE_ENVIRONMENT_ID`, and
  `MODULE_BUILD_TOKEN`. Use BuildKit secrets if the build consumes the token; if the
  preparation helper downloads first, pass only the downloaded artifacts into Docker.
  Do not use secret Docker build arguments or copy generated `.env` files into images.
- An unregistered installation builds the public base app. A configured private build
  fails clearly on unavailable metadata, inaccessible packages, or incompatibility;
  it must not silently build an app with its private modules omitted.
- Retain successful deployment manifests locally and compare candidate versions with
  the environment's persisted installed versions. Reject downgrades before migration.
  A retry of the same release is permitted; recovery uses a higher corrected release.

Completion: all images use one exact module set, and a same-commit rebuild can receive
a new compatible release without leaking credentials or silently dropping modules.

### 3. Make the maintenance deployment deterministic

Use existing deployment assets and migrator rather than a new migration subsystem.

1. Acquire a local deployment lock and stop API, Worker, and other application writers.
   Serve maintenance or stop the frontend as appropriate. Keep database/storage running.
2. Prepare the release and build images on the customer's server. This first version
   accepts downtime during the build; it does not promise uninterrupted deployment.
3. Create and verify the database backup before any migrations. Preserve volumes and
   keep the backup outside disposable containers; document off-host retention.
4. Run a fresh one-off migrator for this attempt, with the selected release's packages.
   Do not reuse the success status of an old exited migration container.
5. After successful migration and activation, start the matching application images.
   Record the installed release and expose it in administration.

- Keep the migrator advisory lock and module-owned migration ordering. Coordinate
  runtime activation through the existing dependency and concurrency rules.
- Activate newly assigned modules and required dependencies after their migrations
  succeed. Record first-install activation so retries are idempotent and upgrades
  preserve existing settings. If a dependency was locally disabled, enable it through
  the existing activation rules when required by a newly assigned module and audit it.
- Freezing updates never removes a module or toggles its activation. No automatic
  uninstall operation is included in this release.
- Gate application startup on successful migration; `depends_on` can express startup
  ordering but cannot stop old writers. Explicit stopping remains part of the guide.
- A failed backup or migration leaves writers stopped. Report the failing step and
  retain diagnostic state; do not automatically restore the database or downgrade.
- Prevent stale images from starting against a newer recorded release/schema using
  local deployment state. This is a correctness check, not central runtime licensing.

Completion: a short Compose-based maintenance procedure provides controlled startup,
fresh migration execution, retained data, and forward-only recovery.

### 4. Reshape the private Client Management module

Keep central administration a private module of this same template.

- Own app registrations, environment credentials, module assignments, immutable
  releases, per-app release entitlements, and audit events in the module's schema.
- Separate app identity from environment identity. Joining an existing app requires
  a credential or short-lived pairing proof from an authorized app administrator;
  knowing its ID or public URL is insufficient.
- Allow self-registration from the customer app. Issue no module entitlement from
  unverified customer-supplied module lists. The provider grants access explicitly.
- Use distinct publisher, customer-management/update-check, and build-download
  credentials as needed; scope each to its purpose, app, and environment. Store
  centrally verifiable credentials as hashes and protect customer-side stored secrets.
- Offer credential rotation and revocation without affecting installed features.
- Add explicit assign, freeze, and resume actions. Include required private dependencies
  in the displayed assignment. Persist admitted release identities so freeze behavior
  is unambiguous and can be audited.
- Resolve dependencies using each dependency's own granted releases. If freezes make
  a combination impossible, retain the installed app and report the incompatible
  build; never override another grant's freeze implicitly.
- Remove module offers, purchases, subscriptions, payment-derived entitlements, licence
  expiry, and heartbeat enforcement from this workflow and its UI/API contracts.
  Preserve retained historical data as appropriate through forward migrations;
  never delete or regenerate existing migrations.
- Remove private runtime licence restrictions from foundation capability evaluation,
  while preserving user permissions, local module lifecycle, and feature settings.
- Bootstrap the provider's own deployment through publisher-owned package access so
  central service startup does not depend on contacting itself.

Completion: the provider can assign modules and freeze/resume updates without selling
subscriptions or granting/revoking permission for already installed code to run.

### 5. Add the customer administration experience

The public base must include this page before private modules are installed.

- Register an app with the configured distribution endpoint; create an environment
  or pair a new environment to an existing app.
- Show provider-assigned modules, installed versions, compatible available updates,
  pending installation, and frozen-update status. Do not add customer selection controls.
- Provide copyable environment configuration and a one-time build credential handoff
  to EasyPanel/Coolify. Do not give the application Docker socket access or panel admin
  credentials just to register or check for updates.
- Retain ordinary runtime status when the distributor is unreachable. Make an explicit
  update-check failure visible without disabling modules.
- Protect administration endpoints with existing permissions/CSRF conventions and
  prevent configured remote URLs from becoming an unrestricted server-side fetch proxy.
- Use existing Angular components, translations in both supported cultures, and owning
  OpenAPI/client generators. Never hand-edit generated clients.

Completion: customers can register, obtain environment configuration, and understand
deployment status entirely within their own app.

### 6. Publish immutable artifacts and integrate storage

- Publisher CI builds private modules and uploads immutable compiled artifacts to
  existing private package/object storage. Publish release metadata only after all
  referenced artifacts exist; preserve every release still granted to an app.
- Use the existing storage provider where suitable, with entitlement-checked downloads
  or short-lived download URLs. A customer token must not grant broad repository or
  registry access that bypasses a frozen grant.
- Keep storage replaceable behind the module's provider boundary; do not build a
  general-purpose package registry. A private local package feed prepared from bounded
  authorized downloads is sufficient for restore/build.
- Preserve exact artifact hashes and release metadata. Withdrawal must not silently
  delete previously granted artifacts or change a published version's contents.

### 7. Document both platform procedures and the architecture change

- Supply Compose files, Docker build inputs, the short helper, and `.env.example`
  without real credentials. Exclude secrets and backups from build contexts.
- Document first base deployment, registration, provider assignment, credential setup,
  stop/preparation/build/backup/migrate/start, and forward-fix recovery.
- For Coolify, document the Git-based Compose application path. Custom build/start
  commands may invoke the helper if their execution context is suitable.
- For EasyPanel, retain the explicit maintenance procedure. Its documented Deploy
  command is `docker compose up --build -d`; do not claim it runs custom preparation
  or stops old writers. Document where to run the helper on the host using the same
  Compose project, paths, network configuration, and environment as the panel.
- Where panel configuration cannot execute the helper, use a documented host-shell
  invocation. Do not conceal that requirement behind a claim of native one-click support.
- Ensure no concurrent panel auto-deployment can race with the maintenance operation.
- Add an ADR superseding the affected source-delivery and commercial-licensing decisions
  (0039 and 0046, with composition references updated as needed). Update module/deployment
  guides and `framework.json` extension descriptions only when implementation lands.
- Leave public foundation updates under customer control. Freezing a private module
  may constrain which future framework versions that customer can deploy.

## Verification and completion criteria

This plan does not authorize tests, deployments, or publishing. During implementation,
follow repository permission rules, read verification guidance before requested checks,
and request specific approval before executing tests or E2E/platform deployment drills.
Contract generation that invokes integration tests also needs that permission.

The eventual focused verification should demonstrate:

- A clean base deployment works without private repository access.
- Registration does not grant unauthorized downloads or allow an environment to join
  another customer's app without proof.
- Vehicle Licensing installs from compiled packages with routes, styles, jobs where
  applicable, and retained module migration history.
- A deployment picks up a newly assigned module and activates it once.
- A same-source rebuild resolves a compatible update consistently across every image.
- Frozen apps can fetch previously granted releases and cannot fetch newer ones.
- An unavailable distributor does not affect installed runtime features.
- Downgrades are rejected; backup/migration failures do not restart writers.
- Both platform procedures use the intended project/volumes, protect build secrets,
  and rerun the migrator on every deployment attempt.

Stop at the agreed Compose workflow. Runtime hot-loading, remote push deployment,
zero-downtime schema upgrades, custom marketplace UI, module payments, automatic
uninstall, and a permanent deployment runner are outside this plan.
