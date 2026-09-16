# Organisation and subscription

Each deployment has one organisation and one shared subscription. Administrators
manage its name under Administration → Organisation. Appearance, website details,
issuer address and account-security settings retain their existing settings pages.
CRM, invoicing, shared files and billing open directly without selecting an account.
See [ADR 0047](adr/0047-single-organisation.md).

## Access and files

Public registration, invitations and administrator-created accounts remain
configurable in User Management. Email confirmation and optional registration
approval still apply. There is no separate organisation membership or role.
Application roles grant permissions: `crm.manage` for business-record writes,
`organisation.files.manage` for shared-file writes, and existing invoicing
permissions for financial operations. Administrators configure the organisation
and manage its subscription. Reader accounts can read shared records and files.

Files is one organisation-wide library, including former personal files and record
attachments. All active users can read it; `organisation.files.manage` controls
writes. A subscription supplies the shared storage quota; otherwise the configured
organisation allowance applies. Retained trash and unfinished uploads count once.
Reservations serialize across users. Cleanup continues while Files is disabled.
Account erasure removes uploader attribution and preserves organisation files.
See [the file-library merge](adr/0048-unified-organisation-files.md).

## Plans and settings

Administration → Billing settings configures providers, checkout default, trial
days and grace days. There is no personal/organisation ownership setting. Defaults
remain Stripe and PayFast enabled, PayFast preferred, a 14-day trial and seven-day
grace period. Credentials are required before a provider is ready at checkout.

| Plan | Monthly | Annual | Storage for the deployment |
| --- | --- | --- | --- |
| Free | R0 | R0 | 100 MiB |
| Standard (flat) | R99 | R990 | 10 GiB |
| Team (per seat) | R49 per seat | R490 per seat | 50 GiB |

Override `Billing:Plans` with `Id`, `Name`, `Pricing` (`Flat` or `PerSeat`),
`Currency`, `MonthlyMinor`, `YearlyMinor` and `StorageBytes`. Prices use integer minor
units and are snapshotted at checkout. Keep plan IDs available while retained
subscriptions reference them. Per-seat checkout requires enough seats for enabled
user profiles; storage is not multiplied by seats. Account creation continues to
follow the configured registration policy, independently of checkout.

Trials require no payment method and do not automatically convert or charge.
Checkout starts paid billing immediately. Expired trials use the free allowance;
paid access lasts through the paid period and configured grace period. Cancelled
subscriptions receive no additional grace. Downloads remain available over quota,
but new uploads stop. Cancellation remains available independently of entitlements,
including when checkout is disabled. A current subscription or paid period prevents
a second checkout.

## Provider setup

Supply secrets through the existing secret configuration mechanism. Do not commit credentials.

| Configuration | Purpose |
| --- | --- |
| `Billing:Stripe:SecretKey` | Direct Stripe merchant account key |
| `Billing:Stripe:WebhookSecret` | Endpoint signing secret |
| `Billing:Stripe:Live` | Expected event mode; false for testing |
| `Billing:PayFast:MerchantId` | Merchant identifier |
| `Billing:PayFast:MerchantKey` | Hosted checkout merchant key |
| `Billing:PayFast:Passphrase` | Required recurring billing signature salt |
| `Billing:PayFast:Sandbox` | Defaults to true |
| `Billing:PublicApiUrl` | Public HTTPS API origin for PayFast ITNs |
| `Web:PublicUrl` | Public HTTPS application origin for checkout returns |

Stripe uses API version `2025-06-30.basil`, hosted Checkout, recurring price data and stable order-based idempotency keys. Configure its webhook at `/api/v1/billing/callbacks/stripe` for `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `invoice.paid`, `invoice.payment_failed`, `customer.subscription.updated` and `customer.subscription.deleted`. Direct account integrations are supported; Stripe Connect is not. Prices support ZAR, USD, EUR and GBP in the catalog; merchant availability must be checked with Stripe.

PayFast uses hosted form POST, ZAR subscriptions with monthly or annual frequency, ordered MD5 signatures with the merchant passphrase, server ITN validation and the recurring API. Its callback is `/api/v1/billing/callbacks/payfast`. The Nginx CSP explicitly allows form submission to the two PayFast checkout hosts. Recurring API tokens are protected at rest and excluded from HTTP logging/traces.

Only verified payments update paid entitlements. Browser return URLs do not. Notification receipts, subscription changes and audit records commit together. Provider calls run outside database transactions. A worker reconciles accepted orders independently of module activation with up to four concurrent customer scopes and retries failed cancellation. Cancelled subscriptions continue reconciliation through their paid period; a confirmed settled cancellation retires polling. Polls do not create webhook receipts and audit only changed subscription facts. Duplicate receipts and older paid periods cannot extend access twice or reduce a newer period. Outages retain bounded paid/grace access; they do not grant indefinite storage.

## Current limits and verification

These adapters require sandbox verification with your merchant accounts before production use. No provider credentials or external payment sandbox sessions were available during implementation; local protocol tests do not establish merchant compatibility. Follow the [merchant verification checklist](billing-verification.md) and retain sanitized evidence before enabling live payments.

Plan/seat changes currently require cancellation and a new checkout after the paid period ends; automatic proration, tax, discounts, refunds and invoice downloads are not implemented. PayFast reconciliation can verify subscription status but does not reconstruct missed payment ITNs from transaction history. Replay the original validated ITN to recover missed paid-period updates. Unrecognized or malformed callbacks are rejected. A late payment on an abandoned/replaced checkout is cancelled and does not grant entitlements; any necessary refund requires merchant review. Reusing a PayFast form can create another provider subscription; the callback cancels the extra subscription rather than attaching it to the account.

Official contracts reviewed for implementation: [Stripe Checkout creation](https://docs.stripe.com/api/checkout/sessions/create), [Stripe subscriptions](https://docs.stripe.com/api/subscriptions/retrieve), [Stripe webhook signatures](https://docs.stripe.com/webhooks/signature), [PayFast integration documentation](https://developers.payfast.co.za/docs) and [PayFast recurring API](https://developers.payfast.co.za/api).
