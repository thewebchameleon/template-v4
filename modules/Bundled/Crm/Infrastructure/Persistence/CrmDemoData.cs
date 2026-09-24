using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using TemplateV4.Application.Crm;
using TemplateV4.Application.Modules;
using TemplateV4.Infrastructure.Crm;

namespace TemplateV4.Infrastructure.Persistence;

public sealed class CrmDemoData(CrmDb db) : IDemoDataContributor
{
    public string ModuleId => "crm";
    public int Order => 101;

    public async Task Seed(CancellationToken ct)
    {
        var now = DateTimeOffset.UtcNow;
        var json = new JsonSerializerOptions(JsonSerializerDefaults.Web);
        var settings = await db.Set<CrmConfigurationRow>().SingleOrDefaultAsync(ct);
        if (settings is null)
        {
            var configuration = new CrmConfiguration(Guid.NewGuid(),
                [new(Guid.NewGuid(), "Lead"), new(Guid.NewGuid(), "Active")], [],
                [new(Guid.NewGuid(), "Sales", [new(Guid.NewGuid(), "New"), new(Guid.NewGuid(), "Proposal")])], []);
            settings = new() { Version = configuration.Version, Data = JsonSerializer.Serialize(configuration, json) };
            db.Set<CrmConfigurationRow>().Add(settings);
        }
        var pipeline = JsonSerializer.Deserialize<CrmConfiguration>(settings.Data, json)!.Pipelines
            .FirstOrDefault(x => !x.Retired && x.Stages.Any(stage => !stage.Retired));
        var stage = pipeline?.Stages.FirstOrDefault(x => !x.Retired);
        async Task Add(Guid id, CrmRecordInput data)
        {
            if (await db.Set<CrmRecordRow>().AnyAsync(x => x.Id == id, ct)) return;
            db.Set<CrmRecordRow>().Add(new()
            {
                Id = id, Kind = data.Kind.ToString(), Name = data.Name,
                Email = data.Email ?? "", Phone = data.Phone ?? "",
                Outcome = data.Outcome.ToString(), Value = data.Value ?? 0,
                CreatedAt = now, UpdatedAt = now, Data = JsonSerializer.Serialize(data, json)
            });
        }
        await Add(DemoDataIds.Customer, new(CrmRecordKind.Company, "Harbour & Pine Studio",
            "hello@harbour-pine.example.invalid", "+27 21 555 0101", "Cape Town, South Africa",
            null, [], null, [], [], null, null, null, null, null, null, DealOutcome.Open));
        await Add(DemoDataIds.Contact, new(CrmRecordKind.Contact, "Amina Dlamini",
            "amina@harbour-pine.example.invalid", "+27 21 555 0102", "Cape Town, South Africa",
            null, [], null, [new(DemoDataIds.Customer, "Decision maker")], [], DemoDataIds.Customer,
            null, null, null, null, null, DealOutcome.Open));
        if (pipeline is not null && stage is not null)
            await Add(DemoDataIds.Deal, new(CrmRecordKind.Deal, "Workspace rollout",
                null, null, null, null, [], null, [], [], DemoDataIds.Customer,
                DemoDataIds.Contact, 18500m, DateOnly.FromDateTime(now.AddMonths(1).UtcDateTime),
                pipeline.Id, stage.Id, DealOutcome.Open));
        await db.SaveChangesAsync(ct);
    }
}
