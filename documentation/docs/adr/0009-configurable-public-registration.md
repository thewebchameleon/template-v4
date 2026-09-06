# ADR 0009: configurable public registration

Status: Accepted

Public self-registration is disabled by default in PostgreSQL security settings. Administrators can enable it using the existing versioned settings endpoint when their authenticated session has the settings permission; no additional password or factor confirmation is required. Registration and policy changes share the administrator advisory lock, so disabling registration is atomic with account creation. The public settings endpoint exposes only the enabled flag.

The public endpoint accepts email, display name, password and supported culture. It fixes membership to Reader; clients cannot select roles. Identity password validation applies, email starts unconfirmed, and login remains unavailable until verification succeeds. Account, profile, audit entry and encrypted verification-email outbox record commit together. The existing Worker delivers the email. Email action secrets remain in URL fragments and encrypted at rest. Existing invitations still receive a password-setting email after confirmation; self-registered accounts already own a password and can sign in after confirmation.

Registration inherits exact Origin, anonymous-bound antiforgery validation and the shared PostgreSQL credential rate budget. Duplicate accounts receive the same accepted response without modifying credentials or sending additional messages. Forgot-password can resend verification subject to its existing per-account cooldown. Disabling registration prevents new accounts; it does not disable existing accounts or invalidate their verification links.

Extension points: change registration defaults in the persisted settings model and migration together. Additional registration fields belong in the generated API contract and profile invariants. Any different initial membership, approval workflow or verification requirements need an explicit policy decision; never accept role assignments from the public request.

Validation: real PostgreSQL tests cover the default, permission enforcement, optimistic concurrency, disablement, Reader membership, duplicate handling, password validation, blocked pre-verification login, single-use confirmation and the encrypted outbox path. HTTP tests cover public status and CSRF protection; OpenAPI and Angular clients are generated.
