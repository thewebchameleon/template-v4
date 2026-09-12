# ADR 0026: account profile details and avatars

Status: Accepted

## Decision

AccountService owns self-service profile updates under the account boundary in ADR 0014. The API derives the actor from authentication; profile update requests never select another user or change account permissions, email, credentials or MFA. Updates serialize on the existing user advisory lock, check the profile version, and commit the profile, contact number, avatar and audit event together.

Display name remains required (120 characters). First and last names are optional (100 characters each); blank values become null. Phone numbers reuse Identity storage, accept international format with a leading plus and 7–15 digits, and remain contact details. A changed number clears its verification flag without changing credentials or enabling SMS authentication. Locale comes from the configured culture catalog. Time zones use IANA identifiers shared by .NET and browser Intl. Existing profiles default to UTC; sign-in and refresh carry the preference to the UI.

Avatars are account data in a separate `app.user_avatars` table, independent of the optional Files module and its quotas. The browser accepts JPEG, PNG and WebP up to 5 MiB, centre-crops and converts them to a 256-pixel PNG. The API accepts only structurally bounded non-interlaced PNGs up to 256 by 256 pixels and 256 KiB, strips ancillary metadata and never fetches external image URLs. Profile responses contain a PNG data URL for the authenticated account; the account rail retains a fallback icon. Omitted avatar content preserves the photo; an explicit remove flag deletes it.

Profile audit events omit contact information and image data. Account exports include the names, region preferences, contact number and PNG bytes as base64. Approved erasure clears the new fields and deletes the avatar in the same transaction, regardless of module activation.

## Extension points and verification

Keep organisation-specific details on customer membership. If adding avatar visibility to a directory or public profile, define its authorization and response contract explicitly. Larger image libraries belong to Files; do not remove account-avatar limits to implement them.

The Account page composes the existing Helm fields, select and avatar, retains drafts on failure, confirms navigation away from unsaved edits, and offers explicit reload after a version conflict. Maintain both UI cultures. ProfileTests covers persistence, input rejection, stale versions, actor isolation, CSRF, time-zone refresh, export and erasure against PostgreSQL. Browser interaction and accessibility checks require the repository's E2E permission.
