# ADR 0007: interactive first-administrator bootstrap

Status: Accepted

## Context

An empty installation needs exactly one initial Administrator before authenticated user management is possible. Static bootstrap usernames and passwords in deployment configuration remain reusable until operators remove them, complicate secret inventories, and do not provide a guided browser flow.

## Decision

When PostgreSQL has neither a bootstrap completion timestamp nor an Administrator membership, each API process generates a cryptographically random token at startup and prints it directly to the protected server console. The token is held only in process memory and changes on every restart while bootstrap remains available.

An anonymous status endpoint reports only whether bootstrap is available. A rate-limited, CSRF- and Origin-protected POST accepts the token, username, and password together over HTTPS. Token comparison is constant-time. Creation is serialized in PostgreSQL, rechecks bootstrap completion and Administrator membership while holding the lock, creates the Identity account and profile, assigns Administrator, persists the completion timestamp, and records a security audit event in one transaction. All failures use bounded, non-secret error responses; request bodies, passwords, and tokens are never logged.

A completion timestamp is the permanent persisted marker. Existing installations that already contain an Administrator write this timestamp during startup. Once present, status reports unavailable and POST cannot create another account, including after restarts or later account changes. Normal password authentication uses the Identity username. Invited users remain compatible because their username is their email address; email remains the address for invitations and recovery.

## Consequences

Operators must have privileged console access and access the public application over HTTPS. Before initial setup, production runs a single API replica because tokens are process-local; replicas may be scaled out after completion. Losing the current token only requires restarting that API process while bootstrap remains incomplete. Deleting every Administrator does not reopen bootstrap because the completion timestamp is retained; ordinary administration also prohibits last-administrator removal.

## Enforcement and extension points

Integration tests cover availability, invalid tokens, single creation, restart-independent lockout, and concurrent attempts against PostgreSQL. OpenAPI and Angular generated clients remain generator-owned. Deployments may replace console delivery with another reviewed one-time secret channel, but must keep the token ephemeral, avoid browser disclosure, and retain persisted one-time completion and transactional serialization.
