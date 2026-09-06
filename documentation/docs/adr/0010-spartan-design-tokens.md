# ADR 0010: Spartan blocks and template design tokens

Status: Accepted

Use Spartan Sidebar 2 (inset navigation) for authenticated routes and Login 2 / Signup 2 (two-column forms) for authentication. Retain the existing credential, passkey, recovery and invitation flows. Navigation reflects available permissions; it contains no demonstration-only destinations.

Copied Helm components are the application control system. Compose fields, switches, checkboxes, toggle groups, tables, cards, alerts, empty states, menus and the responsive sidebar using their actual selectors. Native HTML remains appropriate for semantic structure, but adding an unknown Helm attribute to a native control does not style it. Brain remains the only headless dependency.

Tabular application data uses the reusable `app-data-table` composition in `src/TemplateV4.Angular/src/app/shared/data-table.ts`. It follows Spartan's Data Table guide by combining the copied Helm table directives with TanStack Angular Table; feature pages provide typed column definitions and data, and interactive cells use Angular components through `flexRenderComponent`. New feature tables extend this composition instead of writing page-local table markup or introducing another grid library. Server-backed filtering, sorting and pagination remain owned by the feature and API when the full dataset is not loaded in the browser.

Keep project branding in `src/TemplateV4.Angular/src/brand.css`: complete primary and neutral shade palettes, light/dark semantic color mappings, chart colors, and separate heading/body font stacks. The default project palette uses blue as its primary color. Components consume semantic tokens rather than palette shades so a project can be rebranded without page-level overrides. Keep global Tailwind/Spartan setup and non-brand base styles in `src/TemplateV4.Angular/src/styles.css`, and layout dimensions in `src/TemplateV4.Angular/src/design-tokens.css`. Tailwind spacing, typography and radius variables provide the shared scales used by copied Helm controls. Authentication shares one layout and local artwork; no external image origin is required by CSP. The photo is the reference block's Unsplash image, recorded in THIRD-PARTY-NOTICES.

The inset main and sidebar are siblings. The mobile sheet receives a localized accessible title, and selecting navigation closes it. The account menu owns account actions and sign-out. Appearance and language controls remain accessible before sign-in and from a localized Spartan drawer opened by an ng-icons settings button in the authenticated header.

The authenticated header owns the shared Spartan breadcrumb composition. Route data supplies stable localized labels, URL segments provide the automatic fallback, and pages may replace the trail through the shared breadcrumb service for runtime entity labels. Ancestors remain navigable, the current page is non-interactive, long trails collapse their middle levels on mobile, and the named back action uses browser history rather than assuming the breadcrumb parent is the previous page.

Validation includes production builds under the deployed CSP, keyboard/mobile navigation, WCAG checks in both themes, and focused registration/settings tests. Backend verification requirements are recorded in ADR 0009.
