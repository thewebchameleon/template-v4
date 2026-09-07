# Administration and access

Administrators land on **Users** after completing required security setup. The directory contains compact identity, role and status columns. Open a person's name to inspect their access, assign roles or change their account status. **Invitations** is a neighboring view; **Invite user** opens the shared invitation form from either view.

Changes to a person's access sign them out of existing sessions. Failed saves retain edits. When another administrator changes the record, reload the latest version explicitly before reapplying a draft. Users cannot change their own access here, and the last active Administrator cannot be disabled or demoted.

## Roles and permissions

**Roles & permissions** lets an operator with `roles.manage` create and edit custom roles. Select a role to view its description, membership count and grouped permissions. The built-in **Administrator** and **Reader** roles are read-only; the database migrator maintains their definitions.

Custom role names are 2–80 ASCII letters, digits, spaces or hyphens. Descriptions are limited to 240 characters. **Manage users** includes **View users**. An operator can grant only permissions they currently hold and cannot alter a role containing stronger permissions or a role assigned to themselves. Ask another appropriately privileged administrator to make such a change. Role changes sign members out so their next session uses current permissions.

User details show persisted effective permissions with their source roles. Unsaved selections are not represented as already-effective access. Direct per-user exceptions are intentionally absent from this baseline.

The baseline permission catalog is:

| Permission | Capability |
| --- | --- |
| `users.read` | User directory and access details |
| `users.manage` | Invitations, role assignment and account status |
| `roles.manage` | Custom role definitions and permission assignments |
| `settings.manage` | Security policy, audit, delivery recovery and privacy review |
| `jobs.trigger` | Request feature-enabled maintenance |

Adding granular operator/reviewer permissions is an extension: change the catalog, endpoint and handler policies, UI navigation and descriptions together. The current catalog intentionally preserves the existing `settings.manage` grouping.

## Account and operations

**Account** (`/me`) contains identity and email change. **Security** contains authentication methods, recovery codes and the sessions shortcut. Proof fields appear for the chosen action. Copy recovery codes and acknowledge saving them before leaving. **Privacy** retains data export, retention and deletion requests.

**Operations** owns delivery recovery and maintenance. Its queue remains accessible independently of overview loading. Use the queue filters and recovery guidance before retrying a named delivery. **Audit history** supports activity/date filters and named actor/subject filters, preserving context when following related records.

Personal files are optional. Set `Features:files:Enabled=true` in the API configuration to enable the route and endpoints. The default starter hides Files, but retains storage services and cleanup so existing stored data is not destroyed or abandoned.

## Performance and verification

List requests are canceled when superseded or when the component is destroyed. Refreshes retain loaded content and display a separate update/error state. Notification badge polling uses a count-only endpoint once per minute in visible tabs, with backoff on failures. Notification navigation does not reload the inbox before leaving.

The initial performance baseline is 1,000+ accounts, not a claim of 1,000 concurrent users. Validate realistic traffic and query plans before adding indexes, caching, push delivery or background export jobs. Authenticated responses remain uncached. Production Nginx compresses static text and gives hashed JS/CSS a long cache lifetime; index/runtime configuration must stay fresh.

For changes, complete documentation, formatting/lint, manifest checks and builds before running tests. Access/session/persistence behavior needs real PostgreSQL integration tests. E2E tests require explicit authorization before execution. Include both roles, cultures, themes, narrow viewports, failed saves and version conflicts in the browser review. See [ADR 0016](adr/0016-administration-and-delegated-access.md).
