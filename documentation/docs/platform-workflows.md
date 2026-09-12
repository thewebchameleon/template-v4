# Platform workflows

## Personal workspace

- **Notifications** opens from the header bell as a right-side inbox drawer with recent items, mark-read actions and deep links. The full notification centre separates the `/notifications` inbox from `/notifications/preferences` delivery preferences with route-backed tabs. Inbox items expose their details and read/unread action on the right; preferences are not shown in the drawer. SignalR invalidates the badge and loaded notification views after committed changes from API or Worker processes; visible-tab polling remains a bounded fallback. Essential security email is unaffected by preferences.
- **Account** owns personal identity and verified email changes; **Security** owns factors and active sessions.
- **Files** is enabled by default in the baseline and offers folders, renaming, debounced name search within the current folder, URL-persisted sort/pagination, upload progress, attachment downloads and confirmed deletion. Any file type is accepted, including empty files, with a 20 MiB upload cap. Owners manage their own library; administrators with `settings.manage` can browse and download through user details. Folders must be empty before deletion. Deleted and incomplete objects count until purged. See [file library policy](adr/0021-user-file-library.md).
- **Privacy & data** offers a JSON export with explicit safe fields, deletion requests and withdrawal. The export includes file metadata; users download content separately from Files. It never serializes Identity entities, password hashes, authenticators, refresh tokens, challenges or outbox payloads.

## Administration

- **Audit history** searches actions and dates and follows actor/subject links. It returns no trace headers or message payloads. Person detail pages link to that person's filtered history. Audit history requires `settings.manage`; the built-in Administrator receives it.
- **Invitations** shows pending, expired, accepted and revoked state, onboarding progress, last queued time and resend cooldown. Last queued means the token was prepared, not a delivery receipt. Legacy timestamps remain unknown. Revocation invalidates links and disables the account; accepted accounts are managed through Users.
- **System Health** shows pending/failed counts, oldest backlog age, active jobs, last maintenance and deployment version. Failed deliveries are replayed through the existing audited, CSRF-protected endpoint after explicit in-app confirmation. The view is a timestamped snapshot; Refresh reloads it.
- **Privacy requests** lets an administrator approve anonymisation or decline a pending request. The approval dialog describes the irreversible result. Users cannot process their own request; the last active administrator is protected. Withdrawal/review is serialized by an account advisory lock.

**File storage** at `/administration/storage` sets the database-backed default allowance (initially 100 MiB per user). User details → Files and storage quota opens that user’s folders and a quota override; leave the override blank to follow the current default. Both administration workflows require `settings.manage`. Existing files remain available after a reduction; new uploads must fit the new quota.

## Retention defaults

| Setting                             | Default                           | Bounds                    |
| ----------------------------------- | --------------------------------- | ------------------------- |
| `Privacy:DeletedFileRetentionDays`  | 30 days                           | 1–365 days                |
| `Privacy:NotificationRetentionDays` | 90 days                           | 7–365 days                |
| File storage default / user override | 100 MiB / inherit default       | 0–100 GiB                 |
| `Operations:BacklogWarningSeconds`  | 300 seconds                       | 60–86400 seconds          |
| `Deployment:Version`                | Assembly version (Compose: 0.1.0) | Set to release identifier |

Storage cleanup runs every ten minutes, independently of optional maintenance scheduling, with a 30-second timeout and at most twenty objects per pass. A shared lock prevents concurrent cleanup. Monitor cleanup failures in Worker logs. Purged metadata loses its original filename. Backup copies follow the deployment owner's policy; a database deletion does not alter historical backups. Audit identifiers are intentionally preserved and remain access controlled.

Approval also scrubs encrypted email payloads for the account and fences pending delivery leases. An SMTP request already in flight cannot be recalled; delivery remains at least once. Stored file names remain until the configured file purge, then become a generic deleted-file label.

## Extending the UI

`shared/workspace.ts` exports `PageHeader`, `PageState`, `ListPager`, `Resource<T>` and `ListQuery`. Use these with generated contract types and `shared/data-table.ts`. Resource loads cancel superseded requests and fence stale responses, retaining content during refresh and recoverable failures. Keep form filters outside the loading region so a retry never loses their values. Every table query sends page, sort column and direction to the server; expose all data-bearing columns through the API sort allowlist and use stable identifier ordering as the tie-breaker. `shared/confirmation.ts` owns the root confirmation dialog and unsaved-change guard; a guarded page implements `hasUnsavedChanges()` and calls `protectUnload` from its unload handler.

Notifications use known keys in `workspace-translations.ts`, translated at read time, and known internal routes. Add both cultures and a valid route when adding a new notification. Generic `EmailTemplate.Notification` supports optional email; security notifications must use `EmailTemplate.SecurityNotification`. Keep generation inside the same database transaction as the change.

Notification producers persist rows and do not invoke SignalR directly. PostgreSQL transaction triggers publish only the affected user identifier after commit, and every API replica relays a content-free invalidation event to that user's authenticated connection. Keep `/api` WebSocket upgrades enabled at each reverse proxy. See [ADR 0017](adr/0017-signalr-notification-invalidation.md).

Angular uses `withXhr()` for HttpClient so upload progress events are available; the default Fetch backend does not report upload progress. All requests still pass through the existing authentication and error interceptors.

The development-only `OpenApi:ExportPath` command-line setting exports the live route contract without accessing a database or running tests. Supply the ordinary development key configuration and a loopback HTTP URL. The contract regression test remains the final authority in CI. Never set this option on a hosted workload.

See [ADR 0015](adr/0015-platform-baseline-workflows.md) for transaction and provider boundaries.

## Administration-focused starter

[ADR 0016](adr/0016-administration-and-delegated-access.md) consolidates invitations under Users, moves email changes into Account, and places maintenance in System Health. Files are optional and disabled by default (`Features:files:Enabled`). Existing objects and retention cleanup remain intact. See [administration](administration.md).
