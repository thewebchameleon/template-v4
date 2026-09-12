# Customer support portal

Support is a customer portal at `/support` with a personal ticket list and a permission-controlled agent queue. It is enabled in the baseline deployment preset and disabled in minimal. Administrators can switch it under Administration → Modules. Disabling retains data, blocks every Support API, and hides/guards the portal. Account erasure and already accepted email delivery continue.

## Getting started

Run DatabaseMigrator before starting the updated API and Worker. The generated SupportPortal migration creates the `support` schema, a General category and an enabled runtime setting. The existing role seeder grants the new permissions to Administrator and revokes affected sessions so users sign in with current permissions. Deployment grants must include `support` for API and Worker runtime roles.

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

Files are limited to 5 MiB each, ten files and 20 MiB total per ticket. They are stored in PostgreSQL `bytea` so the file, ticket version, history, audit and notifications commit atomically and erase together. They do not depend on the personal Files module or its quotas. No inline preview or malware scanning is provided; downloaded content remains untrusted. See [ADR 0025](adr/0025-customer-support-portal.md) for this storage tradeoff.

Account export includes requester tickets, public conversation and attachment metadata; file contents remain available through ticket downloads. Approved account erasure deletes requester tickets and their cascading messages/attachments, removes authored contributions elsewhere, and clears assignments. Erasure continues when the module is disabled. Audit retains event identifiers/actions but never ticket subjects, descriptions, message bodies or attachment names. No automatic ticket retention schedule is introduced.

## Validation

`SupportPortalTests.cs` covers real PostgreSQL requester isolation, queue access, server filtering of internal notes, attachments, version conflicts, workflow, sorting, notification/outbox records, module preservation and privacy erasure. Runtime module tests cover administrator authorization and optimistic saves. Export OpenAPI through the existing API contract test, then run `node tools/framework.mjs clients`.

The portal uses owned Spartan controls and English/South African Afrikaans text. Most Support text is loaded with its route; global navigation/notification labels remain in the initial dictionary. The initial Angular error budget allows 1040 kB (10 kB more than the preceding shell) for the added navigation, route and shared styles; the 500 kB warning remains. Browser interaction and accessibility tests require explicit permission before execution.
