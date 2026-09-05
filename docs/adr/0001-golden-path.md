# ADR 0001: explicit Clean Architecture and provider boundaries

Status: Accepted

Domain is BCL-only. Application contains contracts, lightweight typed CQRS, results and validation. Infrastructure owns Identity and EF. A typed dispatcher is constructor-injected for each request, with explicit DI registration instead of reflection-based handler lookup. Tests enforce Domain/Application assembly boundaries. Provider replacement occurs through named Application interfaces implemented in Infrastructure.

Commands define transactions, queries do not. Expected failures roll back. State, audit and outgoing events commit atomically. This trades some explicit registration for predictable behavior and agent-readable code.

Framework.Core now packages the BCL-only dispatcher/results/provider contracts independently. Application references Domain and Framework.Core and retains app-specific contracts/handlers. Tests enforce this dependency boundary.
