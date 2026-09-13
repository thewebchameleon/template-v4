using Microsoft.EntityFrameworkCore;
using TemplateV4.Application.Modules;
using TemplateV4.Infrastructure.Persistence;

namespace TemplateV4.Infrastructure.Modules;

public sealed class CapabilityEvaluator(FrameworkDb db, ModuleCatalog catalog, IFeatureFlags flags, IExecutionContext context) : ICapabilities
{
    // One committed snapshot per evaluation; never retain runtime state between requests.
    public async Task<Dictionary<string, bool>> Read(CancellationToken ct)
        => catalog.Evaluate(await db.RuntimeModules.AsNoTracking().ToDictionaryAsync(x => x.Id, x => x.Enabled, ct),
            feature => flags.Enabled(feature, context));

    public async Task<bool> Enabled(string capability, CancellationToken ct)
        => catalog.Capabilities.ContainsKey(capability) && (await Read(ct)).GetValueOrDefault(capability);

}
