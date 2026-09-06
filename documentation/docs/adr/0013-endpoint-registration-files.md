# ADR 0013: feature-owned API endpoint registration

Status: Accepted

## Context

Minimal API route handlers, authorization metadata, and HTTP contracts were registered directly in `ApiService/Program.cs`. As the built-in surface grew, application startup mixed host configuration with unrelated feature behavior and made endpoint ownership difficult to identify.

## Decision

Register API routes in cohesive `ApiService/Endpoints/*Endpoints.cs` extension classes. Each class extends `RouteGroupBuilder`, owns the handlers and metadata for one feature area, and returns the group for explicit composition. `EndpointRegistration.MapApiEndpoints` creates the versioned route groups and composes every endpoint class. `Program.cs` configures the host and invokes that single composition method; it does not declare API route handlers.

Cross-cutting browser security for endpoint groups remains centralized in the endpoints folder so authentication and bootstrap routes share the same rate-limit, origin, and antiforgery behavior. The endpoint scaffold writes new registrations into this folder and generated feature endpoints must be explicitly added to `MapApiEndpoints`.

## Consequences

Endpoint ownership, authorization, operation IDs, and response metadata can be reviewed within one feature file. Startup remains compact, while endpoint discovery stays explicit rather than reflection-based. A feature with many unrelated routes should be split into additional cohesive endpoint classes instead of growing one catch-all registration file.

## Enforcement and extension points

API route declarations belong under `src/TemplateV4.ApiService/Endpoints` in files ending with `Endpoints.cs`. Add new route groups or compose new feature registration methods in `EndpointRegistration.cs`. Keep stable paths and operation names when moving existing handlers, then export the OpenAPI contract and regenerate clients when the contract itself changes.
