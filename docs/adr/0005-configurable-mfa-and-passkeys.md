# ADR 0005: configurable MFA and optional passkeys

Status: Accepted

Administrators configure Optional, Administrators (default), or Everyone MFA enforcement. Saving administrative settings requires the settings permission but no additional password or factor confirmation. Users own their authenticator and passkey enrollment. The default bootstrap administrator receives a setup-only session, which permits profile and enrollment operations but no user directory or administrative work. Policy is read from PostgreSQL on session validation, so tightening it takes effect across replicas and existing sessions immediately.

Password verification produces a five-minute, single-use challenge instead of a session only after authenticator MFA is enabled for the account. Registering a passkey alone does not add a second step to password sign-in; passkey sign-in remains an optional, independently verified path. TOTP and recovery-code verification are serialized per user and enforce Identity lockout. Accepted TOTP counters are persisted to reject replay. Recovery codes are one-use and shown only when generated. Changing factors changes the security stamp, revokes other sessions, records an audit event and queues a notification. Factor management requires password reauthentication and the existing authenticator when enabled. Passkey-only accounts require a recently verified session for factor management.

Optional passkeys use .NET 10 IPasskeyHandler with required user verification and an RP ID derived from Web:PublicUrl. A verified passkey can satisfy MFA without an additional TOTP prompt. Passkey challenge state is encrypted with Data Protection and stored in PostgreSQL; no credential material or challenge state is logged. Registration does not transfer existing credentials between users. Assertion counters are updated under serialization. Passkeys are not portable to a different RP domain: decide the production domain before enrollment.

No MFA bypass is granted to administrators. Users should keep a second passkey/device or authenticator recovery codes. Password reset does not disable MFA. If every factor is lost, use a separately governed operator recovery procedure with identity verification; this release does not expose an administrative bypass endpoint.

Browser refresh, password login, passkey login and logout use one Web Lock. Cross-tab logout clears local state. CSRF tokens deliberately use the anonymous principal both when issued and verified: the double-submit cookie/token remains required, alongside exact Origin validation, but token validity is independent of expiring JWT identities. Authorization still uses the original authenticated principal.

Validation: PostgreSQL challenge/recovery/permission tests; Playwright virtual-authenticator enrollment and login; generated OpenAPI contracts. Hardware, OS account recovery and platform-specific passkey syncing remain deployment acceptance checks.
