# My Files

My Files is the personal library at `/my-files`, with an expandable folder submenu and the shared server-paginated datatable. The module identifier and feature flag are `my-files`. Organisation files retain their own routes and names; they still depend on this storage capability. See [the upgrade instructions](upgrades.md#my-files-upgrade) before updating an existing deployment.

## Navigation and metadata

The submenu contains My Files, Important, Shared with me, Recent, Starred and Trash. My Files home lists root entries and shows the six most recently created or updated files and folders across the library in a wrapping grid. Other group homes show matching entries across folders. Search, sorting and pagination live in the URL. File icons and quota categories use filename extensions; unknown formats receive the neutral fallback. Bytes remain arbitrary downloads served as attachments with `application/octet-stream` and `nosniff`.

Owners create folders and move files/folders within their library. Cyclic and cross-owner moves are rejected. Name, description (4,000 characters) and comma-separated tags (1,000 characters) are editable. Important and Starred are independent entry flags. They apply to files and folders and can both be enabled. Uploads, metadata edits, moves and restores update the recent ordering; downloads do not.

## Sharing

An owner can share with an existing active user by email. Viewer permits metadata reading and downloads. Editor additionally permits metadata updates. Ownership is retained: only owners move/delete entries or manage sharing. Folder sharing is inherited by current and future descendants. Moving an entry changes inherited access according to its new ancestors.

Public links permit anonymous metadata reading, folder browsing and individual downloads. They cannot grant anonymous editing. The default expiry in the UI is seven days; owners may set a local date/time or leave expiry blank. Each link can be revoked immediately. A cryptographically random token is returned once; only its SHA-256 hash is stored. The browser link carries the token in a fragment and sends it to the API in `X-File-Share`, with no token in API URLs. Do not log that header, raw link or token. Public responses are not cached and set a no-referrer policy. Revocation cannot recall bytes already downloaded.

## Quota and Trash

The account-wide segmented bar groups current bytes into Images, Documents/PDFs, Spreadsheets, Presentations, Video, Audio, Archives and Other. Separate segments account for Trash and unfinished uploads. The legend reports bytes and counts. Remaining space is clamped to zero when a quota is reduced below usage. Shared content uses its owner's quota. Administrators configure the default quota, maximum upload file size and demo expiry under **Administration → File storage**. The default-quota slider starts at 50 MB, using 5 MB increments through 100 MB, 10 MB through 200 MB, 50 MB through 500 MB, 100 MB through 5,000 MB, 1,000 MB through 20,000 MB, then No limit. Slider labels switch from MB to decimal GB at 1,000 MB. The upload-size slider retains its 5–1,000 MB stepped range and defaults to 20 MB. It also applies to organisation files. Individual user overrides remain numeric from 0 through 100 GiB, where zero blocks storage; clearing an override restores inheritance from the default quota.

Reservations, current files and retained deleted content count exactly once. PostgreSQL owner locks serialize quota reservations, file movement, recursive deletion/restoration and purge work. Interrupted uploads remain reserved until cleanup reconciles them.

Folders can be deleted only after all live direct files and subfolders have been deleted, including unfinished uploads. Trashed contents do not block deleting the empty folder. Deletion revokes shares and records a deletion batch. Restore restores that batch while preserving entries trashed earlier; if the original parent is unavailable, the restored root moves to the library root. Trash defaults to a 30-day retention period. Delete permanently and Empty Trash make entries unavailable for restoration immediately and request Worker cleanup. Storage is released only after object deletion succeeds. File metadata is also covered by retention and privacy erasure; cleanup continues when the module is disabled.

## Extension and validation

`MyFilesService` owns library and sharing use cases. HTTP adapters live in `MyFilesEndpoints`; regenerate OpenAPI and the Angular client after contract changes. New file categories should update `Category`, the localized legend and semantic `--file-*` colors together. The historical `files` database schema and generic file provider remain shared with organisation storage.

See [ADR 0029](adr/0029-my-files-library.md) for the architecture decision. Browser/E2E and accessibility checks require explicit permission under repository guidance.

My Files submenu groups are always expanded; nested folders start expanded and may be collapsed. Folders with zero direct items are hidden outside the My Files group. Each group displays its unfiltered file count, excluding folders; each folder badge likewise counts only its direct files. Folder disclosure still reflects child files and subfolders, and leaf folders have no disclosure caret. Owners can right-click a live folder or press Shift+F10 to create a subfolder or delete an empty folder.


## File views and uploads

List is the default view; the browser remembers the List/Grid choice. Grid uses compact cards with the same server search, sorting and pagination. Phosphor duotone icons from `@ng-icons/phosphor-icons` map known extensions to specific icons, then recognized categories to type icons, with the same-set generic file icon for unknown formats. These icons are shared by the library, recent files, submenu and public file lists.

Opening a file shows a right drawer with its name, type, size, content type, location, created/updated dates, description, tags, flags and effective permission. Download, metadata editing, move, share and deletion respect existing permissions. Rows and cards expose only Download and Delete where permitted; Restore and Delete permanently are in the details drawer. Folders still navigate; the current folder's details button opens its drawer.

Both the header and upload card open a multiple-file picker and upload immediately after selection. Dropping multiple files also starts a sequential batch. Progress fills the inner card behind the opaque dropzone with animated diagonal stripes; reduced-motion preferences disable animation.

During uploads, the dropzone displays the current filename, batch position and overall progress. Browsing and dropping are disabled while Cancel remains available. Cancel aborts the active browser request and stops the remaining batch, retaining any files already committed by the server. The library refreshes after success, failure or cancellation. Failed files are listed with a Retry failed files action; successful files are not retried. Hover retains the dashed border in the theme's primary color.

Administrators can enable **Slow upload mode** under Modules → My Files. It defaults to off and simulates a random 4–10-second duration per file in the browser, including the progress display. Actual transfers run normally; slower real requests must still finish before success is shown. This development aid is application-wide, takes effect when clients reload the library, and uses the existing versioned, audited module settings. Apply the generated MyFilesSlowUploadMode migration before running the updated API.

Owners can drag live submenu folders onto an owned folder or onto My Files to move to the root. Siblings remain alphabetical. Invalid, unchanged, self, descendant and non-owner targets are rejected before sending the request, and the existing move API revalidates ownership and cycles. The context menu's Move action provides the same destination selection for keyboard/touch use. Moves refresh the submenu and active library.

In list and grid views, owners can drag files or folders onto an owned folder to move them. When browsing inside a folder, a fixed **Parent folder** item with a back-arrow icon returns to the immediate parent and also accepts dropped files or folders. If the destination already contains the same name, the moved item is renamed with the first available numbered suffix while preserving a file extension.
