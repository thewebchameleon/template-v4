# ADR 0016: administration workflows and delegated access

Status: Accepted

## Context

The reusable starter needs useful administration rather than a security-settings landing page. Hard-coded role choices and separate invitation editors made extension difficult. Repeated list refreshes hid usable content and the notification badge queried an entire inbox.

## Decision

- The default administrative landing page is Users; accounts without directory access land on their first allowed administrative destination or their personal account. Required MFA setup precedes these destinations. Personal identity/email, security/sessions and privacy are separate tasks. Existing account-action fragment links remain valid; `/profile`, `/sessions` and `/invitations` redirect to their replacement destinations.
- Users and Invitations share a navigation group and one invitation editor. Person details show persisted effective permissions and their source roles. Drafts survive rejected saves and version conflicts. Self-access changes are read-only in the UI and protected on the server.
- Identity roles and role claims remain the source of permissions. `roles.manage` permits management of custom roles. Built-in Administrator and Reader definitions are protected; the migrator maintains their claims. Custom role descriptions are metadata claims and `ConcurrencyStamp` is the editor version. No new persistence schema is required.
- The permission catalog stays explicit in Application. User validators allow bounded custom role names; Infrastructure validates existence and delegation. Managing users requires directory access. No direct per-user permission exceptions are introduced.
- Role mutations and user assignment changes share the administrator advisory lock. They re-read the actor's live role permissions inside that boundary. The actor must hold every permission in both the previous and proposed grants; custom roles assigned to the actor cannot be edited by that actor. Role changes revoke members' sessions atomically and record audit events. Existing last-administrator protections remain. The administrator MFA policy includes delegated administrative permissions, not only the built-in role name.
- `AccessManagementService` owns Identity-dependent access operations, following ADR 0014. HTTP endpoints remain adapters; no EF or Identity dependencies enter Application. Existing user commands still use explicitly registered handlers and the command transaction.
- Reads use component-lifetime cancellation and superseded-request cancellation. Resources distinguish initial loading from refreshing retained content. Query-only navigation preserves focus while retaining browser history. Tables use stable entity identifiers and pages normalize pagination after data shrinks.
- The notification badge calls a single-count summary endpoint, with single-flight visible-tab polling and bounded failure backoff. Local updates invalidate older poll results. Opening a notification does not await an inbox reload. Polling is not a real-time delivery guarantee.
- Personal files are an optional capability, disabled by `Features:files:Enabled` by default and checked on the server. Existing files and retention cleanup are not removed. The optional route is hidden when disabled.

## Consequences and extension points

The user directory exposes Identity username separately from email and supports server-side sorting and search for both. User rows open the existing details editor in a right drawer without changing the directory URL; direct detail routes remain supported. Embedded details do not override page breadcrumbs. Save events refresh the directory, and drawer closure/navigation retain draft protection.

Optional shared data-table row actions retain native table semantics and expose a named button in the first column for keyboard users. Row clicks ignore nested controls and text selection; focus moves to the row's button before opening the dialog so it can return on close. Consumers opt in with `rowActionLabel` and `rowAction`, and must keep the first column free of nested interactive cell controls when opting in.

Run the migrator on upgrade to add the Administrator's new `roles.manage` claim; existing sessions are revoked when seeded claims change. Custom roles are not overwritten by seeding. Add permissions to `Permissions.All`, declare their endpoint/handler policies and provide descriptions in both UI cultures. Update the generated OpenAPI contract through the exporter and generator, never by hand.

When adding a new privileged capability, review the administrator MFA policy and delegation rules. Do not infer authorization from navigation visibility. Role-management code and assignment code must retain the same lock ordering. Add real PostgreSQL coverage for delegation, conflicts, protected roles and session invalidation.

Use the shared resource and table compositions for new pages. Keep a primary action above lists on narrow layouts; distinguish empty collections from filtered results. Keep audit content safe and explanatory, without credentials or message payloads. See [administration](../administration.md) for the user flow and validation expectations.
