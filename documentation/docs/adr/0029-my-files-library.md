# ADR 0029: My Files storage and sharing

Status: Accepted

## Context

The personal file library needs folder navigation, metadata, useful file groups, recoverable deletion, public links and permission-based collaboration. These extend the folder and private-download conventions in [ADR 0021](0021-user-file-library.md).

## Decision

Rename the personal module and API to `my-files`, while retaining the existing physical `files` schema and organization file routes. Migrate runtime activation by updating its key, preserving disabled state and concurrency version. Redirect old browser routes; regenerate consumers for renamed API paths and operation identifiers.

Use the file identity as its content-object identity. Reserve each upload under the owner quota lock before writing bytes, then revalidate access before publishing it. The same lock protects moves, recursive Trash operations and cleanup. Failed or interrupted provider work remains durably accounted for and is reconciled by retention.

Store independently expiring grants on entries. Effective permission comes from the owner or an active grant on the entry or a live ancestor. Viewer reads/downloads; Editor additionally updates metadata; ownership controls destructive operations and sharing. Public links grant Viewer only. Generate 256-bit capabilities, store hashes, keep raw tokens out of API paths and logs, and validate expiry/revocation on every request. Existing-user sharing records a grant and does not send an email.

Folder deletion requires no live direct children and checks this under the owner lock. Trash records deletion batches so restoring a folder does not resurrect content trashed earlier. Purge requests immediately prevent restoration while retaining quota until storage removal succeeds. Current files, Trash and reservations form disjoint accounting categories. Shared recipients do not pay quota for content they do not own. Privacy export and erasure include the new metadata and grant records without exposing tokens.

Use the existing resizable submenu for folder disclosures and predefined groups, with deferred component loading to retain the initial-bundle budget. Continue using the shared datatable, URL query state, dialogs, semantic tokens and both cultures. The recent strip is scoped independently of table pagination.

## Consequences

The deployment override names and generated personal API clients change; apply [upgrade instructions](../upgrades.md#my-files-upgrade) before rollout. Space release can lag a purge request until Worker cleanup succeeds. Future content replacement, content scanning, previews, bulk archive downloads and ownership transfer require separate use cases. [My Files documentation](../my-files.md) records supported behavior and extension points.

My Files submenu groups are always expanded; nested folders start expanded and may be collapsed. Folders with zero direct items are hidden outside the My Files group. Each group and folder badge displays a file-only count; folder disclosure and empty-folder safeguards continue to account for child files and subfolders. Leaf folders have no disclosure caret. Owners can right-click a live folder or press Shift+F10 to create a subfolder or delete an empty folder.
