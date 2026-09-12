# Security model

Verified email changes and administrator-reviewed anonymisation are described in [platform workflows](platform-workflows.md) and [ADR 0015](adr/0015-platform-baseline-workflows.md). Private file access is enforced by authenticated ownership on every operation; administrators do not bypass it.

Identity lives exclusively in Infrastructure. Access tokens are RS256 JWTs with five-minute lifetimes, held in Angular memory. Each authenticated request checks the session and current Identity security stamp in PostgreSQL. Role changes, disabling users, password resets, refresh reuse and explicit revocation invalidate sessions immediately.

Refresh tokens contain 64 random bytes and are persisted only as SHA-256 hashes. Cookies use Secure, HttpOnly, SameSite=Strict, Path=/, and the __Host- prefix. Rotation consumes each token under a PostgreSQL session-family row lock. Consumed-token reuse revokes the entire family; old hashes remain until the family expires. Browser tabs serialize refresh via Web Locks.

Every mutating cookie-authentication endpoint checks an explicit allowed Origin and an ASP.NET antiforgery token. Access-token endpoints require the Authorization header; they do not authenticate from cookies. Do not deploy Web/API on unrelated sites with these Strict-cookie defaults. Prefer one public origin and a reverse proxy.

User invitations contain no password. Verification queues a password-setting link, protected by Identity's time-limited tokens. Persisted action URLs are encrypted using Data Protection, and links carry secrets in fragments to avoid proxy URL logging. While administrator bootstrap has not been completed, each API process generates a cryptographically random bootstrap token and writes it directly to its server console. The CSRF-protected, rate-limited bootstrap endpoint accepts that token with the initial username and password over HTTPS. A completion timestamp in PostgreSQL permanently disables the endpoint; existing Administrator membership upgrades older installations to the completed state. Tokens are never persisted or sent to the browser by the status endpoint.

The bootstrap administrator is a permanent account. Its reserved `@example.invalid` address is intentionally non-deliverable, so password-reset and security-notification email is never queued for it. Operators must preserve its username and credentials and use another administrator account for recovery actions. Derived applications that require email recovery must replace the reserved address and define a verified delivery workflow before production use.

## Production configuration

Set ConnectionStrings__app with a workload-specific PostgreSQL credential, Web__PublicUrl, exact Web__AllowedOrigins, Jwt__PrivateKeyPath, Jwt__KeyId, DataProtection__KeyPath, DataProtection__CertificatePath, and the wrapping-certificate password. Share durable Data Protection key storage across API/Worker replicas and restrict its filesystem permissions. Mount private keys read-only. Production startup refuses unencrypted Data Protection key persistence.

JWT signing keys are separate from Data Protection. Rotate by adding the previous public PEM and key ID under Jwt__PreviousKeys, changing the active private key/key ID, and retaining the old validation key beyond maximum access-token lifetime plus clock skew. Rotate wrapping certificates with a reviewed plan to retain access to old Data Protection keys.

Terminate TLS at a trusted ingress. Set ReverseProxy__Address to that exact immediate proxy address. Do not trust arbitrary forwarded headers. Apply body limits and endpoint rate limits. Use separate ingress rules for health endpoints and never expose internal Worker health publicly. Authenticated responses default to no-store. Do not add Output Cache policies to permission-sensitive responses without a specific reviewed isolation policy.

SMTP requires STARTTLS in production. Supply provider credentials through secrets. Do not log token values, request bodies, cookies, database parameter values, or outbox payloads. Restrict audit access and define retention against your business/legal requirements before production rollout.

## Configurable MFA and optional passkeys

The Account security tab under Users offers Optional, Administrators (default), and Everyone. Saving these settings relies on the authenticated session and settings permission without additional password or MFA confirmation. Security owns the preferred method, authenticator enrollment, recovery codes, verified-email availability and optional passkeys. The Administrators policy covers custom roles with privileged permissions as well as the built-in Administrator role. Confirming an email automatically enables email-code MFA; the reserved bootstrap address does not. WebAuthn user verification is required. MFA is effective when the user has a configured email, authenticator or passkey method, or when the administrative policy requires it. Users with no configured method receive a setup-only session when policy requires MFA.

After password verification, sign-in opens the preferred email or authenticator factor directly. A preferred passkey remains in the method chooser until the user starts the browser prompt. Users can switch among configured methods. Email codes expire after ten minutes, have a 30-second resend cooldown, and impose a ten-minute email-method cooldown after five failures. Codes remain protected in challenge and outbox storage. Authenticator recovery codes appear only as an authenticator fallback. Passkey assertions are user-scoped and tied to the password challenge. Successful MFA returns to the originally requested internal route. See ADR 0005 for single-use semantics, factor-management reauthentication, replay protection and recovery policy.

Factor enrollment, passkey registration, and passkey removal require a session with MFA verification completed within the previous five minutes when the account currently relies on email or passkeys without an enabled authenticator. The API returns `auth.reauthentication_required` when that window has elapsed. The Security page keeps this state visible and directs the user through sign-out and sign-in before retrying the change.

Credential throttling uses PostgreSQL counters shared across replicas. Routine auth operations have a separate budget. Forgot-password and invitation requests have per-account cooldowns. The hosting-platform ingress must replace untrusted client forwarding headers. Nginx preserves its trusted client address and provides the API's only trusted immediate proxy hop.

## Public registration

Public registration is disabled by default. Administrators change the persisted flag using the settings permission and optimistic concurrency, without additional credential or factor confirmation. Signup always grants Reader and requires email confirmation before password login. The endpoint uses CSRF/Origin validation and the shared credential rate limit. Existing-account submissions do not replace passwords or resend email. Verification and password recovery continue working after registration is disabled. See [ADR 0009](adr/0009-configurable-public-registration.md).
