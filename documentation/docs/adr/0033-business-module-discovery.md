# ADR 0033: build-time business module discovery

Status: Accepted

The include-every-module policy is superseded by
[ADR 0034](0034-private-client-module-composition.md), which requires an explicit client build allowlist.

Supersedes the manual host attachment convention in ADR 0032. The user approved
automatic discovery with new modules remaining disabled in Administration.

Hosts discover direct `business-modules/*/module.json` descriptors. MSBuild evaluates
conventional project references before restore; a Node generator validates the combined
catalog and emits typed registration per executable host. Angular generates static
feature imports before start/build. Foundation packages contain no business references.

Descriptors own API configure/map, infrastructure service registration and frontend
feature entry points. Host composition makes discovered modules deployment-available;
the existing Migrator seeds missing runtime rows disabled and preserves existing rows.
Configuration can explicitly restrict deployment availability. Runtime activation,
dependency checks, authorization and accepted-obligation gates are unchanged.

Adding/removing trusted source requires rebuilding and restarting. Removing a module
removes generated registrations while retaining its database history. Published hosts
do not scan source folders or hot-load assemblies. Node is a build prerequisite for
source hosts, included in Docker build stages only. Package consumers may still compose
foundation hosts explicitly or adopt the source-owned discovery tooling.

See [the discovery contract](../business-modules.md#automatic-discovery-contract).
