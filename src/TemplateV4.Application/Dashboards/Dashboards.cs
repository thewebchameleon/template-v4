namespace TemplateV4.Application.Dashboards;

public sealed record DashboardCard(Guid Id, string DefinitionId, string Size, string Format, string Metric, string Filter, string Period);
public sealed record DashboardLayout(string Name, string Period, DashboardCard[] Cards);
public sealed record DashboardDto(Guid Id, Guid Version, bool Shared, bool Personalized, DashboardLayout Layout);
public sealed record DashboardState(DashboardDto[] Dashboards, DashboardDto[] Defaults, Guid? StartingDashboardId, bool CanManage, DashboardCardDefinition[] Catalog);
public sealed record SaveDashboard(Guid? Id, Guid? Version, bool Shared, DashboardLayout Layout);
public sealed record DashboardChange(Guid Id, Guid Version, bool Shared = false);
public sealed record DashboardPreference(Guid Id);
public sealed record DashboardCardDefinition(string Id, string Title, string Module, string[] Sizes, string[] Formats, string[] Metrics, string[] Filters, bool DateFilter);
public sealed record DashboardCardQuery(string DefinitionId, string Metric = "count", string Filter = "all", string Period = "all", int Limit = 5);
public sealed record DashboardPoint(string Label, decimal Value);
public sealed record DashboardItem(string Label, string Detail, string Link);
public sealed record DashboardCardData(decimal Value, string Unit, DashboardPoint[] Points, DashboardItem[] Items);

/// <summary>Owners authorize and query their own data. The dashboard host never reads module tables.</summary>
public interface IDashboardCardProvider
{
    IReadOnlyList<DashboardCardDefinition> Definitions { get; }
    Task<bool> Available(Guid actor, string definitionId, CancellationToken ct);
    Task<DashboardCardData> Read(Guid actor, DashboardCardQuery query, DateTimeOffset? since, CancellationToken ct);
}

public interface IDashboards
{
    Task<DashboardState> Read(Guid actor, CancellationToken ct);
    Task<Result<DashboardDto>> Save(Guid actor, SaveDashboard request, CancellationToken ct);
    Task<Result<Unit>> Reset(Guid actor, DashboardChange request, CancellationToken ct);
    Task<Result<Unit>> Delete(Guid actor, DashboardChange request, CancellationToken ct);
    Task<Result<Unit>> SetStarting(Guid actor, DashboardPreference request, CancellationToken ct);
    Task<Result<DashboardCardData>> Card(Guid actor, DashboardCardQuery query, CancellationToken ct);
}
