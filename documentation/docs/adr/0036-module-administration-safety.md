# ADR 0036: safe module administration and retained access

Status: Accepted; storage lifecycle clarified by
[ADR 0051](0051-platform-core-and-file-library.md).

## Decision

Activation is admission control. Requests admitted before disablement may finish;
accepted financial/provider obligations, delivery, privacy, retention, and cleanup
continue. Disabling a presentation module does not delete or make retained data
unrecoverable.

HTTP resolves one capability snapshot on first use and shares it for that request. The
next request reads committed state again. Background work evaluates fresh state at each
admission boundary. Permissions and actor/account status remain independent checks.

Administration derives supported switches and blockers from the catalog. Missing
runtime rows are incomplete setup, never silently seeded state. Both UI and server block
invalid dependency transitions; the server remains authoritative. Conflicts reload
authoritative versions without discarding the user's draft.

Typed module settings use independent editors and versions. Destructive recovery or
retention settings remain reachable to authorized administrators when ordinary module
admission is off. File-storage activation controls only the library presentation; core
storage settings, quota enforcement, public links, attachments, and cleanup remain
available according to their own permissions and contracts.

Financial reads, settlement, callbacks, reconciliation, and cancellation remain
available for retained obligations even when new-work navigation is hidden. Do not hold
activation locks throughout ordinary operations or add cross-module cancellation.
