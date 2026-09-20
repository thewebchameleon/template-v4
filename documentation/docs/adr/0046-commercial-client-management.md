# ADR 0046: private central management and deployment licensing

Status: Superseded by [ADR 0052](0052-provider-assigned-compiled-private-modules.md)

## Decision

The provider composes a private Client Management module into its own foundation
deployment. The module resides in the separate business-modules repository and owns
clients, enrolled deployments, priced offers, purchases, subscriptions, payment receipts, payment-derived licence entitlements,
immutable release metadata and audit records in the `client_management` schema.
Client builds depend only on foundation licensing contracts. Their databases remain
separate from the central installation.

Private descriptors opt into enforcement with `licenseRequired: true`, embedded in
generated host descriptors. Known optional modules can also be restricted through
`Licensing:RequiredModules`. Core services cannot be licensed. The central module
does not require its own license. Administrative recovery and machine verification
remain registered when its runtime switch is disabled.

Enrollment issues distinct application and runner credentials and stores only hashes.
The application reports installed component metadata and refreshes an ECDSA-signed
license every five minutes. A snapshot binds organization, deployment, revision and
time; it remains valid for at most 24 hours. Known entitlement expiry still applies.
The client persists verified snapshots in PostgreSQL and rejects older revisions or
issuance times. Capability evaluation applies license restrictions before resolving
dependent capabilities without changing saved activation preferences.

Use and update rights are separate. Expiry either blocks ordinary operations or
retains the last recorded installed artifact. Continuing operation never grants a
new version. Existing lifecycle exceptions retain administrative export, privacy,
accepted obligations and recovery behavior; module authors must classify these paths
explicitly. There is no generic database export or permission bypass.

Clients receive update notifications and initiate redeployment themselves. There is
no approval workflow. A fresh central preflight verifies the runner credential,
installed baseline, published immutable component metadata, compatibility and rights.
The Linux deployment tool pins the selected release, takes a local exclusive lock,
stops writers, creates and checks a PostgreSQL backup, runs forward migrations and
starts matching image digests. A scheduled invocation retains its original candidate.
Failures retain the execution lock after mutation so operators inspect actual state.
No automatic database restore or module removal is performed.

## Scope and verification

The commercial workflow supports one-time and recurring purchases through the
foundation Payments adapters. Only verified merchant callbacks or reconciliation can
create licence entitlements; browser returns and administrator actions cannot grant
them. Existing manual grants are intentionally removed by the forward migration.
Refunds, key-rotation orchestration and a durable centrally scheduled runner queue are
later extensions. The deployment tool must remain running for a scheduled invocation.

PostgreSQL tests cover enrollment reuse, eligibility, expiry, frozen artifacts,
revocation, release immutability, preflight, restart and replay protection. CLI tests
cover signature binding and image requirements. Browser verification and a complete
VPS migration/recovery drill remain permission-gated and are required before rollout.

See [Deployment](../deployment.md) for operational rules and
[Modules](../modules.md) for private-module boundaries.
