using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using TemplateV4.Application.Dashboards;
using TemplateV4.Infrastructure.Persistence;

namespace TemplateV4.Infrastructure.Dashboards;

public sealed class DashboardStore(FrameworkDb db, DashboardAccess access, IEnumerable<IDashboardCardProvider> providers, TimeProvider time) : IDashboards
{
    private readonly IDashboardCardProvider[] owners = providers.ToArray();
    private IQueryable<DashboardRow> Rows => db.Set<DashboardRow>();
    private static DashboardDto Dto(DashboardRow row) => new(row.SourceId ?? row.Id, row.Version, row.OwnerId is null || row.SourceId is not null, row.SourceId is not null, JsonSerializer.Deserialize<DashboardLayout>(row.Layout, DashboardModel.Json)!);
    private Task<DashboardRow?> Visible(Guid actor, Guid id, CancellationToken ct) => Rows.SingleOrDefaultAsync(x => x.Id == id && (x.OwnerId == null || x.OwnerId == actor), ct);
    private Task<DashboardRow?> Personal(Guid actor, Guid id, CancellationToken ct) => Rows.SingleOrDefaultAsync(x => x.SourceId == id && x.OwnerId == actor, ct);
    // All dashboard mutations use this transaction lock, including first personalization and source deletion.
    private Task Lock(CancellationToken ct) => db.Database.ExecuteSqlRawAsync("SELECT pg_advisory_xact_lock(4500922)", ct);
    private async Task<bool> ActiveActor(Guid actor, CancellationToken ct)
    {
        await db.Database.ExecuteSqlInterpolatedAsync($"SELECT pg_advisory_xact_lock(hashtextextended({actor.ToString()}, 0))", ct);
        return await db.Profiles.AnyAsync(x => x.Id == actor && !x.Disabled, ct);
    }
    private void Audit(Guid actor, Guid id, string action) => db.Audit.Add(new() { ActorId = actor, SubjectId = id, SubjectType = "dashboard", Action = action, At = time.GetUtcNow() });
    private static Result<T> Missing<T>() => Result<T>.Fail("resource.not_found", ErrorKind.NotFound);
    private static Result<T> Conflict<T>() => Result<T>.Fail("concurrency.conflict", ErrorKind.Conflict);
    private static bool Period(string value) => value is "all" or "7" or "30" or "90";

    public async Task<DashboardState> Read(Guid actor, CancellationToken ct)
    {
        var rows = await Rows.AsNoTracking().Where(x => x.OwnerId == null || x.OwnerId == actor).OrderBy(x => x.Id).ToArrayAsync(ct);
        var admin = await access.Administrator(actor, ct);
        var personal = rows.Where(x => x.SourceId != null).ToDictionary(x => x.SourceId!.Value);
        var catalog = new List<DashboardCardDefinition>();
        foreach (var owner in owners)
            foreach (var definition in owner.Definitions)
                if (await owner.Available(actor, definition.Id, ct)) catalog.Add(definition);
        return new(rows.Where(x => x.SourceId == null).Select(x => Dto(personal.GetValueOrDefault(x.Id) ?? x)).ToArray(),
            admin ? rows.Where(x => x.OwnerId == null).Select(Dto).ToArray() : [],
            await db.Set<DashboardPreferenceRow>().Where(x => x.UserId == actor).Select(x => x.StartingDashboardId).SingleOrDefaultAsync(ct), admin, catalog.ToArray());
    }

    public async Task<Result<DashboardDto>> Save(Guid actor, SaveDashboard request, CancellationToken ct)
    {
        await using var transaction = await db.Database.BeginTransactionAsync(ct);
        if (!await ActiveActor(actor, ct)) return Missing<DashboardDto>();
        await Lock(ct);
        if (request.Shared && !await access.Administrator(actor, ct)) return Result<DashboardDto>.Fail("authorization.denied", ErrorKind.Forbidden);
        DashboardRow? row = null;
        if (request.Id is Guid id)
        {
            row = await Visible(actor, id, ct);
            if (row is null || request.Shared && row.OwnerId != null) return Missing<DashboardDto>();
            if (!request.Shared && row.OwnerId == null) row = await Personal(actor, id, ct) ?? row;
            if (row.Version != request.Version) return Conflict<DashboardDto>();
        }
        if (!await Valid(actor, request.Layout, row, ct)) return Result<DashboardDto>.Fail("validation.failed", ErrorKind.Validation);
        if (row is null || !request.Shared && row.OwnerId == null)
        {
            row = new DashboardRow { OwnerId = request.Shared ? null : actor, SourceId = row?.Id };
            db.Add(row);
        }
        row.Layout = JsonSerializer.Serialize(request.Layout with { Name = request.Layout.Name.Trim() }, DashboardModel.Json);
        row.Version = Guid.NewGuid();
        Audit(actor, row.Id, request.Shared ? "dashboard.shared_saved" : "dashboard.saved");
        await db.SaveChangesAsync(ct); await transaction.CommitAsync(ct);
        return Result<DashboardDto>.Success(Dto(row));
    }

    private async Task<bool> Valid(Guid actor, DashboardLayout layout, DashboardRow? existing, CancellationToken ct)
    {
        if (layout is null || string.IsNullOrWhiteSpace(layout.Name) || layout.Name.Length > 120 || !Period(layout.Period)
            || layout.Cards is null || layout.Cards.Length > 40 || layout.Cards.Any(x => x is null || x.Id == Guid.Empty)
            || layout.Cards.Select(x => x.Id).Distinct().Count() != layout.Cards.Length) return false;
        var retained = existing is null ? [] : Dto(existing).Layout.Cards;
        foreach (var card in layout.Cards)
        {
            // Unavailable cards can be retained unchanged or removed, never added or reconfigured.
            if (retained.Contains(card)) continue;
            var owner = owners.SingleOrDefault(x => x.Definitions.Any(d => d.Id == card.DefinitionId));
            var definition = owner?.Definitions.Single(x => x.Id == card.DefinitionId);
            if (definition is null || !definition.Sizes.Contains(card.Size) || !definition.Formats.Contains(card.Format)
                || !definition.Metrics.Contains(card.Metric) || !definition.Filters.Contains(card.Filter)
                || card.Period != "inherit" && !Period(card.Period) || !await owner!.Available(actor, card.DefinitionId, ct)) return false;
        }
        return true;
    }

    public async Task<Result<Unit>> Reset(Guid actor, DashboardChange request, CancellationToken ct)
    {
        await using var transaction = await db.Database.BeginTransactionAsync(ct);
        if (!await ActiveActor(actor, ct)) return Missing<Unit>();
        await Lock(ct);
        var source = await Visible(actor, request.Id, ct);
        if (source is null || source.OwnerId != null) return Missing<Unit>();
        var row = await Personal(actor, request.Id, ct);
        if ((row ?? source).Version != request.Version) return Conflict<Unit>();
        if (row != null) db.Remove(row);
        Audit(actor, request.Id, "dashboard.reset");
        await db.SaveChangesAsync(ct); await transaction.CommitAsync(ct);
        return Result<Unit>.Success(new Unit());
    }

    public async Task<Result<Unit>> Delete(Guid actor, DashboardChange request, CancellationToken ct)
    {
        await using var transaction = await db.Database.BeginTransactionAsync(ct);
        if (!await ActiveActor(actor, ct)) return Missing<Unit>();
        await Lock(ct);
        var row = await Visible(actor, request.Id, ct);
        if (row is null) return Missing<Unit>();
        if (row.OwnerId == null && (!request.Shared || !await access.Administrator(actor, ct))) return Result<Unit>.Fail("authorization.denied", ErrorKind.Forbidden);
        if (row.Version != request.Version) return Conflict<Unit>();
        var copies = await Rows.Where(x => x.SourceId == row.Id).ToArrayAsync(ct);
        var preferences = await db.Set<DashboardPreferenceRow>().Where(x => x.StartingDashboardId == row.Id).ToArrayAsync(ct);
        foreach (var copy in copies) { copy.SourceId = null; copy.Version = Guid.NewGuid(); }
        foreach (var preference in preferences) preference.StartingDashboardId = copies.SingleOrDefault(x => x.OwnerId == preference.UserId)?.Id;
        // Clear self-reference constraints before deleting the shared source.
        await db.SaveChangesAsync(ct);
        db.Remove(row); Audit(actor, row.Id, "dashboard.deleted");
        await db.SaveChangesAsync(ct); await transaction.CommitAsync(ct);
        return Result<Unit>.Success(new Unit());
    }

    public async Task<Result<Unit>> SetStarting(Guid actor, DashboardPreference request, CancellationToken ct)
    {
        await using var transaction = await db.Database.BeginTransactionAsync(ct);
        if (!await ActiveActor(actor, ct)) return Missing<Unit>();
        await Lock(ct);
        if (await Visible(actor, request.Id, ct) is null) return Missing<Unit>();
        var row = await db.Set<DashboardPreferenceRow>().FindAsync([actor], ct);
        if (row is null) { row = new() { UserId = actor }; db.Add(row); }
        row.StartingDashboardId = request.Id;
        await db.SaveChangesAsync(ct); await transaction.CommitAsync(ct);
        return Result<Unit>.Success(new Unit());
    }

    public async Task<Result<DashboardCardData>> Card(Guid actor, DashboardCardQuery query, CancellationToken ct)
    {
        var owner = owners.SingleOrDefault(x => x.Definitions.Any(d => d.Id == query.DefinitionId));
        if (owner is null || !await owner.Available(actor, query.DefinitionId, ct)) return Missing<DashboardCardData>();
        var definition = owner.Definitions.Single(x => x.Id == query.DefinitionId);
        if (!Period(query.Period) || query.Limit is not (5 or 10) || !definition.Metrics.Contains(query.Metric) || !definition.Filters.Contains(query.Filter))
            return Result<DashboardCardData>.Fail("validation.failed", ErrorKind.Validation);
        DateTimeOffset? since = definition.DateFilter && query.Period != "all" ? time.GetUtcNow().AddDays(-int.Parse(query.Period, System.Globalization.CultureInfo.InvariantCulture)) : null;
        return Result<DashboardCardData>.Success(await owner.Read(actor, query, since, ct));
    }
}

