# ADR 0011: AIO-aligned repository layout

Status: Accepted

## Context

TemplateV4 used short layer directory names at the repository root and under `src`. TemplateAIO established a more discoverable convention where project directories and project files share the complete product-qualified name. The previous layout also separated tests and documentation configuration from closely related source assets.

## Decision

Use `TemplateV4.*` for .NET and IDE project directory names. Keep the solution and all application and test projects under `src`. Use `TemplateV4.ApiService`, `TemplateV4.BackgroundWorker`, and `TemplateV4.Angular` for the executable and frontend projects. Keep the PostgreSQL-only `TemplateV4.DatabaseMigrator` rather than introducing provider-specific migration projects.

Rename Framework.Core to `TemplateV4.SharedKernel`. SharedKernel remains BCL-only and owns reusable CQRS, result, authorization, messaging, and provider contracts. It does not absorb application or domain behavior.

Keep the DocMD workspace at `documentation` and its Markdown sources at `documentation/docs`. Retain `framework.json`, `framework.schema.json`, `contracts`, `deploy`, and `tools` at the repository root because they are repository-wide contracts and automation entry points.

## Consequences

Project paths are longer but unambiguous in IDEs, build output, package metadata, and automation. Tests are grouped as Application, UI workspace, and repository Utility projects while browser tests stay with the Angular toolchain. Moving or adding projects requires synchronized updates to the framework manifest, solution, CI, deployment files, scaffolding, and developer documentation.

## Enforcement and extension points

`framework.json` is the canonical path inventory. Utility tests verify that every declared project path exists. UI tests verify that the Angular workspace retains its owned Spartan configuration. Architecture tests continue to enforce the Domain, Application, and SharedKernel dependency boundaries.
