# Canonical user-management slice

An Administrator invites an account with Reader and/or Administrator roles from the Spartan user-management page. Angular sends a create command with an idempotency key. API authentication validates the JWT and live session, then checks users.manage. The dispatcher validates email/name/culture/roles and opens a transaction. Infrastructure creates Identity membership and the Domain profile. UserProvisioned becomes users.created.v1 in the same transaction; an audit entry records the actor.

Only after commit can a Worker claim the outbox row with FOR UPDATE SKIP LOCKED. The local consumer creates an encrypted verification-email request and inbox receipt. The email consumer sends through SMTP/Mailpit. Trace context follows CQRS → outbox → Worker, while audit entries record business/security effects separately.

User list requests are bounded and stably sorted. Updates require the profile concurrency version, prevent self-lockout and last-administrator removal, and revoke active sessions. Reader accounts can access only their own profile and sessions; directory endpoints require administrative permissions. UI permission helpers hide actions; backend policies enforce them.

The sample demonstrates administration of account invitations and activation status. Read Authentication and Authorization tests before changing token or role behavior. Add new role permissions to seeded metadata and ensure existing sessions are invalidated during permission migrations.
