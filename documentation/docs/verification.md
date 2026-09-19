# Verification

Choose the smallest checks relevant to the change. Test execution, including browser
E2E, requires explicit user permission under the repository working agreement.

The broad local suite is:

```powershell
node tools/verify.mjs
```

Focused commands:

| Change | Check |
| --- | --- |
| Framework, module, or capability metadata | `node tools/framework.mjs validate` and `node --test tools/cli.test.mjs tools/capabilities.test.mjs` |
| OpenAPI contract | Export the owning document, run `node tools/framework.mjs clients`, then check the generated diff |
| Angular UI | Run the workspace lint/build or focused browser-free test configured by the project |
| Backend behavior | Run the smallest matching test project/filter; database tests require a disposable database |
| Documentation | `npm run validate --prefix documentation` and `npm run build --prefix documentation` |
| Compose | Render the production configuration, then use the repository smoke script only with explicit permission |

CI runs browser-free frontend tests, backend tests, documentation checks, formatting,
and dependency audits. It does not prove browser accessibility, external provider
compatibility, public TLS, SMTP delivery, backup recovery, or production readiness.

Never point integration tests or restore tools at a retained application database.
Never edit generated clients or EF-generated migration files to make a check pass; fix
the owning source and regenerate them.
