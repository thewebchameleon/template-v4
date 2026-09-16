# Support features

Support contains independently configured **Contact enquiries** and **Tickets** (including attachments). Categories are a separate implementation slice that follows
Tickets. Administrators manage the master module switch and feature toggles under
**Administration → Modules**. Feature settings remain editable while the
runtime module is off. Support is included in baseline and excluded by minimal.

| Feature | Capability | When disabled |
| --- | --- | --- |
| Contact enquiries | `support-enquiries` | Public submissions stop; retained inbox and queued notifications continue |
| Tickets | `support-tickets` | Ticket, category and attachment APIs stop; portal is hidden; data remains |

Attachments are part of Tickets and have no separate switch. The Modules page owns activation and feature switches. The Support settings page in its submenu contains only the enquiry notification recipient. Category management remains in the ticket area.
All new work requires Support activation. Account erasure and accepted email delivery
continue independently of these switches. Permission and requester checks remain
mandatory. See [ADR 0049](adr/0049-support-features.md).

## Contact enquiries

Set the **Enquiry notification recipient** under **Modules submenu → Support** and
enable Contact enquiries on the Modules page. The public Website must also be configured and enabled. Without a
recipient, the public form remains unavailable even if the preference is on. The
recipient is never exposed through public website discovery.

The retained inbox remains at **Administration → Contact enquiries**
(`/administration/contact`) and is also linked from Support settings. Delegate
`contact.manage` for inbox access. Existing permission values and notification links
are unchanged. New email links use the deployment's `Web:PublicUrl`.

Run DatabaseMigrator when upgrading. The forward `SupportFeatureSettings` migration
preserves existing enquiries, copies the previous Contact runtime switch and website
recipient into Support settings, and removes the old Contact module activation row.
Tickets default to enabled, still subject to Support activation. The later forward
`TicketAttachmentsFollowTickets` migration removes the separate attachment setting;
existing attachments are untouched and follow Tickets.
Remove `Modules:contact` and `ClientModules:contact` overrides from deployment
configuration; select Support and configure its features instead. Update API, Worker
and Migrator together. Existing migration history must not be regenerated.

## Getting started

Run DatabaseMigrator before starting the updated API and Worker. The original generated SupportPortal migration creates the `support` schema, a General category and an enabled runtime setting. The existing role seeder grants the new permissions to Administrator and revokes affected sessions so users sign in with current permissions. Deployment grants must include `support` for API and Worker runtime roles.

Authenticated users can submit a subject, description and active category. They see only their own tickets, public replies and attachments. Agents have `support.agent`; `support.admin` includes agent access and category administration. Use User Management → Roles to create a support role and assign it to staff. General user-management or settings permissions do not grant ticket access. Agent permissions are read from current database memberships on each request.

The agent queue supports search, category/status/priority/assignee filters, server pagination and sorting. Agents can assign active support staff, change category and priority, add public replies or internal notes, and change status. The assignee picker supports name searches, returning at most 100 matches. Categories are capped at 100; deactivate old categories without removing them from existing tickets. At least one category must stay active.

## Conversation and workflow

- New tickets start Open with Normal priority.
- Agents can move open tickets through In progress, Waiting on requester, Resolved and Closed. Closed tickets must return to Open before other changes of status.
- Requesters may reopen Resolved or Closed tickets. They cannot assign agents, change priority/category, or close tickets.
- Resolved and Closed tickets must be reopened before replies or attachments can be added.
- A public requester reply while Waiting on requester returns the ticket to Open.
- Internal notes are filtered on the server, including counts and account exports. They do not notify the requester. Assignment history is staff-only.
- Conversation/history is paginated, newest first, 25 entries per page. Changes use version checks; a stale save returns 409 and the browser retains its draft until explicitly refreshed.

Public replies and status/attachment changes notify the other participant when there is one. Assignment changes notify the assigned agent. Self-notifications are suppressed. In-app notifications link to the ticket; durable email contains a generic localized update and protected portal URL, never ticket text, filenames or internal notes. These transactional emails are independent of optional marketing/update preferences. Unassigned tickets appear in the queue; there is no broadcast to every agent.

## Attachments and privacy

Attachments are public within their ticket: requester and support staff can download them through an authenticated, no-store, attachment-only response. Private-note attachments are not supported. The portal uploads attachments after ticket creation.

Files are limited to 5 MiB each, ten files and 20 MiB total per ticket. They are stored in PostgreSQL `bytea` so the file, ticket version, history, audit and notifications commit atomically and erase together. They do not depend on the personal File Storage module or its quotas. No inline preview or malware scanning is provided; downloaded content remains untrusted. See [ADR 0025](adr/0025-customer-support-portal.md) for this storage tradeoff.

Account export includes requester tickets, public conversation and attachment metadata; file contents remain available through ticket downloads. Approved account erasure deletes requester tickets and their cascading messages/attachments, removes authored contributions elsewhere, and clears assignments. Erasure continues when the module is disabled. Audit retains event identifiers/actions but never ticket subjects, descriptions, message bodies or attachment names. No automatic ticket retention schedule is introduced.

## Validation

Run `node tools/framework.mjs clients` after changing the support API contract.

The portal uses owned Spartan controls and English/South African Afrikaans text. Most Support text is loaded with its route; global navigation/notification labels remain in the initial dictionary. Module settings translations load on the Modules route to preserve the existing initial bundle budget. Browser interaction and accessibility tests require explicit permission before execution.
