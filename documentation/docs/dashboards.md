# Editable dashboards

The dropdown combines shared dashboards and the signed-in user's private dashboards.
The migration installs My work, Business overview, Sales, Finance, Support, and
Administration, replacing the previous fixed dashboard.

## Editing and ownership

Use **Unlock dashboard** to change a layout. Add cards repeatedly, drag their move
handles to reorder them, and open a card's settings drawer to choose supported
compact/small/large sizes and metric/chart/list formats. Card settings apply to the
draft immediately. Locking a changed dashboard prompts the user to save or discard
the draft. Cards use an eight-column grid on larger screens and stack on phones
without changing saved size. Each dashboard supports 40 cards, including retained
unavailable cards.

Administrators with `settings.manage` can create shared dashboards, edit their
defaults, and delete them. **Edit shared default** is separate from personalizing
the administrator's own view. Personalized layouts retain a snapshot until
**Reset to default**. Users without a personalization see shared updates directly.
Deleting a shared source converts personalizations into private dashboards and
updates starting-dashboard references in the same transaction.

Layouts and starting-dashboard preferences follow accounts across devices.
My work is the initial starting dashboard; if deleted, the first remaining
dashboard is used. Unsaved changes stay in the browser; navigation prompts before
discarding them. Version conflicts preserve drafts and require cancel/refresh.
Account export includes personal layouts and preferences; account erasure removes
them under the same actor/dashboard lock order used by dashboard mutations.

## Catalog and dates

Core supplies action items, review queues, personal activity, registration
approvals, privacy reviews, and storage usage. CRM supplies pipeline, stages,
and recent records. Invoicing supplies invoice status, outstanding balances,
and quotations awaiting acceptance. Support supplies status, unanswered requester
conversations, and recent tickets. CMS supplies drafts.

Metrics aggregate all matching records. Lists show five records when compact or
small and ten when large, linking to their source workflow. Charts show category
totals.
Financial values use the existing ZAR convention. Outstanding invoice balances
subtract credits and payments. Superseded quotations are excluded.

The date selector offers all time and rolling 7/30/90-day periods, with card
overrides. Dates mean creation time for action items, CRM, and tickets; issue time
for invoices; activity time for audit; and update time for CMS. Storage reports
current usage and ignores dates. Viewing filters are temporary; saving filters
in edit mode persists them.

## Adding a card

Implement Application's `IDashboardCardProvider` in the owning module and register
it explicitly in that module's registration method. Use stable module-prefixed
IDs. Definitions declare sizes, formats, metrics, filter options, and date support.
`Available` enforces current permissions and capabilities. `Read` queries only
owned tables or public Application contracts and returns a metric, category points,
and bounded linked items. Providers author internal record links; saved layouts
never execute arbitrary queries or HTML. Add translations in both cultures.

Do not add business-module queries to the dashboard host. Private modules can
register providers through their existing composition entry point. New shared
starting layouts require a forward migration, preserving all migration history.

Catalog and data requests independently check availability. Disabled or unauthorized
cards are hidden but remain stored. Saving permits unchanged retained cards;
new or reconfigured unavailable cards are rejected. Restored access reveals cards
after refresh. The API at `/api/v1/auth/dashboards` inherits authentication and CSRF
protection. Regenerate OpenAPI and Angular clients through their owning tools.
Only DatabaseMigrator applies database changes.
