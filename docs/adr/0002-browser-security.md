# ADR 0002: rotating sessions and separate key management

Status: Accepted

Use short-lived RS256 access tokens in memory and hashed refresh tokens in Secure HttpOnly Strict cookies. Validate live sessions on every authenticated request to support immediate revocation. This adds a database read but avoids stale privilege windows. Lock refresh families in PostgreSQL and treat consumed-token reuse as revocation. Use antiforgery plus exact Origin checks for cookie-authenticated mutations. JWT and Data Protection keys have separate rotation/persistence policies. See security tests and docs/security.md.
