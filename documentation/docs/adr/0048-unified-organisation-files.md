# ADR 0048: one organisation file library

Status: Accepted

## Decision

The single organisation has one **File Storage** page using the existing folder, metadata,
sharing, recent-files and trash interface. Former personal files are organisation
files visible to all enabled, confirmed, approved users. The existing
`organisation.files.manage` permission authorizes upload, folder changes, metadata,
sharing and trash operations. Uploader identity is nullable attribution, not access
control. User shares remain references in Shared with me; they do not override
organisation write permissions. Public links remain token-scoped read access.

Organisation attachment operations and File Storage use the same stored-file table and
object keys. A single quota includes every user's uploads, reservations and retained
trash. Subscription entitlements take precedence over the configured organisation
quota. Per-user quota overrides and administrative user-library endpoints no longer
apply. Existing module and attachment capability gates remain authoritative.

## Migration and lifecycle

The forward `UnifiedFileLibrary` migration copies organisation rows into the file
library with their IDs and object keys intact, preserving record attachment links.
Personal rows and folder hierarchies remain intact. Folder parent constraints now
permit moves across former uploader boundaries. The migration fails on ID collisions
rather than silently dropping records. Back up the database before upgrading; the
merge cannot be reversed automatically after users have changed shared folders.
Stop API and Worker workloads while applying the migration, then restart both.

Privacy erasure removes uploader attribution and recipient shares but does not
delete organisation documents or public links. Retention uses the persisted object
key and the same library lock as folder changes. The migration disables demo expiry to avoid newly scheduling deletion of imported
organisation documents. Administrators can explicitly enable it again for the
merged library. Already-requested purges continue.

## Verification

`UnifiedFileLibraryTests` migrates a disposable PostgreSQL database containing both
old file types, checks preserved download keys, role-based access, cross-uploader
folders, trash, shared quota and token boundaries. Set
`TEMPLATEV4_FILES_TEST_DATABASE` to an empty disposable database to run it.
