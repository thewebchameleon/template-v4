# Organizations and subscriptions

Accounts & teams opens personal accounts and organization workspaces. A user can join multiple organizations. Organization roles are Owner, Admin and Member, independent of platform roles. Platform administrators do not gain organization access. Every customer operation checks the current user profile and live membership. The customer identifier is explicit in URLs; switching workspaces never changes global Identity roles.

Set `Customers:Mode` to `Both` (default), `Personal` or `Organizations` on API and Worker. Organizations and Billing are deployment modules, enabled in baseline and disabled in minimal. Billing depends on Organizations. Disabling checkout retains callbacks, reconciliation and cancellation APIs. Keep customer modes available until existing billing obligations are settled. Runtime activation under Modules currently remains limited to Files and Support.

## Membership and files

Owners invite members/admins, change roles and transfer ownership. Admins invite/remove ordinary members. Ownership transfer atomically makes the previous owner an Admin; an owner must transfer ownership before leaving or close the organization. Closure requires settled subscriptions and an ended paid period, removes all memberships and invitations, and marks shared files for retention deletion. The closed customer row remains for historical billing references and is inaccessible to former members. Invitations expire after seven days and are accepted after signing in with a matching verified email. Invitations send email and an in-app notification. Unknown recipients receive a Reader account with no password or confirmed email and use the existing verification/password-setting flow even when public registration is disabled. Organization membership is granted only after explicit acceptance. Resends have a two-minute cooldown. Revoking an organization invitation removes membership eligibility; it does not delete a separately provisioned platform account.

Shared organization files use a distinct library and account-prefixed object keys. Members can upload and download; members delete their own uploads, while Owners/Admins can delete any workspace file. The shared library is flat; existing personal libraries retain their folders. Uploads reserve quota under the same customer lock used by billing transitions. Retained deleted files and unfinished uploads count toward storage until cleanup purges them. The worker cleans retained files even when their entry points are disabled.

Privacy export includes the user's memberships, pending invitations and personal subscription summary. Erasure requires organization ownership transfer or closure and settlement of personal subscription obligations. Shared organization files remain organization-owned after a contributor is erased; the contributor identifier is removed.

## Plans and settings

Administrators use Administration → Billing settings to select eligible account types, enabled providers, the checkout default, trial days and grace days. Defaults are both account types, both providers enabled, PayFast preferred, a 14-day trial and seven-day payment grace period. Credentials are required before a provider appears as ready at checkout. `CanCancel` is independent of entitlements; an overdue provider subscription remains cancellable after storage falls back to Free. `EntitlementState` describes paid/free access separately from payment state. Checkout is hidden while an existing subscription or paid period blocks a new order.

The configurable demonstration catalog uses ZAR:

| Plan | Monthly | Annual | Storage per account |
| --- | --- | --- | --- |
| Free | R0 | R0 | 100 MiB |
| Standard (flat) | R99 | R990 | 10 GiB |
| Team (per seat) | R49 per seat | R490 per seat | 50 GiB |

Override the complete `Billing:Plans` array with `Id`, `Name`, `Pricing` (`Flat` or `PerSeat`), `Currency`, `MonthlyMinor`, `YearlyMinor` and `StorageBytes`. Amounts are integer minor currency units. Keep existing plan identifiers available while subscriptions reference them. Prices are snapshotted on checkout orders. Storage is per account, not multiplied by seats. Per-seat subscriptions require enough purchased seats for members; acceptance cannot exceed purchased seats.

Trials are local and require no payment method. Starting checkout begins a paid subscription immediately. No automatic conversion or charge follows a local trial. Expired trials immediately use the free storage allowance. Paid access lasts through the paid period plus the configured grace period; cancelled subscriptions receive no extra grace. Files remain downloadable when over quota, but uploads stop. Personal accounts that have never started a subscription retain their existing administrator-configured file quota. Once subscribed, billing storage entitlements take precedence.

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
