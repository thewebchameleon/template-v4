# ADR 0047: one organisation per deployment

Status: Accepted

File ownership and quota rules are superseded by [ADR 0048](0048-unified-organisation-files.md).. Supersedes the account modes, memberships and tenant isolation in
[ADR 0019](0019-saas-customer-isolation.md), and the ownership model in
[ADR 0026](0026-customer-billing-implementation.md).

## Decision

Every deployment has exactly one organisation, seeded by a forward migration and
enforced by a PostgreSQL singleton constraint. Administrators edit its name, logo,
website, primary contact email, default time zone and country/region in Administration
→ Configuration. The name and logo are the system-wide identity used by the application
shell, authentication, email and newly issued commercial-document snapshots. Immutable
logo rows remain available to render retained documents after the active logo changes.
Existing appearance, public-website content, legal issuer and account-security settings
retain their owners.
Public registration, invitations, administrator-created users and optional approval
remain configurable through the existing account-security workflow.

There are no organisation memberships, invitations, owners, transfers, creation,
closure, selection preferences or personal customer accounts. Enabled, confirmed,
approved users share the organisation. Disabling a user or withholding registration
approval prevents access. Application roles and live permission grants authorize
writes. Administrators manage configuration and subscriptions; `crm.manage` grants
business-record writes and `organisation.files.manage` grants shared-file writes.
Existing invoicing permissions still control issuing, settlement and corrections.
Reader accounts can read shared records. New permissions are synchronized to the
Administrator role; delegated roles require explicit grants.

CRM, invoicing, attachments and the installed vehicle module use global record IDs,
uniqueness constraints and settings singletons. Their contracts and URLs no longer
accept organisation IDs. Business-customer IDs still identify CRM contacts/companies.
The stable organisation identity remains in billing history, audit references and
object-storage keys; it is not a selectable tenant boundary. Tenant feature-flag
overrides are removed; user, environment and default precedence remains.

One subscription supplies the deployment's entitlements. Payment callbacks,
reconciliation and cancellation retain their existing lifecycle behavior. Private
file ownership and sharing remain private. With a subscription, private and shared
file reservations consume one combined storage allowance, serialized by the same
transaction lock. Without a subscription, configured private quotas and the free
shared-library quota remain applicable. Privacy erasure removes personal data and
staff attribution without requiring organisation ownership transfer or cancelling
the deployment's subscription.

## Migration and validation

This change targets fresh databases. All previous migration files remain permanent;
new migrations remove tenant columns and membership tables and seed the singleton.
It is not a data-consolidation path for populated multi-organisation installations.
The module's own migration history remains separate and intact.
