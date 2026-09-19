# ADR 0013: explicit, feature-owned API endpoint registration

Status: Accepted; source layout updated by [ADR 0042](0042-module-vertical-slices.md)
and ownership updated by [ADR 0043](0043-module-owned-composition.md).

## Decision

HTTP remains a thin adapter. A module owns cohesive endpoint registration methods,
authorization metadata, stable operation IDs, and request/response adaptation. The host
explicitly composes those methods; route discovery is not reflection based and host
startup does not contain feature handlers.

New foundation HTTP code follows the module-first layout under `TemplateV4.Http/<Module>`.
Business modules own their API entry points. Keep cross-cutting authentication,
antiforgery, rate limits, Problem Details, and OpenAPI behavior centralized.

Moving code must preserve public paths and operation IDs. Contract changes require an
OpenAPI export and regeneration by the owning client generator; generated clients are
never edited manually.
