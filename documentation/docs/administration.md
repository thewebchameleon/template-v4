# Administration and access

## Modules

Administrators can open **Administration → Modules** to enable or disable Files for the whole application. Change **Enable Files**, then **Save**. Disabling hides Files, File storage and user-file controls, and blocks personal and administrative file APIs. Existing files and quotas are preserved; normal retention and privacy processing continue. Re-enable Files to restore access. Other open browsers update navigation on their next navigation or reload; the API enforces changes on subsequent requests immediately.

Only the built-in Administrator role can manage modules; delegated settings operators cannot. Concurrent saves preserve the first committed change and ask the other administrator to reload. The setting cannot override a deployment-disabled module or restrictive file feature flags. Run DatabaseMigrator on upgrade. See [ADR 0023](adr/0023-runtime-module-administration.md) for extension guidance.

## Configuration

**Configuration** appears after User Management for Administrators. Its **Appearance** section controls the primary color for every user, including sign-in pages. Choose from nine presets: blue, violet, magenta, red, orange, emerald, cyan, lime and yellow, or add a named color in the separate **Custom colors** row. The Spartan picker opens in a right-side drawer and offers a drag area, keyboard-accessible sliders and precise hex entry. Color name, picker, each slider and hex entry are separated into clear parameter groups; each slider keeps its label and current value directly above the track. Selecting or editing a color applies its generated palette across the current page as a draft. Each custom color has an icon-only edit action and a destructive icon-only remove action; removal requires confirmation. Removing the selected custom color selects default blue. Custom colors are shared by all administrators; **Use color** updates the draft, and **Save** publishes the palette and selected color together without reloading the page. The preview cards explicitly render light and dark surfaces with their corresponding accessible generated shades, regardless of the current application theme. A successful save confirms the active palette immediately. The destructive **Undo changes** action appears only while the draft differs from the saved configuration; it discards that draft and restores the saved settings. Other open pages receive saved changes on their next refresh.

Delegated settings operators cannot open or save this page. Unsaved changes are protected; if another administrator saves first, reload the saved settings before trying again. See [ADR 0022](adr/0022-platform-configuration.md) for persistence, public branding and extension guidance.

## User management

Signed-in users land on **Dashboard** after completing required security setup. Administrators open **Administration** (the settings-cog icon) from the navigation rail, then **User Management**. The Users page has bookmarkable **Users**, **Invitations**, **Roles** and **Account security** tabs. The Users tab contains a directory summary, status tabs, debounced search, role filtering, compact identity, role and status columns, and server-backed page-size controls. The Invitations tab contains the invitation lifecycle card with status counts and page-size controls. **Invite user** opens the same shared form from either tab. Filters remain in the URL so directory and invitation views can be revisited or shared. Open a person's name to inspect their access, assign roles or change their account status.

Changes to a person's access sign them out of existing sessions. Failed saves retain edits. When another administrator changes the record, reload the latest version explicitly before reapplying a draft. Users cannot change their own access here, and the last active Administrator cannot be disabled or demoted.

## Roles and permissions

The **Roles** tab lets an operator with `roles.manage` create and edit custom roles. Select a role to open its description, membership count and grouped permissions in a right-side drawer. The built-in **Administrator** and **Reader** roles are read-only; the database migrator maintains their definitions.

Custom role names are 2–80 ASCII letters, digits, spaces or hyphens. Descriptions are limited to 240 characters. **Manage users** includes **View users**. An operator can grant only permissions they currently hold and cannot alter a role containing stronger permissions or a role assigned to themselves. Ask another appropriately privileged administrator to make such a change. Role changes sign members out so their next session uses current permissions.

User details show persisted effective permissions with their source roles. Unsaved selections are not represented as already-effective access. Direct per-user exceptions are intentionally absent from this baseline.

The baseline permission catalog is:

| Permission        | Capability                                                   |
| ----------------- | ------------------------------------------------------------ |
| `users.read`      | User directory and access details                            |
| `users.manage`    | Invitations, role assignment and account status              |
| `roles.manage`    | Custom role definitions and permission assignments           |
| `settings.manage` | Security policy, audit, delivery recovery and privacy review |
| `jobs.trigger`    | Request feature-enabled maintenance                          |

Adding granular operator/reviewer permissions is an extension: change the catalog, endpoint and handler policies, UI navigation and descriptions together. The current catalog intentionally preserves the existing `settings.manage` grouping.

## Account and System Health

**Account** (`/me`) contains identity and email change. **Security** contains authentication methods, recovery codes and the sessions shortcut. Proof fields appear for the chosen action. Copy recovery codes and acknowledge saving them before leaving. **Privacy** retains data export, retention and deletion requests.

**System Health** owns delivery recovery and maintenance. Its queue remains accessible independently of overview loading. Use the queue filters and recovery guidance before retrying a named delivery. **Audit history** supports activity/date filters and named actor/subject filters, preserving context when following related records.

Files is enabled by default. Administrators can disable it application-wide under **Modules**, preserving stored data and normal cleanup. Deployment settings and `Features:files` overrides remain additional restrictions on route and API availability.

## Performance and verification

List requests are canceled when superseded or when the component is destroyed. Refreshes retain loaded content and display a separate update/error state. Notification badge polling uses a count-only endpoint once per minute in visible tabs, with backoff on failures. The header bell loads recent notifications into a right-side drawer; delivery preferences remain on `/notifications`. Notification navigation does not reload the inbox before leaving.

The initial performance baseline is 1,000+ accounts, not a claim of 1,000 concurrent users. Validate realistic traffic and query plans before adding indexes, caching, push delivery or background export jobs. Authenticated responses remain uncached. Production Nginx compresses static text and gives hashed JS/CSS a long cache lifetime; index/runtime configuration must stay fresh.

For changes, complete documentation, formatting/lint, manifest checks and builds before running tests. Access/session/persistence behavior needs real PostgreSQL integration tests. E2E tests require explicit authorization before execution. Include both roles, cultures, themes, narrow viewports, failed saves and version conflicts in the browser review. See [ADR 0016](adr/0016-administration-and-delegated-access.md).

Account security is available at `/administration/users?section=security` with `settings.manage` permission, including for operators without directory or role access. It contains the MFA policy and public-registration controls and preserves version-conflict and unsaved-draft handling. The standalone `/settings` page and navigation entry are removed without a redirect. Extend the shared people navigation and permission-aware section selection when adding tabs.

Administration is one permission-filtered rail destination with a settings-cog icon. It opens the existing resizable label panel containing **User Management** (`/administration/users`), **File storage** (`/administration/storage`, when enabled), **Privacy Requests** (`/administration/privacy-requests`), **Audit History** (`/administration/audit-history`) and **System Health** (`/administration/system-health`), in that order. The panel shows this group on administration routes; mobile includes it in the navigation sheet. The parent route opens the first permitted, enabled child. Nested user details remain under `/administration/users/:id`. Old top-level URLs redirect to their canonical routes, preserving query state and existing notification links. System Health replaces the Operations page name; API paths, module identifiers and audit event contracts retain `operations`.

Extend `core/administration.ts` and the guarded child routes together for new administration pages. Navigation and the parent landing route share the permission/module-filtered list; endpoint and route guards remain authoritative. Keep localized breadcrumbs, active rail state, named links and panel expanded state consistent for direct visits and browser history.
