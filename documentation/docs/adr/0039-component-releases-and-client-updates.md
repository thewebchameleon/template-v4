# ADR 0039: component releases and client update notifications

Status: Accepted

Extends [ADR 0034](0034-private-client-module-composition.md) and
[ADR 0038](0038-compose-client-releases.md). Bundled foundation modules share the
foundation release. Each private business module has its own stable semantic version,
foundation compatibility interval and private-module dependency intervals. Version
intervals have inclusive `min` and exclusive `maxExclusive` bounds. Prereleases are
not admitted to this first stable-channel contract.

Module source is delivered as an individually versioned GitHub Packages npm artifact.
The artifact contains a bounded source bundle, not an installable runtime plugin.
The existing mount layout and source composition remain authoritative. Builds verify
the artifact SHA-256, module identity and descriptor compatibility before writing
files into a clean checkout. Package scripts and arbitrary archive paths are never
executed or extracted. A coordinated client build still runs migrations and deploys
the API, Worker and frontend together.

`client-template.json` pins the full release metadata for foundation and each selected
private module; `client-modules.json` remains the selection contract. Host generation
embeds installed metadata before compilation. Unpinned development builds remain
supported but cannot enable update checks. Runtime activation does not affect version
checks: disabled compiled modules still impose compatibility requirements.

A separate centrally hosted release-feed service publishes immutable release records
only after artifact publication succeeds. It stores records on a persistent volume
and reads a mounted credential/entitlement configuration on each request. Clients
and publishers receive separate high-entropy bearer credentials whose SHA-256 hashes
are stored centrally. Entitlements explicitly list component IDs, including foundation;
package access is separately controlled in GitHub. TLS terminates at the host proxy.
This service has no dependency on client databases or application user credentials.

The Worker checks every six hours, retaining the last successful result on failures.
PostgreSQL persists check status and a component/version announcement receipt. A
transaction-scoped advisory lock serializes receipt creation and notification inserts
across workers. Existing Administrators receive one notification per newly detected
release; receipts survive notification retention. No receipt is created while there
are no administrators. New administrators can always consult Deployment health under
System Health, but
are not sent historical announcements. No customer payloads or credentials are logged.

The administrator-only Updates endpoint and the Deployment health section under System
Health show deployed versions, latest published versions, compatibility, breaking-change
notices and migration guidance.
Compatibility is checked across the complete proposed combination, including reverse
dependencies. The initial conservative resolver does not search all historical version
combinations: an incompatible newest combination requires operator review.

Client repository workflows open or update one draft upgrade PR, validate the proposed
composition explicitly (GitHub's built-in token does not trigger new PR workflows),
and retain reviewed dependency locks. Source and reusable workflow commits are pinned.
Deployment stays manually triggered. Copied/customized source repositories still need
reviewed source merges; this mechanism does not overwrite client-owned code.

See [release operations](../release-updates.md) for setup, publication and recovery.
