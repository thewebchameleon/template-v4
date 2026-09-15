# Web push notifications

Account → Notifications → Delivery preferences includes account-wide web push and
notification-type previews. Both default to off. With previews off the message is
“You have a new notification”; previews reveal only a localized notification type.
All existing inbox notification types use push, independently of optional email.
Required security emails remain unchanged.

Users explicitly enable each browser and grant its notification permission. When
push is already on, **Enable on this browser** registers an additional browser.
Turning push off pauses every registered browser and cancels queued deliveries.
Re-enabling resumes the registered browsers; already accepted provider deliveries
cannot be recalled. Browser or operating-system notification settings can also
block delivery. On iOS/iPadOS 16.4+, install on the Home Screen and open the installed
app before enabling push. HTTPS is required (localhost is permitted for development).

## Deployment

Set the same `WebPush:Subject`, `WebPush:PublicKey`, and `WebPush:PrivateKey` on API
and Worker. The subject is a monitored `mailto:` contact or an HTTPS contact URL.
Generate a P-256 VAPID key pair with `WebPushCrypto.GenerateVapidKeys()`
once per deployment. Keep the private key in your existing secret store, never
source control. Environment-variable equivalents use `WebPush__Subject`,
`WebPush__PublicKey`, and `WebPush__PrivateKey`; key-per-file secrets are also supported.
Without these settings the preference page explains that push is unavailable.
Retain the keys across deployments. After rotating keys users must enable their
browsers again. The browser replaces subscriptions made with the previous key.

Serve `push-sw.js` and `manifest.webmanifest` from the web root. The service worker
only handles notifications; it does not add offline page caching. Customize the
manifest name and icon with the application's brand. Clicking a notification opens
the authenticated notification centre. No account identifiers or resource links
are included in generic notification messages.

The Infrastructure provider uses standard encrypted Web Push with VAPID through
.NET's built-in cryptography and HTTP APIs. Outbound HTTPS is allowlisted to FCM, Mozilla, Apple and
Windows push services; redirects are disabled. Extend that explicit allowlist and
its tests when supporting another browser provider. Subscriptions contain private
delivery credentials: never log or export their endpoints or keys. At most 20
subscriptions per account are retained; expired endpoints are removed on 404/410.

See [ADR 0040](adr/0040-web-push-notifications.md) for transaction and privacy rules.

## Verification

`node --test tools/web-push.test.mjs` checks the service worker without launching a
browser. Actual browser delivery requires configured VAPID keys and a supported
browser; browser/E2E checks require the
repository's explicit user permission.
