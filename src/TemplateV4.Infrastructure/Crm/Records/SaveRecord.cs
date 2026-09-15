using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using TemplateV4.Application.Crm;

namespace TemplateV4.Infrastructure.Crm;

public sealed partial class CrmStore
{
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
}
