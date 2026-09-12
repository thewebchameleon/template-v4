# ADR 0021: user file library and storage quotas

Status: Accepted

## Context

Every user needs a file library backed by the configured object storage. Administrators need to browse and download user files and configure a default storage allowance with individual overrides. This updates the file-specific policies in ADRs 0015 and 0016.

## Decision

- Enable the existing files feature by default. The optional module and server feature gate still apply to all personal and administrative file endpoints. Minimal deployments can disable the module.
- Personal endpoints derive the owner from the authenticated actor. Separate administrative endpoints require `settings.manage`, including browsing, downloads and quota changes. Delegating this permission also delegates access to user files. Administrative downloads and quota changes are audited without names or payloads. Administrators do not get owner mutation operations through these endpoints.
- Represent folders as zero-byte metadata entries with an owner and optional parent. A composite foreign key prevents cross-owner parent links; transactions validate that a live parent is a folder. New entries and folder deletion share the owner advisory lock, including pending upload reservations. Empty folders can be deleted; nested entries must be deleted first. Renames never change object keys. Existing files belong to the root after migration. Folder movement, duplicate-name restrictions and public sharing are separate extensions.
- Accept arbitrary file bytes and extensions, including empty files, with a bounded 20 MiB upload read. Keep attachment disposition, octet-stream content type, nosniff and private object storage. This does not provide previews or malware scanning. Scan/quarantine before marking a reservation ready if adding scanning later.
- Store file metadata and the versioned default quota in the Files module's PostgreSQL schema. The default is initially 100 MiB; a nullable override remains on each Identity user because account administration owns that setting. Null follows the current default for existing and future users. Administrators edit the default under File storage, or the override through user details. Bounds are zero through 100 GiB; zero blocks uploads. UI MB units retain the existing binary convention (1 MB = 1,048,576 bytes). The old configuration-only `Storage:QuotaBytes` setting is superseded.
- Quota includes live files, unfinished reservations and retained deleted files across every folder. Reserve bytes under the owner lock before writing to S3. An override change takes that same lock. A reduction never removes files; reservations already accepted may finish, and subsequent reservations must fit. Global default changes use optimistic version checks to prevent lost edits.
- Preserve retention and privacy behavior: access ends on deletion; object purge releases the retained bytes. Worker cleanup skips storage calls for folders and anonymises their names. Privacy exports include folder relationships; account deletion tombstones both files and folders.
- Reuse the shared table, card, pager, dialogs and URL query state. Search is scoped to the current folder, debounced 300 ms and resets pagination. Folder navigation clears search. Admin browsing reuses the file page with owner actions hidden and protected server endpoints. Both cultures describe administrator access and quota retention.

## Consequences and extension points

Run the new migration before restarting workloads. Existing file content is untouched. Existing deployments that used a larger configuration quota must set the required database default after migration; files remain readable while over quota. Baseline users now see Files automatically unless deployment feature overrides disable it.

The existing S3/SeaweedFS integration remains unchanged. Extend `FileService` for folder movement or scanning while retaining ownership validation, bounded reads, durable reservations and lock ordering. Add new file HTTP adapters to `FileEndpoints`; regenerate the OpenAPI contract and Angular client. PostgreSQL integration coverage must exercise cross-owner access, folder lifecycle, arbitrary bytes, quota inheritance and overrides, reductions and concurrent reservation enforcement. Browser accessibility/E2E checks require explicit user permission.
