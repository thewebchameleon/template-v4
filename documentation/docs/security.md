# Security

Security is enforced at the API and Application boundaries. Frontend route visibility,
feature flags, and module state improve navigation but never replace authorization.

## Identity and access

Use short-lived access with rotating, revocable sessions. Mutating browser requests
require CSRF protection. Recent verification is required for sensitive account actions.
MFA policy may be optional, Administrator-only, or universal; privileged accounts must
not bypass the configured policy. Keep at least two passkeys on separate devices and a
second active administrator.

Permissions are stable public contracts. Built-in roles are protected, delegated roles
receive only explicit grants, and last-administrator invariants must be transactional.
Bind commands to the authenticated actor rather than trusting actor IDs supplied by a
client. Background work receives an explicit execution context; never pass `HttpContext`
into Application code.

External API keys are random, one-time-displayed, hashed at rest, scoped, revocable, and
audited. A key authorizes only explicitly supported external endpoints and never grants
interactive browser access.

## Secrets and data

Use production signing keys, shared persistent Data Protection keys, dedicated database
roles, private S3 credentials, and real SMTP credentials. Keep secrets out of source,
images, browser runtime configuration, logs, traces, audit details, support tickets, and
backup reports. Never log authorization headers, refresh tokens, action URLs, message
payloads, or file content.

Validate ownership on every private read and write. All uploads pass through the shared
quota admission contract and use bounded size/type rules. Public file links use strong
random capabilities stored only as hashes, with expiry and revocation checked on every
request. Downloads default to attachment and `no-store` unless a public contract says
otherwise.

Audit records are separate from diagnostics. Store stable action names, actor/subject
identifiers, and allowlisted structured changes; redact or erase personal details through
the privacy lifecycle without weakening security-event retention requirements.

## Browser and network

Production uses one HTTPS origin through the Web proxy. Keep API, Worker, database,
telemetry, and readiness endpoints private. Trust forwarded headers only from the known
proxy. Maintain restrictive CSP, secure cookie settings, WebSocket proxying, request-size
limits, and rate limits when changing ingress.

## Recovery

Normal password, MFA, passkey, and session changes use the supported account flows and
revoke affected sessions. There is no administrator MFA-bypass endpoint. Total loss of
privileged factors requires a reviewed maintenance procedure with independent identity
verification, a second operator, a current backup, a scoped database transaction,
session revocation, security-stamp rotation, and an audit record. Never disable the
deployment-wide policy or remove another account's factors to recover one user.

Treat dependency alerts, authentication regressions, authorization gaps, secret
exposure, and cross-tenant/cross-user access as release blockers.
