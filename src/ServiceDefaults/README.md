# templatev4.ServiceDefaults

.NET 10 ASP.NET Core defaults for health endpoints, JSON logs, OpenTelemetry, service discovery and resilient outbound HTTP. Call builder.AddServiceDefaults() and app.MapDefaultEndpoints(). Unsafe HTTP methods are not automatically retried. Configure OTEL_EXPORTER_OTLP_ENDPOINT for your collector; protect health/monitoring endpoints through deployment topology.

HandleHealthProbe supports container liveness checks without a shell. It probes the local HTTP liveness endpoint and sets the process exit code. Application-specific readiness checks and alert routing remain the consuming application's responsibility.
