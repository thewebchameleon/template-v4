# External API

Create a credential from **Administration → API Keys**. Give each external application
its own key, select only the required scopes, copy the one-time secret, and store it in
that application's secret manager. Send it on every request:

```http
Authorization: ApiKey tv4_<id>.<secret>
```

The initial unversioned CMS surface exposes published content only:

| Method | Path | Scope |
| --- | --- | --- |
| `GET` | `/api/external/cms/articles?pageNumber=1&pageSize=10` | `cms.articles.read` |
| `GET` | `/api/external/cms/articles/{slug}` | `cms.articles.read` |
| `GET` | `/api/external/cms/sections` | `cms.sections.read` |

Valid article page sizes are 5, 10, 25 and 50. Disabled CMS capability returns 404.
Missing, invalid, expired or revoked credentials return 401; a valid key without the
required scope returns 403. Key secrets cannot be recovered. Rotate by creating and
deploying a replacement before revoking the old key. The administration page shows
last use and aggregate authenticated request count; Audit History records creation and
revocation without recording the secret.
