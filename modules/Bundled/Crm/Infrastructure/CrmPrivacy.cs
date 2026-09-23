using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using TemplateV4.Application.Privacy;
using TemplateV4.Infrastructure.Persistence;
namespace TemplateV4.Infrastructure.Crm;
public sealed class CrmPrivacy(CrmDb db) : IPrivacyContributor
{
    public Task<IReadOnlyDictionary<string, object?>> Export(Guid actor, CancellationToken ct) => Task.FromResult<IReadOnlyDictionary<string, object?>>(new Dictionary<string, object?>());
    public async Task Erase(Guid actor, CancellationToken ct)
    {
            // CRM customers are independent business records, not this identity account.
            // Remove staff assignment while retaining organisation records and issued snapshots.
            var assignments = await db.Set<TemplateV4.Infrastructure.Crm.CrmRecordRow>()
                .FromSqlInterpolated($"SELECT * FROM crm.records WHERE \"Data\" ->> 'ownerId' = {actor.ToString()}").ToArrayAsync(ct);
            foreach (var record in assignments)
            {
                var data = JsonSerializer.Deserialize<TemplateV4.Application.Crm.CrmRecordInput>(record.Data, new JsonSerializerOptions(JsonSerializerDefaults.Web))!;
                if (data.OwnerId != actor) continue;
                record.Data = JsonSerializer.Serialize(data with { OwnerId = null }, new JsonSerializerOptions(JsonSerializerDefaults.Web));
                record.Version = Guid.NewGuid();
            }

    }
}
