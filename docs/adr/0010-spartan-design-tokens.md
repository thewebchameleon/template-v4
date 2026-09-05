# ADR 0010: Spartan blocks and template design tokens

Status: Accepted

Use Spartan Sidebar 2 (inset navigation) for authenticated routes and Login 2 / Signup 2 (two-column forms) for authentication. Retain the existing credential, passkey, recovery and invitation flows. Navigation reflects available permissions; it contains no demonstration-only destinations.

Copied Helm components are the application control system. Compose fields, switches, checkboxes, toggle groups, tables, cards, alerts, empty states, menus and the responsive sidebar using their actual selectors. Native HTML remains appropriate for semantic structure, but adding an unknown Helm attribute to a native control does not style it. Brain remains the only headless dependency.

Keep semantic light/dark colors in `src/Web/src/styles.css` and layout/brand dimensions in `src/Web/src/design-tokens.css`. Tailwind spacing, typography and radius variables provide the shared scales used by copied Helm controls. Customize those scales and semantic tokens before adding per-page overrides. Authentication shares one layout and local artwork; no external image origin is required by CSP. The photo is the reference block's Unsplash image, recorded in THIRD-PARTY-NOTICES.

The inset main and sidebar are siblings. The mobile sheet receives a localized accessible title, and selecting navigation closes it. The account menu owns account actions and sign-out. Appearance and language controls remain accessible before sign-in and in the authenticated header.

Validation includes production builds under the deployed CSP, keyboard/mobile navigation, WCAG checks in both themes, and focused registration/settings tests. Backend verification requirements are recorded in ADR 0009.
