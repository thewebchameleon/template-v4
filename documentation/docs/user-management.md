# Canonical user-management slice

An authorized administrator invites an account with built-in or custom roles from Users. Delegated administrators can assign only roles whose permissions they hold. Angular sends a create command with an idempotency key. API authentication validates the JWT and live session, then checks users.manage. The dispatcher validates email/name/culture/roles and opens a transaction. Infrastructure creates Identity membership and the Domain profile. UserProvisioned becomes users.created.v1 in the same transaction; an audit entry records the actor.

Only after commit can a Worker claim the outbox row with FOR UPDATE SKIP LOCKED. The local consumer creates an encrypted verification-email request and inbox receipt. The email consumer sends through SMTP/Mailpit. Trace context follows CQRS → outbox → Worker, while audit entries record business/security effects separately.

User list requests are bounded and stably sorted. Updates require the profile concurrency version, prevent self-lockout and last-administrator removal, and revoke active sessions. Reader accounts can access their own Account, Security, sessions, Notifications and Privacy pages; directory endpoints require administrative permissions. UI permission helpers hide actions; backend policies enforce them.

The sample demonstrates administration of account invitations and activation status. Its directory is rendered through the shared Spartan/TanStack `app-data-table` composition while search and pagination remain server-side. Read Authentication and Authorization tests before changing token or role behavior. Add new role permissions to seeded metadata and ensure existing sessions are invalidated during permission migrations.

## Public registration

Administrators can enable public registration in Admin settings; it starts disabled. Signup collects email, display name, password and culture and creates an unconfirmed Reader account. The verification link activates sign-in with the chosen password. Duplicate submissions receive an accepted response without changing an existing account. Forgot-password resends verification for unconfirmed accounts under the existing cooldown.

The registration service owns a transaction containing Identity membership, profile, audit entry and encrypted verification outbox record. It serializes against security-policy changes. See [ADR 0009](adr/0009-configurable-public-registration.md) for defaults, security requirements and extension points.

## Administration workspace

See [administration and delegated access](administration.md) for the Users/Invitations workspace, custom roles, permission assignment and upgrade requirements. Built-in roles are protected; custom roles are managed through the access service.
