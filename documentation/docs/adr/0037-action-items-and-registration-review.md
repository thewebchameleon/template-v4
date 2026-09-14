# ADR 0037: action items and registration review

Status: Accepted

## Decision

Introduce a shared platform inbox through the Application `IActionItems` contract and explicit Infrastructure implementation. Persist items in `app.action_items`. Assign to exactly one user or one stable named queue: Registration approvals or Privacy reviews. Queue identity describes responsibility, not a permission or role. Both queues initially use current Administrator membership for staffing and separately require `settings.manage` for authorization. Assignment cannot grant permissions or organisation membership.

The personal view contains eligible assignments. The overview also contains authored work, while Administrators can oversee all items. Manual completion belongs to the creator or a current assignee. Serialize permission-sensitive writes with the existing account/access mutation lock and complete with a conditional update, preventing double completion. Writes, audit and assignment notifications share a transaction.

System items reference a source workflow and cannot be manually completed. Privacy and registration queues require `settings.manage` and Administrator membership, preserving the approved reviewer boundary. The owning workflow adds/resolves its item through the application contract in its existing transaction. This extends cross-cutting platform behavior without adding a deployment switch or a dependency between optional business modules.

Registration approval is captured on the user at public registration time. The default is `NotRequired` for existing accounts and invitations. `Pending` users enter review only after email verification; password, factor, passkey, refresh and session validation enforce the pending/rejected restriction. Approval/rejection is final for this release and atomically records the decision and queues email. Changing the setting does not release existing pending applicants.

## Consequences

Changes to staffing eligibility or authorization immediately affect inbox visibility and manual completion. Existing assignment notifications carry no item details. Creator/direct-assignee/source-subject content follows privacy erasure. The forward migration preserves existing account access and brings outstanding privacy requests into the inbox. Future source integrations must define resolution, retention and authorization through their owning workflows. See [the feature guide](../action-items.md).

NamedActionQueues supersedes permission-string assignments through a forward migration. It maps system items by source and returns old manual permission assignments to their creators without losing content or history. Queue membership administration is deferred; the queue catalog and eligibility policy can evolve independently of item assignment.
