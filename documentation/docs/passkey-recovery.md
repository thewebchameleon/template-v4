# Privileged passkey recovery

Keep two user-verified passkeys on separate devices and a second active administrator. Routine factor management uses recent verification and never removes the last required passkey.

If every registered passkey for a privileged account is lost, password reset alone intentionally does not unlock the account. An operator with database access must perform a controlled recovery:

1. Verify the account holder through an established independent channel. Obtain a second operator's approval and record a recovery ticket with the account UUID. Do not accept email possession alone as sufficient privileged recovery proof.
2. Schedule a restricted maintenance window. Prevent ordinary sign-ins for the affected account until the holder is ready to enroll. Use a workload-specific database credential, an encrypted connection and a current backup.
3. In a single PostgreSQL transaction, acquire the account advisory lock using `pg_advisory_xact_lock(hashtextextended(account_uuid::text, 0))`. Remove only that account's entries from `identity."AspNetUserPasskeys"` and `identity.auth_challenges`, revoke its `identity.sessions`, and rotate its Identity security stamp. Record an `auth.passkey_recovered` event in `audit.entries` with the affected UUID, operator identity, timestamp, maintenance source and recovery ticket reference. Confirm the UUID and affected rows before committing. Never delete other users' factors or disable the deployment-wide passkey policy.
4. Have the verified holder sign in with their password. The account remains setup-only until they register a user-verified passkey. If the password is also lost, complete the existing verified password recovery flow separately; the reserved bootstrap address cannot receive recovery email.
5. Register a second passkey, verify normal access, and confirm all earlier sessions remain revoked. Restore normal access and close the recovery ticket with the audit identifier. Do not retain private keys, recovery codes or action URLs in the ticket.

This is an exceptional database maintenance procedure, not a public HTTP recovery endpoint. It was documented during implementation and has not been performed on a live account.
