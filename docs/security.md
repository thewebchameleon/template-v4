# Security model

Identity lives exclusively in Infrastructure. Access tokens are RS256 JWTs with five-minute lifetimes, held in Angular memory. Each authenticated request checks the session and current Identity security stamp in PostgreSQL. Role changes, disabling users, password resets, refresh reuse and explicit revocation invalidate sessions immediately.

Refresh tokens contain 64 random bytes and are persisted only as SHA-256 hashes. Cookies use Secure, HttpOnly, SameSite=Strict, Path=/, and the __Host- prefix. Rotation consumes each token under a PostgreSQL session-family row lock. Consumed-token reuse revokes the entire family; old hashes remain until the family expires. Browser tabs serialize refresh via Web Locks.

Every mutating cookie-authentication endpoint checks an explicit allowed Origin and an ASP.NET antiforgery token. Access-token endpoints require the Authorization header; they do not authenticate from cookies. Do not deploy Web/API on unrelated sites with these Strict-cookie defaults. Prefer one public origin and a reverse proxy.

User invitations contain no password. Verification queues a password-setting link, protected by Identity's time-limited tokens. Persisted action URLs are encrypted using Data Protection, and links carry secrets in fragments to avoid proxy URL logging. While administrator bootstrap has not been completed, each API process generates a cryptographically random bootstrap token and writes it directly to its server console. The CSRF-protected, rate-limited bootstrap endpoint accepts that token with the initial username and password over HTTPS. A completion timestamp in PostgreSQL permanently disables the endpoint; existing Administrator membership upgrades older installations to the completed state. Tokens are never persisted or sent to the browser by the status endpoint.

## Production configuration

Set ConnectionStrings__app with a workload-specific PostgreSQL credential, Web__PublicUrl, exact Web__AllowedOrigins, Jwt__PrivateKeyPath, Jwt__KeyId, DataProtection__KeyPath, DataProtection__CertificatePath, and the wrapping-certificate password. Share durable Data Protection key storage across API/Worker replicas and restrict its filesystem permissions. Mount private keys read-only. Production startup refuses unencrypted Data Protection key persistence.

JWT signing keys are separate from Data Protection. Rotate by adding the previous public PEM and key ID under Jwt__PreviousKeys, changing the active private key/key ID, and retaining the old validation key beyond maximum access-token lifetime plus clock skew. Rotate wrapping certificates with a reviewed plan to retain access to old Data Protection keys.

Terminate TLS at a trusted ingress. Set ReverseProxy__Address to that exact immediate proxy address. Do not trust arbitrary forwarded headers. Apply body limits and endpoint rate limits. Use separate ingress rules for health endpoints and never expose internal Worker health publicly. Authenticated responses default to no-store. Do not add Output Cache policies to permission-sensitive responses without a specific reviewed isolation policy.

SMTP requires STARTTLS in production. Supply provider credentials through secrets. Do not log token values, request bodies, cookies, database parameter values, or outbox payloads. Restrict audit access and define retention against your business/legal requirements before production rollout.

## Configurable MFA and optional passkeys

Admin settings offers Optional, Administrators (default), and Everyone. My profile owns authenticator enrollment, recovery codes, and optional passkeys. WebAuthn user verification is required. Password-only sessions become restricted immediately when enforcement requires enrollment. See ADR 0005 for challenge lifetime, single-use semantics, reauthentication, replay protection and recovery policy.

Credential throttling uses PostgreSQL counters shared across replicas. Routine auth operations have a separate budget. Forgot-password and invitation requests have per-account cooldowns. The production Nginx ingress overwrites forwarded headers and provides the only trusted proxy hop.
