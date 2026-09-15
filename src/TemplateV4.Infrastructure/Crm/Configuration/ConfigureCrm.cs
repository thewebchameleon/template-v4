using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using TemplateV4.Application.Crm;

namespace TemplateV4.Infrastructure.Crm;

public sealed partial class CrmStore
{
    private static CrmConfiguration ReadConfiguration(CrmConfigurationRow row) => JsonSerializer.Deserialize<CrmConfiguration>(row.Data, Json)! with { Version = row.Version };
    private async Task<CrmConfigurationRow> Seed(Guid organisation, CancellationToken ct)
    {
        var row = await db.Set<CrmConfigurationRow>().SingleOrDefaultAsync(x => x.OrganisationId == organisation, ct);
        if (row != null) return row;
        CrmOption Option(string label) => new(Guid.NewGuid(), label);
        var configuration = new CrmConfiguration(Guid.NewGuid(), [Option("Lead"), Option("Active"), Option("Inactive")], [],
            [new(Guid.NewGuid(), "Sales", [new(Guid.NewGuid(), "New"), new(Guid.NewGuid(), "Qualified"), new(Guid.NewGuid(), "Proposal")])],
            [new(Guid.NewGuid(), "Referral source", [Option("Website"), Option("Referral"), Option("Event"), Option("Other")])]);
        row = new() { OrganisationId = organisation, Version = configuration.Version, Data = JsonSerializer.Serialize(configuration, Json) };
        db.Set<CrmConfigurationRow>().Add(row); return row;
    }
    public async Task<Result<CrmConfiguration>> Configuration(Guid actor, Guid organisation, CancellationToken ct)
    {
        await using var tx = await db.Database.BeginTransactionAsync(ct); await Lock(organisation, ct);
        if (!await access.Allowed(actor, organisation, OrganisationOperation.Read, ct)) return Result<CrmConfiguration>.Fail("customers.not_found", ErrorKind.NotFound);
        var row = await Seed(organisation, ct); await db.SaveChangesAsync(ct); await tx.CommitAsync(ct); return Result<CrmConfiguration>.Success(ReadConfiguration(row));
    }
    public async Task<Result<CrmConfiguration>> Configure(Guid actor, Guid organisation, CrmConfiguration request, CancellationToken ct)
    {
        bool Label(string? value) => !string.IsNullOrWhiteSpace(value) && value.Length <= 150;
        bool Options(CrmOption[]? values) => values is { Length: <= 100 } && values.All(x => x != null && x.Id != Guid.Empty && Label(x.Label)) && values.DistinctBy(x => x.Id).Count() == values.Length;
        if (!Options(request.LifecycleStatuses) || !Options(request.Tags) || request.ContactFields is not { Length: <= 100 } ||
            request.ContactFields.Any(x => x == null || x.Id == Guid.Empty || !Label(x.Label) || !Options(x.Options)) || request.ContactFields.DistinctBy(x => x.Id).Count() != request.ContactFields.Length ||
            request.Pipelines is not { Length: > 0 and <= 100 } || request.Pipelines.Any(x => x == null || x.Id == Guid.Empty || !Label(x.Label) || x.Stages is not { Length: > 0 and <= 100 } ||
                x.Stages.Any(s => s == null || s.Id == Guid.Empty || !Label(s.Label)) || x.Stages.DistinctBy(s => s.Id).Count() != x.Stages.Length) || request.Pipelines.DistinctBy(x => x.Id).Count() != request.Pipelines.Length)
            return Result<CrmConfiguration>.Fail("validation.failed", ErrorKind.Validation);
        await using var tx = await db.Database.BeginTransactionAsync(ct); await Lock(organisation, ct);
        if (!await access.Allowed(actor, organisation, OrganisationOperation.Configure, ct)) return Result<CrmConfiguration>.Fail("authorization.denied", ErrorKind.Forbidden);
        var row = await Seed(organisation, ct);
        if (row.Version != request.Version) return Result<CrmConfiguration>.Fail("concurrency.conflict", ErrorKind.Conflict);
        var old = ReadConfiguration(row);
        bool Retained(IEnumerable<Guid> oldIds, IEnumerable<Guid> nextIds) => !oldIds.Except(nextIds).Any();
        if (!Retained(old.LifecycleStatuses.Select(x => x.Id), request.LifecycleStatuses.Select(x => x.Id)) || !Retained(old.Tags.Select(x => x.Id), request.Tags.Select(x => x.Id)) ||
            old.ContactFields.Any(field => !request.ContactFields.Any(f => f.Id == field.Id && Retained(field.Options.Select(x => x.Id), f.Options.Select(x => x.Id)))) ||
            old.Pipelines.Any(p => !request.Pipelines.Any(n => n.Id == p.Id && Retained(p.Stages.Select(x => x.Id), n.Stages.Select(x => x.Id)))))
            return Result<CrmConfiguration>.Fail("crm.retire_instead", ErrorKind.Validation);
        row.Version = Guid.NewGuid(); row.Data = JsonSerializer.Serialize(request with { Version = row.Version }, Json);
        Audit(actor, organisation, organisation, "crm.configuration_changed");
        await db.SaveChangesAsync(ct); await tx.CommitAsync(ct); return Result<CrmConfiguration>.Success(ReadConfiguration(row));
    }
}
