# ADR 0049: independently configured Support features

Status: Accepted

## Decision

Support owns Enquiries, Tickets, Attachments and Categories as feature slices in the
existing packages. Contact no longer has a separate deployment/runtime module.
`support-enquiries` and `support-tickets` independently require Support;
attachments and categories follow Tickets with no separate capability or switch.
Existing public namespaces, enquiry URLs, permission values, tables and integration
event identifiers remain stable, including links in already accepted notifications.

Typed Support settings persist two switches, an enquiry notification recipient and
an independent version. Administrator-only reads/writes live at
`/api/v1/auth/administration/modules/support/settings`. Writes use the dispatcher
transaction, lock runtime rows before the Support settings row, reject stale versions
and commit audit with the settings. The dedicated Support settings page in the Modules submenu stays accessible with runtime Support
disabled. It contains the feature switches and enquiry notification recipient. Activation remains on the Modules page; category management remains in the ticket area.
Delegated category administrators retain category access; module settings remain Administrator-only.

Module-owned `ICapabilityRestrictions` providers supply persisted restrictions.
The evaluator combines them by denial and passes them into the catalog before
dependency evaluation. Restrictions cannot enable a deployment, runtime, licensed
or rollout-disabled capability. Support's provider fails closed for missing settings;
Enquiries also requires a configured recipient. Providers never cache state across
requests. Generic module activation has no Support-specific branches.

Enquiries retain anonymous rate-limited/honeypot submission and protected inbox
access. Public Website discovery uses the same effective enquiry capability; Website
must also be configured and enabled. Support owns recipient configuration; notification
links use the deployment's `Web:PublicUrl`. Recipient addresses are not published in
public discovery or audit changes. No new email delivery mechanism is introduced.

Ticket/category and attachment stores have separate Application contracts and endpoint
mappings. A shared module-local ticket context preserves live requester/agent checks,
actor and ticket locks, history and notifications. Shared EF transactions and models
remain intact; feature disabling never removes service registrations or mappings.

## Disablement and migration

Disabling Enquiries or Support stops submissions and makes the inbox page unavailable.
Retained enquiry data remains, and accepted notifications continue draining.
Disabling Tickets stops ticket, category and attachment work. Existing data remains;
account erasure and accepted delivery continue.

The forward SupportFeatureSettings migration copies the previous Contact runtime
state and website recipient into Support settings before removing the old runtime
row. Existing enquiries are untouched. Missing old activation state becomes disabled.
A later forward `TicketAttachmentsFollowTickets` migration removes the separate
attachment preference without changing earlier migrations or stored attachments.
The historical Website recipient column is retained, cleared, and no longer exposed
by Website contracts. Remove old `Modules:contact`/`ClientModules:contact` deployment
overrides; use Support deployment selection and its feature settings instead.

## Verification

Focused PostgreSQL tests verify migration preservation, independent admission,
cross-context concurrency, transactional settings, retained enquiries, attachment
ownership and missing-state restrictions. Endpoint metadata and catalog tests verify
feature gates and dependency propagation. See [Support](../support.md) and
[module extension guidance](../saas-modules.md).
