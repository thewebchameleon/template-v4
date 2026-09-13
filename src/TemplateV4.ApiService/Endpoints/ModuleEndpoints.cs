using TemplateV4.Application.Modules;

namespace TemplateV4.ApiService.Endpoints;

public sealed record ModuleOwnership(string Id);
public sealed record CapabilityRequirement(string Id);
public sealed record ModuleLifecycleException(string Reason);

public static class ModuleEndpoints
{
    public static RouteGroupBuilder MapModuleEndpoints(this RouteGroupBuilder group)
    {
        group.MapGet("/capabilities", async (ICapabilities capabilities, CancellationToken ct) => Results.Ok(await capabilities.Read(ct)))
            .WithName("GetCapabilities").Produces<Dictionary<string, bool>>();
        return group;
    }

    public static RouteGroupBuilder OwnedByModule(this RouteGroupBuilder group, string module)
        => group.WithMetadata(new ModuleOwnership(module));

    public static RouteGroupBuilder RequireCapability(this RouteGroupBuilder group, string capability)
        => group.WithMetadata(new CapabilityRequirement(capability)).AddEndpointFilter(Gate(capability));

    public static RouteHandlerBuilder RequireCapability(this RouteHandlerBuilder endpoint, string capability)
        => endpoint.WithMetadata(new CapabilityRequirement(capability)).AddEndpointFilter(Gate(capability));

    public static RouteHandlerBuilder OwnedByModule(this RouteHandlerBuilder endpoint, string module)
        => endpoint.WithMetadata(new ModuleOwnership(module));

    public static RouteHandlerBuilder ContinuesWhenDisabled(this RouteHandlerBuilder endpoint, string module, string reason)
        => endpoint.WithMetadata(new ModuleOwnership(module), new ModuleLifecycleException(reason));

    private static Func<EndpointFilterInvocationContext, EndpointFilterDelegate, ValueTask<object?>> Gate(string capability)
        => async (invocation, next) => await invocation.HttpContext.RequestServices.GetRequiredService<ICapabilities>()
            .Enabled(capability, invocation.HttpContext.RequestAborted) ? await next(invocation) : Results.NotFound();
}
