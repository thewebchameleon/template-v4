# Third-party notices

Quartz PostgreSQL schema in `src/Infrastructure/Persistence/Migrations/quartz-3.20.1.sql` is adapted from Quartz.NET v3.20.1, https://github.com/quartznet/quartznet, distributed under the Apache License 2.0. The destructive reset preamble is removed and schema search path is set explicitly.

Spartan Helm sources in `src/Web/libs/ui` are generated from @spartan-ng/cli 1.4.1, https://github.com/spartan-ng/spartan, distributed under the MIT license. Preserve upstream notices when customizing these components.

The documentation site is generated with @docmd/core 0.9.4, https://github.com/docmd-io/docmd, distributed under the MIT license.

Other dependencies retain their respective licenses in NuGet/npm packages. See package lockfiles for exact versions.

## Authentication artwork

`src/Web/public/auth-background.jpg` uses the Unsplash image referenced by Spartan's Login 2 and Signup 2 blocks: https://images.unsplash.com/photo-1604076850742-4c7221f3101b . Distributed under the Unsplash license (https://unsplash.com/license). Replace this local asset to customize template artwork.
