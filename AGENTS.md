# Repository guidance

Before significant changes, inspect `framework.json`, `documentation/docs/README.md`, and the relevant decisions under `documentation/docs/adr/`. Keep code, manifest, docs, scaffolding, and CI consistent in the same change.

Domain has no framework dependencies. Application references only Domain and the BCL-only SharedKernel package. Infrastructure owns EF, Identity, providers, and transactions. ApiService never references Quartz. BackgroundWorker owns scheduling. No generic repositories or runtime service location in Application. Register handlers explicitly.

Use copied Spartan Helm controls; do not introduce competing UI libraries. Do not edit generated OpenAPI clients or migration designer files manually. Never log secrets, authorization headers, email action URLs, refresh tokens, or message payloads.

Treat accessibility as an acceptance criterion for every UI change. Preserve semantic HTML, keyboard operation, visible focus, accessible names and state announcements, sufficient color contrast in light and dark modes, reduced-motion preferences, and usable zoom/reflow. Validate the affected experience with automated accessibility checks where applicable and with focused keyboard and visual review proportional to the change; E2E accessibility checks still require the explicit permission described below.

Data-table search inputs must apply automatically after a 300 ms debounce, persist the search in URL query state, and reset pagination to page 1. Do not add a manual search or submit button beside a data-table search input.

Boolean filters on data-table pages must use the copied Spartan Helm `hlm-checkbox` inside an `hlmField`, with an `hlmFieldLabel` and `hlmFieldDescription`. Do not use a switch or toggle button for these filters.

Leave all tests until the absolute last validation stage, after implementation, documentation, format/lint, manifest validation, and applicable builds are complete. Then run focused tests for behavior changes; use real PostgreSQL integration tests for persistence, sessions, or messaging changes. Before running any end-to-end (E2E) tests, ask the user for explicit permission and stop to await their response. Do not run E2E tests without that permission. Significant conventions need an ADR and extension-point documentation.

Ask for clarification when a decision needs the user's input, and stop to await their response. Do not ask again for actions already authorized. Keep unrelated local work intact.
