# ADR 0053: Editable dashboards and module-owned card providers

Status: Accepted

Core owns dashboard persistence and editing. Modules contribute predefined cards
through Application's `IDashboardCardProvider` and explicit module-owned
registration. Providers own availability, authorization, aggregation, and record
links; the dashboard host has no business-module table queries.

Shared defaults, personalizations, and private dashboards use one persisted layout
format. Personalizations are independent snapshots until reset. Deleting a shared
source atomically detaches snapshots into private dashboards. Account preferences
choose the starting dashboard. Versions prevent lost updates and a transaction
lock serializes dashboard mutations. Actor locks coordinate account erasure.

Card instances have independent IDs and configuration. Definitions separately
declare sizes and formats. Cards inherit or override rolling date filters.
Every card-data request checks authorization and capabilities. Unavailable cards
retain configuration and return after access is restored.

Modules can add cards without changing a central module switch. The UI renders
predefined data shapes rather than user-authored queries or HTML. Personal layouts
participate in account export/erasure, and existing migrations remain permanent.
See [editable dashboards](../dashboards.md) for the workflow and extension guide.
