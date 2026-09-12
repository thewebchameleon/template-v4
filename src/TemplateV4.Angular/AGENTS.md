# Angular guidance

Applies to this workspace in addition to the root guidance. Read the relevant UI sections of the [developer guide](../../documentation/docs/README.md) and [ADR 0010](../../documentation/docs/adr/0010-spartan-design-tokens.md) for changes to shared components, layout, or interaction conventions.

## Controls and accessibility

- Use the owned Spartan Helm controls in `libs/ui` and inspect their actual selectors before composing them. Do not add competing UI libraries or unsupported Helm attributes. Check `components.json` and run `npx ng g @spartan-ng/cli:info --json` before adding components.
- Use the Spartan `hlm-select` dropdown for selection fields, including drawer forms, rather than native `<select>` or `hlm-native-select`. Compose `hlm-select-trigger`, `hlm-select-value`, and portaled `hlm-select-content` with `hlm-select-item`; preserve accessible labels, placeholders, and required-value validation.
- Keep shared styling in owned components and semantic theme/layout tokens. Maintain UI text in both manifest-supported cultures; keep generated API code untouched.
- Accessibility is an acceptance criterion: semantic HTML, keyboard operation, visible focus, accessible names and state announcements, contrast in both themes, reduced-motion preferences, and usable zoom/reflow.
- Validate affected interactions with proportional keyboard and visual review and applicable automated accessibility checks. Root E2E permission requirements also apply to accessibility automation. Report any review that could not be performed.

## Data tables

- Reuse `src/app/shared/data-table.ts` (`app-data-table`) with typed columns. Use server pagination and sorting for data-bearing columns; action-only columns are not sortable. Keep query state in the URL; APIs allowlist sorting and use a stable identifier as secondary ordering.
- Search applies automatically after the shared 300 ms debounce, persists in URL query state, and resets pagination to page 1. Do not add a manual search/submit button.
- Compose `hlmCard`, `hlmCardHeader`, and `hlmCardContent` with `app-data-table`, immediately followed by `app-list-pager` as the last content. No intervening grid/flex gap.
- Align headings, filters, outer columns, and pager content through shared `workspace.css` and `--card-spacing` (four spacing units; 16px at the default scale). Do not compensate with page-local horizontal offsets.
- Preserve the pager's full-width semantic card background, matching bottom corners, and equal compact vertical padding. Results stay left and pagination right, stacking on mobile. Check compact density and both themes.
- Use the shared 10-row default and 5/10/25/50 page-size options.
- Boolean filters use `hlm-checkbox` within `hlmField`, with `hlmFieldLabel` and `hlmFieldDescription`; wrap the complete described field in the label. Do not substitute a switch or toggle button.
