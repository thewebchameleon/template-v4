# Merchant billing verification

Run this with each configured merchant sandbox before switching to live credentials. Protocol fixtures are not evidence of merchant compatibility. Browser or end-to-end automation requires separate authorization under the repository policy.

Record provider, sandbox merchant identifier, app revision, execution date, sanitized order/receipt identifiers and expected/actual results. Never retain tokens, raw callbacks, signatures or customer payment details in the report.

| Scenario | Expected outcome |
| --- | --- |
| Monthly and annual checkout | Correct currency, price and seat count; browser return alone grants no paid access |
| Initial verified payment | Correct paid period and storage entitlement |
| Renewal | Paid period advances once after verified payment |
| Duplicate/out-of-order callbacks | One receipt per event; periods never move backwards |
| Delayed callback or temporary API failure | Provider retry or reconciliation restores state without another charge |
| Failed renewal through grace expiry | Free entitlement with visible overdue status and cancellation action |
| Cancellation during a paid period | Future renewal stops; access continues only until period end |
| Cancellation API outage | Pending cancellation remains visible and worker retries |
| Settled cancellation | New checkout becomes available; polling and unchanged audit growth cease |
| Abandoned checkout / reused PayFast form | Stale subscriptions cannot replace the current order; merchant reviews refunds |
| Lost PayFast payment ITN | Replay original validated ITN; status polling alone does not restore paid access |

Confirm both the application state and the provider's own subscription/payment history. Enable live mode only after every relevant row passes. Preserve the sandbox result with deployment records and repeat affected rows after provider API changes.
