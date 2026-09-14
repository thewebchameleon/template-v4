using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using TemplateV4.Application;
using TemplateV4.Application.Crm;
using TemplateV4.Application.Customers;
using TemplateV4.Application.Users;
using TemplateV4.Infrastructure.Customers;
using TemplateV4.Infrastructure.Persistence;

namespace TemplateV4.Infrastructure.Crm;

public sealed class CrmStore(FrameworkDb db, IOrganisationOperations access, ICustomerAccess customers, TimeProvider time) : ICrm
{
    private static readonly JsonSerializerOptions Json = new(JsonSerializerDefaults.Web);
    private static CrmRecord Read(CrmRecordRow row) => new(row.Id, row.OrganisationId, row.Version,
        JsonSerializer.Deserialize<CrmRecordInput>(row.Data, Json)!, row.Archived, row.CreatedAt, row.UpdatedAt);
    private IQueryable<CrmRecordRow> Records(Guid organisation) => db.Set<CrmRecordRow>().Where(x => x.OrganisationId == organisation);
    private async Task Lock(Guid organisation, CancellationToken ct)
    {
        await CustomerAccess.MutationLock(db, ct);
        await customers.Lock(organisation, ct);
    }
    private void Audit(Guid actor, Guid organisation, Guid id, string action, params TemplateV4.Application.Platform.AuditChange[] changes) => db.Audit.Add(new()
    {
        ActorId = actor,
        SubjectId = id,
        SubjectType = "crm.record",
        Action = action,
        ChangesJson = AuditCapture.Changes(changes),
        At = time.GetUtcNow(),
        RelatedEntitiesJson = JsonSerializer.Serialize(new[] { new { Type = "organisation", Id = organisation } }, Json)
    });
    public async Task<Result<CrmRecord>> Resolve(Guid actor, Guid organisation, Guid id, bool allowArchived, CancellationToken ct)
    {
        if (!await access.Allowed(actor, organisation, OrganisationOperation.Read, ct)) return Result<CrmRecord>.Fail("customers.not_found", ErrorKind.NotFound);
        var row = await Records(organisation).AsNoTracking().SingleOrDefaultAsync(x => x.Id == id && (allowArchived || !x.Archived) && x.Kind != "Deal", ct);
        return row is null ? Result<CrmRecord>.Fail("resource.not_found", ErrorKind.NotFound) : Result<CrmRecord>.Success(Read(row));
    }
    public async Task<Result<Page<CrmRecord>>> List(Guid actor, Guid organisation, CrmList query, CancellationToken ct)
    {
        if (!Enum.IsDefined(query.Kind) || query.Search is null or { Length: > 250 } || query.PageNumber is < 1 or > 10000 ||
            query.PageSize is < 1 or > 100 || query.Sort is not ("name" or "email" or "phone" or "value" or "outcome" or "updatedAt") || query.Direction is not ("asc" or "desc"))
            return Result<Page<CrmRecord>>.Fail("validation.failed", ErrorKind.Validation);
        if (!await access.Allowed(actor, organisation, OrganisationOperation.Read, ct)) return Result<Page<CrmRecord>>.Fail("customers.not_found", ErrorKind.NotFound);
        var kind = query.Kind.ToString(); var search = query.Search.Trim().ToLowerInvariant();
        var rows = Records(organisation).AsNoTracking().Where(x => x.Kind == kind && x.Archived == query.Archived);
        if (search.Length > 0) rows = rows.Where(x => x.Name.ToLower().Contains(search) || x.Email.ToLower().Contains(search) || x.Phone.Contains(search));
        var total = await rows.CountAsync(ct); var asc = query.Direction == "asc";
        var sorted = query.Sort switch
        {
            "email" => asc ? rows.OrderBy(x => x.Email) : rows.OrderByDescending(x => x.Email),
            "phone" => asc ? rows.OrderBy(x => x.Phone) : rows.OrderByDescending(x => x.Phone),
            "value" => asc ? rows.OrderBy(x => x.Value) : rows.OrderByDescending(x => x.Value),
            "outcome" => asc ? rows.OrderBy(x => x.Outcome) : rows.OrderByDescending(x => x.Outcome),
            "updatedAt" => asc ? rows.OrderBy(x => x.UpdatedAt) : rows.OrderByDescending(x => x.UpdatedAt),
            _ => asc ? rows.OrderBy(x => x.Name) : rows.OrderByDescending(x => x.Name)
        };
        var page = await sorted.ThenBy(x => x.Id).Skip((query.PageNumber - 1) * query.PageSize).Take(query.PageSize).ToArrayAsync(ct);
        return Result<Page<CrmRecord>>.Success(new(page.Select(Read).ToArray(), total, query.PageNumber, query.PageSize));
    }
    public async Task<Result<CrmDetail>> Detail(Guid actor, Guid organisation, Guid id, CancellationToken ct)
    {
        if (!await access.Allowed(actor, organisation, OrganisationOperation.Read, ct)) return Result<CrmDetail>.Fail("customers.not_found", ErrorKind.NotFound);
        var row = await Records(organisation).AsNoTracking().SingleOrDefaultAsync(x => x.Id == id, ct);
        if (row is null) return Result<CrmDetail>.Fail("resource.not_found", ErrorKind.NotFound);
        var notes = await db.Set<CrmNoteRow>().AsNoTracking().Where(x => x.OrganisationId == organisation && x.RecordId == id)
            .OrderByDescending(x => x.At).ThenBy(x => x.Id).Select(x => new CrmNote(x.Id, x.RecordId, x.ActorId, x.Text, x.At)).ToArrayAsync(ct);
        return Result<CrmDetail>.Success(new(Read(row), notes));
    }
    public async Task<Result<CrmRecord>> Save(Guid actor, Guid organisation, SaveCrmRecord request, CancellationToken ct)
    {
        var data = request.Data;
        if (data is null || !Enum.IsDefined(data.Kind) || !Enum.IsDefined(data.Outcome) || string.IsNullOrWhiteSpace(data.Name) || data.Name.Length > 250 ||
            data.Email?.Length > 254 || data.Phone?.Length > 50 || data.Address?.Length > 2000 || data.VatNumber != null &&
            (data.VatNumber.Length != 10 || !data.VatNumber.All(char.IsAsciiDigit) || !data.VatNumber.StartsWith('4')) || data.Tags is null || data.Companies is null || data.CustomFields is null ||
            data.Tags.Length > 100 || data.Companies.Length > 100 || data.CustomFields.Length > 100 || data.Companies.Any(x => x is null || x.Role is null or { Length: > 100 }) ||
            data.CustomFields.Any(x => x is null) || data.Tags.Distinct().Count() != data.Tags.Length || data.Companies.DistinctBy(x => x.CompanyId).Count() != data.Companies.Length ||
            data.CustomFields.DistinctBy(x => x.FieldId).Count() != data.CustomFields.Length || data.Value is < 0 or > 1000000000000 ||
            data.Value.HasValue && decimal.Round(data.Value.Value, 2) != data.Value || data.Kind != CrmRecordKind.Contact && (data.Companies.Length != 0 || data.CustomFields.Length != 0))
            return Result<CrmRecord>.Fail("validation.failed", ErrorKind.Validation);
        await using var tx = await db.Database.BeginTransactionAsync(ct); await Lock(organisation, ct);
        if (!await access.Allowed(actor, organisation, OrganisationOperation.Operate, ct)) return Result<CrmRecord>.Fail("customers.not_found", ErrorKind.NotFound);
        var row = request.Id.HasValue ? await Records(organisation).SingleOrDefaultAsync(x => x.Id == request.Id, ct) : new CrmRecordRow { OrganisationId = organisation, CreatedAt = time.GetUtcNow() };
        if (row is null) return Result<CrmRecord>.Fail("resource.not_found", ErrorKind.NotFound);
        if (request.Id.HasValue && (row.Version != request.Version || row.Archived || row.Kind != data.Kind.ToString())) return Result<CrmRecord>.Fail("concurrency.conflict", ErrorKind.Conflict);
        var previous = request.Id.HasValue ? Read(row).Data : null;
        var settings = ReadConfiguration(await Seed(organisation, ct));
        bool Option(CrmOption[] options, Guid id, bool retained) => options.Any(x => x.Id == id && (!x.Retired || retained));
        if (data.LifecycleStatusId is Guid lifecycle && !Option(settings.LifecycleStatuses, lifecycle, previous?.LifecycleStatusId == lifecycle) ||
            data.Tags.Any(id => !Option(settings.Tags, id, previous?.Tags.Contains(id) == true)) ||
            data.CustomFields.Any(value => !settings.ContactFields.Any(field => field.Id == value.FieldId &&
                (!field.Retired || previous?.CustomFields.Contains(value) == true) && Option(field.Options, value.OptionId, previous?.CustomFields.Contains(value) == true))))
            return Result<CrmRecord>.Fail("validation.failed", ErrorKind.Validation);
        if (data.Kind == CrmRecordKind.Deal && (!data.Value.HasValue || !settings.Pipelines.Any(p => p.Id == data.PipelineId &&
            (!p.Retired || previous?.PipelineId == p.Id) && p.Stages.Any(s => s.Id == data.StageId && (!s.Retired || previous?.StageId == s.Id)))))
            return Result<CrmRecord>.Fail("validation.failed", ErrorKind.Validation);
        if (data.OwnerId is Guid owner && !await access.Allowed(owner, organisation, OrganisationOperation.Read, ct)) return Result<CrmRecord>.Fail("validation.failed", ErrorKind.Validation);
        foreach (var relationship in data.Companies)
            if (!await Records(organisation).AnyAsync(x => x.Id == relationship.CompanyId && x.Kind == "Company" && (!x.Archived || previous != null && previous.Companies.Select(c => c.CompanyId).Contains(x.Id)), ct))
                return Result<CrmRecord>.Fail("validation.failed", ErrorKind.Validation);
        foreach (var reference in new[] { (data.CustomerId, previous?.CustomerId, false), (data.ContactId, previous?.ContactId, true) })
            if (reference.Item1 is Guid target && !await Records(organisation).AnyAsync(x => x.Id == target && x.Kind != "Deal" && (!reference.Item3 || x.Kind == "Contact") && (!x.Archived || reference.Item2 == target), ct))
                return Result<CrmRecord>.Fail("validation.failed", ErrorKind.Validation);
        row.Kind = data.Kind.ToString(); row.Name = data.Name.Trim(); row.Email = data.Email?.Trim() ?? ""; row.Phone = data.Phone?.Trim() ?? "";
        row.Outcome = data.Outcome.ToString(); row.Value = data.Value ?? 0; row.UpdatedAt = time.GetUtcNow(); row.Version = Guid.NewGuid();
        row.Data = JsonSerializer.Serialize(data with { Name = row.Name, Email = row.Email, Phone = row.Phone }, Json);
        if (!request.Id.HasValue) db.Set<CrmRecordRow>().Add(row);
        Audit(actor, organisation, row.Id, request.Id.HasValue ? "crm.updated" : "crm.created",
            new("kind", previous?.Kind.ToString(), data.Kind.ToString()),
            new("outcome", previous?.Outcome.ToString(), data.Outcome.ToString()),
            new("relationshipCount", previous?.Companies.Length.ToString(), data.Companies.Length.ToString()),
            new("customFieldCount", previous?.CustomFields.Length.ToString(), data.CustomFields.Length.ToString()));
        await db.SaveChangesAsync(ct); await tx.CommitAsync(ct); return Result<CrmRecord>.Success(Read(row));
    }
    public async Task<Result<CrmRecord>> Archive(Guid actor, Guid organisation, Guid id, ArchiveCrmRecord request, CancellationToken ct)
    {
        await using var tx = await db.Database.BeginTransactionAsync(ct); await Lock(organisation, ct);
        if (!await access.Allowed(actor, organisation, OrganisationOperation.Operate, ct)) return Result<CrmRecord>.Fail("customers.not_found", ErrorKind.NotFound);
        var row = await Records(organisation).SingleOrDefaultAsync(x => x.Id == id, ct);
        if (row is null) return Result<CrmRecord>.Fail("resource.not_found", ErrorKind.NotFound);
        if (row.Version != request.Version) return Result<CrmRecord>.Fail("concurrency.conflict", ErrorKind.Conflict);
        row.Archived = request.Archived; row.Version = Guid.NewGuid(); row.UpdatedAt = time.GetUtcNow();
        Audit(actor, organisation, id, request.Archived ? "crm.archived" : "crm.restored");
        await db.SaveChangesAsync(ct); await tx.CommitAsync(ct); return Result<CrmRecord>.Success(Read(row));
    }
    public async Task<Result<CrmNote>> Note(Guid actor, Guid organisation, Guid id, AddCrmNote request, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(request.Text) || request.Text.Length > 8000) return Result<CrmNote>.Fail("validation.failed", ErrorKind.Validation);
        await using var tx = await db.Database.BeginTransactionAsync(ct); await Lock(organisation, ct);
        if (!await access.Allowed(actor, organisation, OrganisationOperation.Operate, ct) || !await Records(organisation).AnyAsync(x => x.Id == id && !x.Archived, ct))
            return Result<CrmNote>.Fail("resource.not_found", ErrorKind.NotFound);
        var note = new CrmNoteRow { OrganisationId = organisation, RecordId = id, ActorId = actor, Text = request.Text.Trim(), At = time.GetUtcNow() };
        db.Set<CrmNoteRow>().Add(note); Audit(actor, organisation, id, "crm.note_added");
        await db.SaveChangesAsync(ct); await tx.CommitAsync(ct); return Result<CrmNote>.Success(new(note.Id, id, actor, note.Text, note.At));
    }
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
    public async Task<Result<CrmOverview>> Overview(Guid actor, Guid organisation, CancellationToken ct)
    {
        if (!await access.Allowed(actor, organisation, OrganisationOperation.Read, ct)) return Result<CrmOverview>.Fail("customers.not_found", ErrorKind.NotFound);
        var deals = Records(organisation).Where(x => !x.Archived && x.Kind == "Deal" && x.Outcome == "Open");
        var recent = await Records(organisation).AsNoTracking().OrderByDescending(x => x.UpdatedAt).ThenBy(x => x.Id).Take(10).ToArrayAsync(ct);
        return Result<CrmOverview>.Success(new(await deals.CountAsync(ct), await deals.SumAsync(x => x.Value, ct), recent.Select(Read).ToArray()));
    }
}
