# ADR 0048: one organisation file library

Status: Accepted; platform/module boundary updated by
[ADR 0051](0051-platform-core-and-file-library.md).

## Decision

The deployment has one organisation-wide file library. All enabled, confirmed, approved
users can read organisation files; `organisation.files.manage` authorizes library
mutation. Uploader identity is nullable attribution, not ownership. User references may
surface entries but do not override organisation mutation permissions. Public links are
token-scoped read access.

Every persisted upload uses the core storage admission contract and one organisation
lock: library files, reservations, retained trash, business attachments, Support
attachments, avatars, and retained organisation logos. Replacement accounts for the
size delta. Usage is released only when the owning workflow deletes stored bytes.
Concurrent workflows therefore cannot overbook the allowance.

A currently valid purchased storage allowance overrides the configured core quota.
Without one, the configured quota applies. Reducing an allowance never deletes data;
reads and cleanup continue while new consumption is denied. Per-user quotas and
administrative user-library endpoints do not exist.

The `file-storage` module controls authenticated library navigation and pages only. Core
storage persistence, quota administration, public links, privacy, retention, and
attachments remain available under their own capabilities and permissions.

## Migration and lifecycle

The forward merge preserved file IDs and object keys and failed on collisions rather
than dropping records. Migration history remains permanent. Privacy erasure removes
uploader and sharer attribution and recipient references but does not delete organisation
documents or public links. Retention uses persisted object keys and the organisation lock.

New upload workflows must use storage admission and contribute their bytes to usage.
Folder, sharing, trash, and public-capability behavior is defined by
[ADR 0029](0029-file-storage-library.md).
