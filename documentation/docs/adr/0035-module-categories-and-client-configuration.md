# ADR 0035: module categories and client configuration

Status: Accepted

Extends [ADR 0034](0034-private-client-module-composition.md). The catalog explicitly
distinguishes `core`, `foundation` and `private`. Core includes identity, audit recording,
delivery, maintenance, operations, audit history and organisations. These retain existing
configuration and permissions. Core cannot expose runtime module activation switches.
Optional foundation modules are My Files, support, CRM, invoicing and SaaS billing.
Foundation features remain compiled; private module exclusion remains physical.

Ignored `client-modules.json` holds schemaVersion 1, a `foundation` map of optional
foundation boolean settings and a `privateModules` list. The private selector updates
only that list. Generated `business-modules.enabled` remains MSBuild's evaluation-time
input, checked for consistency before compilation/restore. Run discovery after manual
edits; stale selection fails closed. Frontend hooks and Docker regenerate before builds.

Hosts compile client foundation settings into a pre-registration configuration callback.
Explicit choices override presets; deployment settings may restrict them further but
cannot enable client-excluded modules. Dependencies are validated at generation and
startup. No client settings are embedded in reusable foundation packages.

Administration returns only deployment-available modules with supported runtime controls.
Unavailable modules retain their activation rows and data; re-inclusion restores access
subject to the retained activation and normal authorization. No migrations are changed,
no database schemas are dropped, and no new runtime switches are introduced.

See the [integration guide](../business-modules.md) for use and upgrade instructions.
