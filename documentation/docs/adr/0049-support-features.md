# ADR 0049: independently configured Support features

Status: Accepted

## Decision

Support owns Tickets, Attachments and Categories as feature slices in the existing
packages. Contact no longer has a separate deployment/runtime module. The retained
enquiry inbox remains permission-protected, but accepts no new public submissions.
`support-tickets` requires Support; attachments and categories follow Tickets with no
separate capability or switch.
Existing public namespaces, enquiry URLs, permission values, tables and integration
event identifiers remain stable, including links in already accepted notifications.

Typed Support settings expose the Tickets switch and an independent version.
Administrator-only reads/writes live at
`/api/v1/auth/administration/modules/support/settings`. Writes use the dispatcher
transaction, lock runtime rows before the Support settings row, reject stale versions
and commit audit with the settings. The dedicated Support settings page in the Modules submenu stays accessible with runtime Support
disabled. It contains the Tickets switch. Activation remains on the Modules page;
category management remains in the ticket area.
Delegated category administrators retain category access; module settings remain Administrator-only.

Module-owned `ICapabilityRestrictions` providers supply persisted restrictions.
The evaluator combines them by denial and passes them into the catalog before
dependency evaluation. Restrictions cannot enable a deployment, runtime, licensed
or rollout-disabled capability. Support's provider fails closed for missing settings;
Providers never cache state across requests. Generic module activation has no
Support-specific branches.

The protected enquiry inbox remains available for retained data. Existing accepted
notifications continue through the established delivery mechanism.

Ticket/category and attachment stores have separate Application contracts and endpoint
mappings. A shared module-local ticket context preserves live requester/agent checks,
actor and ticket locks, history and notifications. Shared EF transactions and models
remain intact; feature disabling never removes service registrations or mappings.

## Disablement and migration

Disabling Support makes the retained inbox unavailable. Retained enquiry data remains,
and accepted notifications continue draining. Disabling Tickets stops ticket, category
and attachment work. Existing data remains;
account erasure and accepted delivery continue.

The forward SupportFeatureSettings migration copies the previous Contact runtime
state and website recipient into Support settings before removing the old runtime
row. Existing enquiries are untouched. Missing old activation state becomes disabled.
A later forward `TicketAttachmentsFollowTickets` migration removes the separate
attachment preference without changing earlier migrations or stored attachments.
The historical Website recipient and enquiry-switch columns remain in the retained
schema but are no longer exposed by application contracts. Remove old
`Modules:contact`/`ClientModules:contact` deployment
overrides; use Support deployment selection and its feature settings instead.

## Verification

Focused PostgreSQL tests verify migration preservation, cross-context concurrency,
transactional settings, retained enquiries, attachment
ownership and missing-state restrictions. Endpoint metadata and catalog tests verify
feature gates and dependency propagation. See [Support](../support.md) and
[module extension guidance](../saas-modules.md).
