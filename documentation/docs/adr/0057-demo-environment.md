# ADR 0057: Deployment-wide demo environment

Status: Accepted

## Decision

`TEMPLATEV4_DEMO_MODE=true` selects demo behavior for the API, Worker and Database
Migrator. The Migrator applies migrations, enables deployed runtime modules, activates
File Storage demo expiry, and invokes module-owned `IDemoDataContributor` seeders.
The AppHost and Compose entry points pass the same value to all three processes.
Module availability, module feature flags and capability settings are open for the
selected deployment; physical module selection, permissions and operation-specific
checks still apply.

Seeders use stable identifiers and add missing fictional records without replacing
existing records. Core identity supplies a disabled participant without a password so support
and invoicing examples can reference an actor. Normal administrator bootstrap remains
the way to obtain a sign-in account. File Storage receives no sample files or folders.

The former administrator demo switch is read-only state. Its write endpoint rejects
changes to demo mode while retaining the existing request shape for client
compatibility. The environment variable is the only way to change demo mode.

## Existing databases and exit

Each Migrator run in demo mode starts a new File Storage expiry window. Only files
created on or after that run can expire. Existing files are preserved; restarting the
Migrator starts a new window and preserves files from earlier runs. Disabling demo mode
requires running the Migrator with `TEMPLATEV4_DEMO_MODE=false`; it stops new demo
expiry decisions. Already requested purges still proceed. Seeded records, runtime
module activation and seeded module settings remain in the database. The operator
can adjust module activation normally after leaving demo mode.
