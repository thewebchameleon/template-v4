using Microsoft.EntityFrameworkCore;
using TemplateV4.Application.Modules;
using TemplateV4.Infrastructure.Persistence;

namespace TemplateV4.Infrastructure.Modules;

public sealed class CapabilityEvaluator(FrameworkDb db, ModuleCatalog catalog, IFeatureFlags flags, IExecutionContext context, IEnumerable<ICapabilityRestrictions> restrictions) : ICapabilities
{
    // One committed snapshot per evaluation; never retain runtime state between requests.
    public async Task<Dictionary<string, bool>> Read(CancellationToken ct)
    {
        var restricted = new HashSet<string>(StringComparer.Ordinal);
        foreach (var provider in restrictions)
            foreach (var item in await provider.Read(ct))
                if (!item.Value) restricted.Add(item.Key);
        return catalog.Evaluate(await db.RuntimeModules.AsNoTracking().ToDictionaryAsync(x => x.Id, x => x.Enabled, ct),
            feature => flags.Enabled(feature, context), _ => true, id => !restricted.Contains(id));
    }

    public async Task<bool> Enabled(string capability, CancellationToken ct)
        => catalog.Capabilities.ContainsKey(capability) && (await Read(ct)).GetValueOrDefault(capability);

}
