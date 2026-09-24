# Third-party notices

Inter 4.1 in `src/TemplateV4.Angular/public/fonts/inter/InterVariable.woff2` is from https://github.com/rsms/inter/tree/v4.1, distributed under the SIL Open Font License 1.1. The full license and copyright notice are included alongside the font in `OFL.txt`.

Quartz PostgreSQL schema in `src/TemplateV4.Infrastructure/Persistence/Migrations/quartz-3.20.1.sql` is adapted from Quartz.NET v3.20.1, and the Quartz 4 compatibility migration is adapted from Quartz.NET v4.0.1, https://github.com/quartznet/quartznet, distributed under the Apache License 2.0. Destructive reset statements are excluded.

Spartan Helm sources in `src/TemplateV4.Angular/libs/ui` are generated from @spartan-ng/cli 1.4.1, https://github.com/spartan-ng/spartan, distributed under the MIT license. Preserve upstream notices when customizing these components.

The documentation site is generated with @docmd/core 0.9.6, https://github.com/docmd-io/docmd, distributed under the MIT license.

Other dependencies retain their respective licenses in NuGet/npm packages. See package lockfiles for exact versions.

## Authentication artwork

The rendering functions and preset data in `src/TemplateV4.Angular/src/app/shared/gradient-engine.js` and `core/gradient-catalog.ts` are extracted from FeralUI Gradient Builder by Sarthak Navalekar, https://feralui.dev/gradients, retrieved 2026-09-13 from https://feralui.dev/assets/JapaneseGradients-CrhZ19t-.js using `tools/vendor-gradients.mjs`. They cover all 30 current types and 298 color presets, preserving the builder's native effects and motion parameters. The Angular canvas host, lifecycle, frame limits, reduced-motion handling and settings integration are project-owned. All rendering code is bundled locally; no third-party script, font or service is loaded at sign-in.

`src/TemplateV4.Angular/public/auth-background.jpg` uses the Unsplash image referenced by Spartan's Login 2 and Signup 2 blocks: https://images.unsplash.com/photo-1604076850742-4c7221f3101b . Distributed under the Unsplash license (https://unsplash.com/license). Replace this local asset to customize template artwork.
