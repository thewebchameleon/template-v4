using System.Diagnostics;
using System.Security.Claims;
using templatev4.Application;

namespace templatev4.API;

public sealed class HttpExecutionContext(IHttpContextAccessor accessor) : IExecutionContext
{
    public Guid? ActorId => Guid.TryParse(accessor.HttpContext?.User.FindFirstValue("sub"), out var id) ? id : null;
    public IReadOnlySet<string> Permissions => accessor.HttpContext?.User.FindAll("permission").Select(x => x.Value).ToHashSet() ?? [];
    public string Culture => System.Globalization.CultureInfo.CurrentUICulture.Name;
    public string? TenantId => null;
    public string? TraceParent => Activity.Current?.Id;
}
