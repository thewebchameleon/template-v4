# ADR 0036: safe module administration and retained access

Status: Accepted

## Decision

Activation is admission control. Requests that passed the capability gate may finish after disablement; accepted obligations and cleanup continue. Avoid introducing cross-module cancellation or holding activation locks throughout ordinary work. Test the admission boundary independently of retained-operation authorization.

HTTP resolves one capability snapshot on the request's first availability check and shares it across endpoint and operation gates. The snapshot ends with the request; the next request reads committed runtime state again. Background evaluation continues to read fresh state on each evaluation. Permission and live membership checks remain independent of the availability snapshot.

Generic administration derives supported switches from the catalog and reports missing database rows as incomplete setup. It never silently seeds activation state. Block both known invalid enable and disable transitions in the UI, retain server validation, and reload authoritative versions after conflicts.

Typed settings use independent Angular editor components. `FoundationFeature.moduleSettingsComponent` is the private extension point; foundation editors are registered explicitly. Each editor owns loading and error recovery. Keep destructive settings visible when the runtime module is off, rather than collapsing them with activation.

Demo expiry is allowed in production only after a warning confirmation and fresh administrator password verification. Verify off-to-on transitions in the store, using the configured Identity password hasher. Five attempts per actor per fixed 15-minute window are recorded on an independent PostgreSQL connection so command rollback cannot reset the limit. Passwords are never audited, logged or persisted. Turning demo mode off requires no proof. Its warning describes permanent expiry of existing personal data and continued cleanup after module disablement; previously claimed purges cannot be undone.

Invoicing read and settlement routes remain available for retained obligations, but invoicing navigation is hidden while the module is disabled. Existing direct links can still reach retained documents. Live membership discovery and account selection remain available when organisation admission is disabled. Role permissions `invoicing.issue`, `invoicing.settle` and `invoicing.correct` protect financial operations in Application contract implementations; every operation also checks current organisation membership. UI controls use the corresponding permission. The existing migrator synchronizes built-in Administrator permissions; no automatic grants are made to delegated roles.

Feature discovery distinguishes failed loading from confirmed unavailability while remaining fail-closed. HTTP discovery is application-wide and does not support tenant overrides. The non-HTTP feature evaluator retains explicit trusted tenant contexts; no route ID or client header supplies one implicitly.

## Verification

Use real PostgreSQL tests for proof failures, attempt limits surviving rollback, activation conflicts/missing rows and live financial permissions. Browser-free tests cover capability state recovery, independent editor loading, confirmation cancellation and stale editor versions. Browser interaction and accessibility verification remain subject to root E2E permission requirements.

See [module administration](../saas-modules.md#administration-and-recovery) for operational instructions.
