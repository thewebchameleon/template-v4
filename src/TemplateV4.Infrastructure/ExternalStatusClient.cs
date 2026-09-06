using System.Net.Http.Json;

namespace TemplateV4.Infrastructure;

public sealed record ExternalStatus(string Status);

/// <summary>Reference typed client. Register only when a feature enables this external dependency.</summary>
public sealed class ExternalStatusClient(HttpClient http)
{
    public async Task<ExternalStatus> Read(CancellationToken cancellationToken) =>
        await http.GetFromJsonAsync<ExternalStatus>("status", cancellationToken)
        ?? throw new HttpRequestException("External status response was empty.");
}
