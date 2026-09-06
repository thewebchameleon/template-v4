# ADR 0014: account and security use-case boundaries

Status: Accepted

## Context

Account and security endpoints previously performed some persistence queries and profile updates directly in ApiService. Domain event suppression also required callers to create a profile and then clear its events. These shortcuts made HTTP handlers responsible for use-case behavior and made the meaning of profile creation depend on a cleanup step.

## Decision

ApiService handlers translate HTTP input, resolve the authenticated actor/session, invoke an Infrastructure use-case service, and translate its result. They do not query or update `FrameworkDb` directly. Identity, sessions, credential operations, and account persistence remain in focused Infrastructure security services because Application cannot reference ASP.NET Core Identity or EF Core.

`AuthService` owns authentication sessions, including session listing and revocation. `AccountService` owns account recovery, confirmation, culture preference, and account email-delivery eligibility. `SecurityService` owns MFA policy and authenticator lifecycle. `PasskeyService` owns WebAuthn credential lifecycle. Services may share narrowly scoped policy helpers, but callers do not locate services dynamically and no generic repository is introduced.

Domain factory arguments express whether an event is part of the requested use case. Registration and bootstrap create active profiles without invitation events; administrator-created users retain the invitation event. Callers must not clear domain events to change factory semantics.

## Consequences

HTTP endpoint files remain reviewable contract adapters and persistence behavior has one transaction-aware owner. Integration tests can exercise each use case without duplicating endpoint persistence logic. Adding account behavior requires extending the owning service and keeping the endpoint thin.

The boundary permits Infrastructure services because the implementation depends on provider APIs. New provider-independent business rules still belong in Domain or Application. If a service grows across unrelated account concerns, split it by use case while preserving explicit registration.

## Enforcement and extension points

Search endpoint files for `FrameworkDb`, `UserManager`, or direct EF operations during review. Exceptions require a new decision record explaining why transport code must own persistence. Add provider-independent commands and handlers in Application when a use case does not require Infrastructure types. Keep Identity and EF implementations in Infrastructure.
