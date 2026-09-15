# ADR 0040: opt-in web push notification delivery

Status: Accepted

Use standards-based encrypted Web Push with VAPID, owned by Infrastructure and
delivered by Worker. Account preferences control push and notification-type previews,
both defaulting to false. Individual browsers register only through an explicit
user action and browser permission. An endpoint belongs to one user; registration
cannot transfer it to another account. Browser account changes replace the browser
subscription. Privacy erasure deletes subscriptions and resets preferences.

An INSERT trigger on the existing notification table queues one `push.requested.v1`
outbox message per registered browser in the same transaction. Its payload contains
only notification and subscription identifiers. This covers every notification
producer and avoids retaining notification content in retry payloads. Existing
notifications are not backfilled. Database migrations own the trigger alongside
the existing realtime notification trigger.

Worker reads the current account preference, active profile, subscription and
notification before sending. Generic messages reveal no notification category;
opted-in previews contain localized category text only. Clicking opens the inbox.
Deleting an account or notification makes pending delivery a no-op. Turning push
off cancels queued messages across browsers. Delivery already in progress or accepted
by a provider cannot be recalled. External sends run outside database transactions
and reuse outbox leases, bounded retries and dead-letter operations. Delivery is
at-least-once; stable notification tags replace duplicate visible notifications.
Expired browser endpoints (404/410) are deleted without retrying.

Subscription keys and endpoints are credentials, excluded from audit, application
logs and account exports. Only known browser-vendor HTTPS endpoints are accepted;
redirects are forbidden. Other providers require an explicit allowlist update.
No Firebase account or third-party push SDK is required. See [web push setup](../web-push.md).
