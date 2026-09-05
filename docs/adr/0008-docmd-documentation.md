# ADR 0008: DocMD documentation project

Status: Accepted

Use DocMD as an independent npm workspace in `src/Documentation` to validate, render, and serve the Markdown sources in `docs`. Pin the DocMD version in both the framework manifest and the npm lockfile. Aspire starts the DocMD development server and CI validates links and builds the static site.

The documentation project does not contain an application-specific Markdown renderer. This keeps documentation navigation, search, theming, and static output on DocMD conventions while leaving the Markdown source alongside the repository architecture and operational guidance.
