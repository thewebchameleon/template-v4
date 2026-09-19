# Commercial billing

Each deployment has one organisation and one commercial subscription. Commercial Billing owns persisted plans and immutable price versions, trials, checkout orders, subscriptions, invoices, payment receipts, entitlements, usage counters and policy settings. Payments is a required provider foundation: it owns Stripe and PayFast adapters plus administrator payment-method configuration, but never decides what a successful payment grants.

The two commercial relationships remain separate payment consumers. A deployment's subscription and shared storage rights belong to Commercial Billing. A software vendor's central sales, client licences and deployment entitlements belong to the private Client Management module. They share provider adapters only; an event accepted by one consumer cannot create receipts or entitlements in the other.

See [ADR 0020](adr/0020-saas-billing-providers.md) and the [single-organisation decision](adr/0047-single-organisation.md).

## Plans, entitlements and usage

Plans and price versions are database records. A checkout snapshots the selected price identifier, amount, currency, interval and quantity. A later price change creates a new price row; retained orders and subscriptions continue to reference their original snapshot.

| Plan | Monthly | Annual | Storage entitlement |
| --- | --- | --- | --- |
| Free | R0 | R0 | 100 MiB |
| Standard (flat) | R99 | R990 | 10 GiB |
| Team (per seat) | R49 per seat | R490 per seat | 50 GiB |

The `storage-bytes` entitlement contributes a purchased allowance to core storage while it is valid. Core storage owns usage calculation and quota enforcement across every persisted upload, including library files, business attachments, Support attachments, avatars and retained organisation logos; when no purchased allowance applies, the configured storage quota is used. Downloads remain available while usage exceeds a reduced limit, but new consumption is rejected and existing files are retained. Administrators manage trial and grace durations under **Administration → Commercial billing**. Users with `commercial-billing.read` see the current subscription, entitlements, usage, invoices and receipts at `/commercial-billing`. Users with `commercial-billing.manage` can start trials and checkout and cancel the subscription. Purchased seats are enforced whenever a user is approved, confirms an immediately approved registration, or is re-enabled.

Trials require no payment method and never convert automatically. Checkout starts paid billing immediately. Per-seat checkout must cover active users. Cancellation stops future recurring charges and preserves already-paid rights until the paid period ends. Commercial Billing callbacks and reconciliation continue while the optional module is disabled so accepted payment obligations can settle safely.

## Payment methods

Administrators enable configured providers and select the default under **Administration → Payment methods**. A provider is offered only when it is both enabled and credential-ready.

| Configuration | Purpose |
| --- | --- |
| `Payments:Stripe:SecretKey` | Direct Stripe merchant account key |
| `Payments:Stripe:WebhookSecret` | Endpoint signing secret |
| `Payments:Stripe:Live` | Expected event mode; false for testing |
| `Payments:PayFast:MerchantId` | Merchant identifier |
| `Payments:PayFast:MerchantKey` | Hosted checkout merchant key |
| `Payments:PayFast:Passphrase` | Recurring-payment signature salt |
| `Payments:PayFast:Sandbox` | Defaults to true |
| `Payments:PublicApiUrl` | Public HTTPS API origin for PayFast notifications |
| `Web:PublicUrl` | Public HTTPS application origin for checkout returns |

There are no `Billing:*` compatibility keys. Configure Stripe webhooks at `/api/v1/commercial-billing/callbacks/stripe`; PayFast notifications use `/api/v1/commercial-billing/callbacks/payfast`. Private-module purchases use the separate `/api/v1/client-management/payment-callbacks/{provider}` consumer path while sharing the same provider adapters.

Stripe uses API version `2025-06-30.basil`, hosted Checkout and stable payment-ID idempotency. PayFast supports ZAR hosted checkout and recurring monthly or annual payments. Provider references are protected at rest and excluded from HTTP logs and traces.

## Settlement and reconciliation

Browser return URLs grant nothing. An authenticated provider notification or a provider reconciliation snapshot must match the stored payment ID, amount and currency before Commercial Billing writes a receipt, invoice, subscription state and derived entitlements. Provider event IDs make receipts idempotent. Older periods cannot shorten newer paid access, and duplicate events cannot grant twice.

Provider HTTP calls occur outside database transactions. The worker reconciles accepted orders and cancellation requests independently of module activation. Provider outages retain only bounded paid/grace access; they do not create indefinite entitlements.

## Current limits and verification

Plan or seat changes require cancellation and a new checkout after the paid period. Automatic proration, tax calculation, discounts and refunds are not implemented. PayFast reconciliation validates subscription state but cannot reconstruct missed transaction history; replay a retained valid notification when required.

Merchant sandbox verification remains a deployment responsibility. Follow the [merchant verification checklist](billing-verification.md) before enabling live payments. Local protocol tests do not prove merchant-account compatibility.
