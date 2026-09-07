# Platform workflows

## Personal workspace

- **Notifications** offers an unread view, mark-read actions, deep links and an optional-email preference. The header refreshes its unread count every minute while visible. Essential security email is unaffected by preferences.
- **Account** owns personal identity and verified email changes; **Security** owns factors and active sessions.
- **Files**, when enabled, offers name search, URL-persisted sort/pagination, upload progress, download and confirmed deletion. Files are private to their owner, including against administrators. Limits are 20 MiB per upload and a configurable total quota. Deleted and incomplete objects count until purged.
- **Privacy & data** offers a JSON export with explicit safe fields, deletion requests and withdrawal. The export includes file metadata; users download content separately from Files. It never serializes Identity entities, password hashes, authenticators, refresh tokens, challenges or outbox payloads.

## Administration

- **Audit history** searches actions and dates and follows actor/subject links. It returns no trace headers or message payloads. Person detail pages link to that person's filtered history. Audit history requires `settings.manage`; the built-in Administrator receives it.
- **Invitations** shows pending, expired, accepted and revoked state, onboarding progress, last queued time and resend cooldown. Last queued means the token was prepared, not a delivery receipt. Legacy timestamps remain unknown. Revocation invalidates links and disables the account; accepted accounts are managed through Users.
- **Operations** shows pending/failed counts, oldest backlog age, active jobs, last maintenance and deployment version. Failed deliveries are replayed through the existing audited, CSRF-protected endpoint after explicit in-app confirmation. The view is a timestamped snapshot; Refresh reloads it.
- **Privacy requests** lets an administrator approve anonymisation or decline a pending request. The approval dialog describes the irreversible result. Users cannot process their own request; the last active administrator is protected. Withdrawal/review is serialized by an account advisory lock.

## Retention defaults

| Setting | Default | Bounds |
| --- | --- | --- |
| `Privacy:DeletedFileRetentionDays` | 30 days | 1–365 days |
| `Privacy:NotificationRetentionDays` | 90 days | 7–365 days |
| `Storage:QuotaBytes` | 1 GiB | 20 MiB–100 GiB |
| `Operations:BacklogWarningSeconds` | 300 seconds | 60–86400 seconds |
| `Deployment:Version` | Assembly version (Compose: 0.1.0) | Set to release identifier |

Storage cleanup runs every ten minutes, independently of optional maintenance scheduling, with a 30-second timeout and at most twenty objects per pass. A shared lock prevents concurrent cleanup. Monitor cleanup failures in Worker logs. Purged metadata loses its original filename. Backup copies follow the deployment owner's policy; a database deletion does not alter historical backups. Audit identifiers are intentionally preserved and remain access controlled.

Approval also scrubs encrypted email payloads for the account and fences pending delivery leases. An SMTP request already in flight cannot be recalled; delivery remains at least once. Stored file names remain until the configured file purge, then become a generic deleted-file label.

## Extending the UI

`shared/workspace.ts` exports `PageHeader`, `PageState`, `ListPager`, `Resource<T>` and `ListQuery`. Use these with generated contract types and `shared/data-table.ts`. Resource loads cancel superseded requests and fence stale responses, retaining content during refresh and recoverable failures. Keep form filters outside the loading region so a retry never loses their values. Use stable secondary sorting in the backend. `shared/confirmation.ts` owns the root confirmation dialog and unsaved-change guard; a guarded page implements `hasUnsavedChanges()` and calls `protectUnload` from its unload handler.

Notifications use known keys in `workspace-translations.ts`, translated at read time, and known internal routes. Add both cultures and a valid route when adding a new notification. Generic `EmailTemplate.Notification` supports optional email; security notifications must use `EmailTemplate.SecurityNotification`. Keep generation inside the same database transaction as the change.

Angular uses `withXhr()` for HttpClient so upload progress events are available; the default Fetch backend does not report upload progress. All requests still pass through the existing authentication and error interceptors.

The development-only `OpenApi:ExportPath` command-line setting exports the live route contract without accessing a database or running tests. Supply the ordinary development key configuration and a loopback HTTP URL. The contract regression test remains the final authority in CI. Never set this option on a hosted workload.

See [ADR 0015](adr/0015-platform-baseline-workflows.md) for transaction and provider boundaries.

## Administration-focused starter

[ADR 0016](adr/0016-administration-and-delegated-access.md) consolidates invitations under Users, moves email changes into Account, and places maintenance in Operations. Files are optional and disabled by default (`Features:files:Enabled`). Existing objects and retention cleanup remain intact. See [administration](administration.md).
