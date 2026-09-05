# ADR 0004: Angular and Spartan with generated contracts

Status: Accepted

Keep Angular an independent npm workspace; esproj provides IDE integration only. Use lazy standalone components, signals for UI state, explicit HttpClient interceptors, and runtime configuration. Spartan Brain and copied Helm are the standard UI foundation. Use ng-openapi-gen with the API-produced OpenAPI contract; generated clients are owned by the generator and checked in CI. Runtime translations use stable keys; Intl formats culture-sensitive values. See manifest generatedCode and frontend build/lint checks.

Production disables critical-CSS inlining because Angular otherwise uses an inline stylesheet onload handler blocked by the strict CSP. External styles load without inline script exceptions. Browser checks verify actual mobile layout and accessibility under the deployed CSP.
