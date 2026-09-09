# ADR 0017: SignalR notification invalidation

Status: Accepted

## Context

Notifications are created by both API transactions and BackgroundWorker jobs. The unread badge previously used visible-tab polling, so a maintenance-completion notification created by the Worker could remain invisible for up to a minute. Broadcasting only from API request handlers would miss Worker writes and any future notification producer.

## Decision

- PostgreSQL owns the cross-process change signal. Triggers on notification insert, `ReadAt` update and delete call transactional `pg_notify` with only the affected user identifier. PostgreSQL emits the notification after commit, so rolled-back work is never announced. Duplicate channel/payload notifications in one transaction are coalesced by PostgreSQL.
- Every API replica listens on a dedicated connection and relays a generic `notificationsChanged` message to that user's authenticated SignalR group. Each replica receives the PostgreSQL notification, so connected clients do not require a separate SignalR backplane.
- The hub accepts no client commands. JWT query-string tokens are accepted only on the hub path for WebSocket compatibility, and normal session validation still applies. No notification content crosses the database channel or SignalR event.
- Angular keeps one actor-scoped SignalR connection. A change invalidates and reloads the unread summary, an already-loaded drawer, and the active inbox. Reconnection also invalidates those views to cover events missed during an outage. The existing bounded visible-tab poll remains a degraded-mode fallback.
- Same-origin `/api` proxies must support WebSocket upgrade headers. Cross-origin deployments must allow the API origin in CORS and `connect-src` as already required for API traffic.

## Consequences and extension points

Run the DatabaseMigrator before deploying the API and Worker version that expects real-time invalidation. API replicas need a persistent PostgreSQL connection in addition to their normal pool. Listener failures retry with bounded backoff; clients continue to poll if real-time delivery is unavailable.

Create notifications through the existing transactional persistence paths. New producers do not call SignalR directly and must not publish notification text or payloads. If notification state gains another mutable field that affects a live view, extend the database trigger and keep the client event content-free.

