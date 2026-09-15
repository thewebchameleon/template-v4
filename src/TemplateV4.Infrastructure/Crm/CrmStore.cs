using System.Text.Json;
using TemplateV4.Application.Crm;
using TemplateV4.Application.Customers;
using TemplateV4.Infrastructure.Customers;
using TemplateV4.Infrastructure.Persistence;

namespace TemplateV4.Infrastructure.Crm;

public sealed partial class CrmStore(FrameworkDb db, IOrganisationOperations access, ICustomerAccess customers, TimeProvider time) : ICrm
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
}
