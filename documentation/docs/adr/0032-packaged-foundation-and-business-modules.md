# ADR 0032: packaged foundation and explicitly composed business modules

Status: Accepted

The manual host attachment convention below is superseded by
[ADR 0033](0033-business-module-discovery.md) for repository source builds.

The foundation is a modular monolith distributed as coordinated Domain, Application,
Infrastructure and HTTP NuGet packages, alongside SharedKernel and ServiceDefaults.
Executable hosts own configuration and explicit composition. Domain and SharedKernel
remain BCL-only; Application continues to reference only Domain and SharedKernel.
Public business integration contracts belong to Application. A business application
can depend on those contracts without introducing a reverse dependency.

Business modules live under `business-modules/`. Each owns its domain, application,
provider, HTTP and frontend assemblies. Hosts explicitly contribute descriptors,
services, endpoints and migration contributors. The existing catalog validates the
combined graph. Foundation identifiers and clients are generated from foundation
inputs; business identifiers and clients have separate generator-owned outputs.

Foundation persistence retains every existing migration and the `app.migrations`
history. New foundation records use module schemas. Business persistence owns a
separate context, schema and migration history; its model is independent of runtime
activation. The explicit migrator applies foundation before ordered contributors.
Removing a contributor retains its database tables and history. No cross-module
foreign key may reference business-owned tables from foundation tables.

Operations within one context commit state and allowlisted audit together. Modules
use public organisation-aware operations for references and integrations. A typed
commercial origin, unique within an organisation, supplies durable idempotency for
invoice creation. A business workflow persists its intent before calling Invoicing;
retrying the same origin discovers the committed invoice after interrupted delivery.
Financial documents retain customer and issuer snapshots and do not require live CRM
availability to settle existing obligations. Membership checks remain mandatory.

Package versions are coordinated with schema changes. Application branding,
configuration, host registrations and business code remain source-owned. Package
updates never rewrite them. Publishing requires an explicitly configured GitHub
owner and credentials; local artifact consumers must work without registry access.

Physical removal is an explicit host change, separate from runtime disablement.
Production removal requires an inventory of outstanding work, document references,
exports and retention obligations. Neither disabling nor removing code drops data.
