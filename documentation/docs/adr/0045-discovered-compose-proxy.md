# ADR 0045: Discover the Compose reverse proxy through DNS

Status: Accepted

## Context

Fixed Web addresses required operators to choose a subnet and proxy IP for every
Compose deployment. The API used the fixed IP to trust forwarded HTTPS and client
address headers. Docker can allocate these networks and addresses automatically.

## Decision

Compose sets `ReverseProxy__Address` to its private `web` service name and leaves
network allocation to Docker. The HTTP host accepts an IP literal or resolves the
configured DNS name, trusting only those exact addresses and one forwarded hop.
No loopback or network-wide trust is added implicitly.

Discovery happens only for forwarded requests, so API health and startup do not
depend on Web starting first. A serialized lookup has a two-second timeout and
caches its result for ten seconds. Refresh publishes an immutable middleware
instance. DNS errors or empty answers remove previous trust until a later lookup
succeeds; an empty list never enables unrestricted forwarding.

## Consequences

Operators no longer supply subnet or Web IP environment variables. Web address
changes can take up to ten seconds to be recognized; requests during discovery
failure do not receive forwarded scheme or client address values. DNS and private
network membership remain deployment trust boundaries. Keep API ports private and
have the outer ingress replace untrusted forwarding headers.

Existing IP-based deployments remain supported. Other orchestrators can set the
same configuration key to their trusted immediate proxy address or internal DNS
name. The HTTP middleware tests cover discovery recovery and proxy isolation.
