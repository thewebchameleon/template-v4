# Object storage

[SeaweedFS](https://github.com/seaweedfs/seaweedfs) is the recommended free, open-source S3 server. It uses Apache-2.0, provides a compact single-node deployment and supports replicated clusters. Infrastructure owns the AWS S3 SDK; Domain and Application do not reference it. Hosting and disks are still operator costs.

## Local development

Aspire and `compose.yaml` run `chrislusf/seaweedfs:4.45` with `weed mini`, a durable volume and the `templatev4` bucket. Compose exposes S3 only on `127.0.0.1:8333`. The explicit development credentials are disposable examples; they must never be used in production. API and Worker receive the same endpoint and credentials. Browser requests go through the application, so storage needs no browser CORS configuration.

For development without containers, set `Storage:Provider=Local` and an absolute `Storage:Path`. All replicas must see the same durable filesystem if using this provider outside development.

## Self-hosted production

`compose.storage.yaml` supplies a standalone SeaweedFS deployment with persisted data and credential configuration from a secret file. On Coolify/Easypanel, route a dedicated HTTPS origin to port 8333 using a trusted TLS proxy. Keep other SeaweedFS ports private. Preserve request host/path when proxying S3 signatures. No bucket is public. Use a dedicated app key scoped to `Read:templatev4`, `Write:templatev4` and `List:templatev4`; keep a separate provisioning administrator key.

Create `${SECRETS_DIR}/seaweedfs_s3.json` using the upstream S3 IAM format:

```json
{"identities":[{"name":"provisioning","credentials":[{"accessKey":"REPLACE_ADMIN_KEY","secretKey":"REPLACE_ADMIN_SECRET"}],"actions":["Admin","Read","Write","List"]},{"name":"templatev4","credentials":[{"accessKey":"REPLACE_APP_KEY","secretKey":"REPLACE_APP_SECRET"}],"actions":["Read:templatev4","Write:templatev4","List:templatev4"]}]}
```

Run `docker compose -f compose.storage.yaml up -d` after provisioning the file and TLS origin. The mini command creates the bucket; use the provisioning key to verify it, then give only the app key to API/Worker. Verify the exact scoped permissions with upload/read/delete checks against your selected S3 implementation.

The production app Compose file requires:

| Input | Purpose |
| --- | --- |
| `S3_ENDPOINT` | HTTPS S3 origin |
| `S3_BUCKET` | Existing private bucket; defaults to `templatev4` |
| `S3_REGION` | Signing region; defaults to `us-east-1` |
| `${SECRETS_DIR}/s3_access_key` | App access key |
| `${SECRETS_DIR}/s3_secret_key` | App secret key |

API/Worker load keys through key-per-file configuration. The migrator does not instantiate the storage provider. Production rejects plaintext HTTP S3 endpoints. The SDK uses path-style requests, required checksums and conditional object creation, with a bounded timeout and no automatic write retries. Object keys are GUIDs; filenames stay in PostgreSQL. Custom providers must implement `Write`, `Read` and idempotent `Delete`. Retention cleanup makes repeated deletes safe after crashes.

A single-node deployment is a practical baseline, not high availability. For production resilience, follow [SeaweedFS replication guidance](https://github.com/seaweedfs/seaweedfs/wiki/Replication) across separate hosts and maintain encrypted off-host backups of data and filer metadata. Do not treat replicas on the same machine as disaster recovery. Test restoring both database metadata and the referenced objects before claiming recovery targets.

The file library accepts all file types and always downloads them as attachments; it does not scan for malware. Add scanning/quarantine before setting `StoredFile.Ready` if the product's threat model requires it. File sharing, public links and automatic bucket creation by the app are deliberately separate extension points.

## File library extension points

[ADR 0021](adr/0021-user-file-library.md) defines folder ownership and administrator quota management. Folder metadata stays in PostgreSQL; object keys never contain user names or folder paths. `FileService.MaxUploadBytes` defines the 20 MiB cap enforced while reading the request and advertised to the UI. Keep reverse-proxy body limits aligned when changing it. The old `Storage:QuotaBytes` configuration is replaced by database settings: configure the default through Administration → File storage and individual overrides through user details. Run the migrator before restarting API and Worker. Existing files migrate into the root folder.
