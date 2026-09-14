using System.Diagnostics;
using System.Security.Claims;
using TemplateV4.Application;

namespace TemplateV4.ApiService;

public sealed class HttpExecutionContext(IHttpContextAccessor accessor) : IExecutionContext
{
    public Guid? ActorId => Guid.TryParse(accessor.HttpContext?.User.FindFirstValue("sub"), out var id) ? id : null;
    public IReadOnlySet<string> Permissions => accessor.HttpContext?.User.FindAll("permission").Select(x => x.Value).ToHashSet() ?? [];
    public string Culture => System.Globalization.CultureInfo.CurrentUICulture.Name;
    // HTTP capability discovery is application-wide. Organisation IDs are not trusted tenant contexts.
    // Features:<id>:Tenants overrides apply only to explicitly supplied non-HTTP execution contexts.
    public string? TenantId => null;
    public string? TraceParent => Activity.Current?.Id;
}
