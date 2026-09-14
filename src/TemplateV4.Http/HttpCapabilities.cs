using TemplateV4.Application.Modules;
using TemplateV4.Infrastructure.Modules;

namespace TemplateV4.ApiService;

/// <summary>One admission snapshot per HTTP request, shared by endpoint and operation gates.</summary>
public sealed class HttpCapabilities(CapabilityEvaluator evaluator) : ICapabilities
{
    private readonly object _sync = new();
    private Task<Dictionary<string, bool>>? _snapshot;

    private Task<Dictionary<string, bool>> Snapshot(CancellationToken ct)
    {
        lock (_sync) return _snapshot ??= evaluator.Read(ct);
    }

    public async Task<Dictionary<string, bool>> Read(CancellationToken ct)
        => new(await Snapshot(ct), StringComparer.Ordinal);

    public async Task<bool> Enabled(string capability, CancellationToken ct)
        => (await Snapshot(ct)).GetValueOrDefault(capability);
}
