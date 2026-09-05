# Repository guidance

Before significant changes, inspect `framework.json`, `docs/README.md`, and the relevant decisions under `docs/adr/`. Keep code, manifest, docs, scaffolding, and CI consistent in the same change.

Domain has no framework dependencies. Application references only Domain and the BCL-only Framework.Core package. Infrastructure owns EF, Identity, providers, and transactions. API never references Quartz. Worker owns scheduling. No generic repositories or runtime service location in Application. Register handlers explicitly.

Use copied Spartan Helm controls; do not introduce competing UI libraries. Do not edit generated OpenAPI clients or migration designer files manually. Never log secrets, authorization headers, email action URLs, refresh tokens, or message payloads.

Run focused tests for behavior changes; use real PostgreSQL integration tests for persistence, sessions, or messaging changes. Run format/lint, manifest validation, and applicable builds before delivery. Significant conventions need an ADR and extension-point documentation.

Ask for clarification when a decision needs the user's input, and stop to await their response. Do not ask again for actions already authorized. Keep unrelated local work intact.
