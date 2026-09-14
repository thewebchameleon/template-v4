# Action items

Open **Account → Action items** for work assigned to you or to a named work queue you staff. Each item links to the application page where the work is performed. The Dashboard embeds an overview: Administrators see all items; other users see their assignments and items they created. Outstanding and completed views support server pagination, search and sorting.

## Manual work

Any signed-in user who has completed security setup can create an item. Supply a title, optional description and an internal application path, then select either an active person or a named work queue. Person lookup exposes display names and identifiers only and returns at most 20 matches. No email addresses or access-management details are exposed through this lookup. The initial queues are **Registration approvals** and **Privacy reviews**. Both are initially staffed by Administrators with review access. Permission grants alone do not assign responsibility.

Assignment does not grant access to the linked page or any organisation. Existing route, API and organisation membership checks still apply. Internal links start with a single `/`; external URLs, API paths, whitespace, backslashes and percent escapes are rejected. Use the destination page's canonical path.

Either the creator or a currently eligible assignee can mark a manual item complete. A work queue needs only one response. Completion is atomic: simultaneous responses produce one completion and one audit event. Administrators' overview access does not give them completion rights for someone else's manual assignment.

## System reviews

Privacy deletion requests create a Privacy reviews item. Withdrawal or review resolves the item. The review decision remains in the privacy workflow; system items cannot be completed manually. Upgrading creates items for already-pending privacy requests.

Under **Administration → User Management → Account security**, enable public registration and **Require registration approval**. This setting applies only to subsequent public registrations. Applicants verify their email before appearing under **Registration requests** and creating an action item. They cannot sign in until approved. Reviewers must be Administrators holding `settings.manage`.

Approve or reject once. The decision, reviewer, timestamp, action completion, audit and decision email are committed together. Both decisions send email even when optional notification email is disabled. Rejected applications remain blocked; password reset does not bypass approval. Existing accounts and administrator invitations remain unaffected. Turning approval or registration off does not automatically approve already-pending applications.

## Notifications and lifecycle

Assignment creates in-app notifications for active eligible recipients. Notification copy is generic and links to the inbox, avoiding disclosure of item content after permissions change. Queue responsibility is evaluated from current Administrator membership, separately from the required `settings.manage` authorization, on each request including completion. Newly eligible users see existing outstanding items without receiving retroactive assignment notifications.

Action items are a cross-cutting platform feature alongside notifications and privacy, with no separate deployment/runtime switch. Workflow state remains authoritative. Their application contract is `IActionItems`; review integrations call `AddReview` and `ResolveReview` inside the owning workflow transaction. A unique source/id index prevents duplicate workflow items. New integrations must preserve the source workflow's authorization and data-retention rules.

Personal export includes manually created/directly assigned item content. Account erasure removes items authored by, directly assigned to, or concerning the erased account. Queue participation by itself does not establish ownership of another user's content. No action descriptions enter audit events or notification payloads.

Due dates, reminders, escalation, multiple required reviewers, reassignment and reopening are outside this release. See [ADR 0037](adr/0037-action-items-and-registration-review.md).

## Upgrading from permission assignments

The NamedActionQueues forward migration preserves item identifiers, content and completion states. System items move to the queue for their source. Manual permission assignments return to the original creator as individual assignments, because a permission does not identify the intended work queue. Existing individual assignments are unchanged. The old permissions endpoint is replaced by `GET /api/v1/auth/action-items/queues`, returning queue IDs and localized label keys. Assignment requests use `queueId`; permission strings are rejected.
