# ADR 0029: File Storage folders and sharing

Status: Accepted; ownership and quota scope updated by
[ADR 0048](0048-unified-organisation-files.md), and platform/module boundaries updated by
[ADR 0051](0051-platform-core-and-file-library.md).

## Decision

The organisation-wide library supports folders, metadata, recent files, recoverable
trash, user references, and public links. The stable file identity is also the content
object identity. Reserve capacity under the organisation storage lock before writing
bytes, then revalidate admission before publishing. Moves, recursive trash operations,
replacement accounting, and cleanup use the same lock discipline.

Grants expire independently and are checked on each request. Public links grant read
access only: generate 256-bit capabilities, store hashes, keep raw tokens out of URLs
recorded by logs, and validate expiry and revocation every time. User references may
surface an item in “Shared with me” but do not override the organisation permission
required for mutation. Email-addressed shares use the same revocable capability: queue
the protected recipient and action URL through the outbox, and reveal the raw link to
the sharer only when it is created so it can also be copied manually.

Folder deletion moves the folder and live descendants to Trash as one deletion batch so
restoration cannot resurrect content deleted earlier. Purge immediately prevents restore
while usage remains charged until provider deletion succeeds. Retention and privacy
processing continue when the File Storage presentation module is disabled.

Downloads remain private, use attachment disposition, and disable caching unless an
explicit public-link contract applies. Content scanning, previews, bulk archives, and
replacement version history require separate decisions.
