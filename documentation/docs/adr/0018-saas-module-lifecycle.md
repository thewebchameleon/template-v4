# ADR 0018: configurable modules and vertical slices

Status: Accepted; initial module foundation implemented.

## Context

The feature inventory and individual runtime flags do not define which deployment capabilities exist or how disabled modules retain responsibility for accepted work. The starter must support a configurable, comprehensive, general-purpose SaaS without compromising its architecture boundaries.

## Decision

Use a modular monolith with feature ownership across existing layers. Embed a versioned-in-source JSON module catalog in Infrastructure and consume the same catalog in the CLI. Descriptors declare identifiers, required/default activation and dependencies. Immutable startup resolution rejects unknown names, invalid booleans, dependency cycles, disabled prerequisites and disabled required modules. Presets supply defaults; explicit deployment settings override them.

Distinguish deployment modules, runtime feature settings and customer entitlements. None replace authorization. Hosts deploy together with matching activation settings. Frontend capability discovery contains only boolean state and fails closed. Direct API and route access are gated independently of navigation.

The initial optional modules are files, maintenance, operations and audit history. Identity, audit recording and durable delivery remain required foundations. Other existing features retain their current behavior until explicitly modularized. Disabling entry points does not delete schema or data. Retention, security audit writes and accepted jobs/messages continue; new maintenance cron dispatch is suppressed and its persisted daily trigger is unscheduled. Future billing callbacks must similarly remain available for accepted payment obligations.

Persistent modules with substantial owned data use a module-named PostgreSQL schema while sharing the framework database, EF context and migration stream. Files owns `files.files` and `files.file_storage_settings`; its quota override remains on the Identity user because it participates in account administration. Support owns its ticket, category, message and attachment tables in `support`. Cross-cutting capabilities keep their existing schemas: delivery uses `messaging`, audit recording uses `audit`, and platform configuration uses `app`. Capability modules such as Operations and Audit History read data owned by those foundations and do not receive duplicate schemas. New module code must not query another module's tables directly; it uses explicit Application contracts or versioned events.

## Consequences

No hot-plug assembly discovery, runtime service location, separate module deployment, database or `DbContext` is introduced. PostgreSQL schemas communicate ownership but do not provide an application boundary by themselves. Module settings require restart. No conditional EF models or automatic destructive rollback. A module scaffold remains disabled and unregistered until its implementation, dependencies, permissions, UI, cleanup and contracts have been reviewed.

## Enforcement and extension points

CLI/CI validate every preset. Hosts validate the embedded catalog on startup. Application validates the graph without framework dependencies. Endpoint gates, feature-flag upper bounds and frontend guards enforce activation. Focused tests cover invalid graphs, precedence and denied entry points. Persistence or delivery changes require real PostgreSQL coverage; browser tests require explicit permission. See [module extension guide](../saas-modules.md).
