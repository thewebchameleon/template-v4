using System.Net.Http.Headers;
using System.Net.Http.Json;
using TemplateV4.Application.Licensing;
using TemplateV4.Infrastructure.Updates;

namespace TemplateV4.Infrastructure.Licensing;

public sealed class LicenseClient(HttpClient http, LicenseConfiguration configuration, UpdateConfiguration updates)
{
    public async Task<SignedDeploymentLicense> Refresh(CancellationToken ct)
    {
        using var request = new HttpRequestMessage(HttpMethod.Post, configuration.Url!.TrimEnd('/') + "/api/v1/client-management/heartbeat");
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", configuration.Token);
        request.Content = JsonContent.Create(new DeploymentHeartbeat(LicensePolicy.Components(updates.Installed), "running"));
        using var response = await http.SendAsync(request, HttpCompletionOption.ResponseHeadersRead, ct);
        response.EnsureSuccessStatusCode();
        await response.Content.LoadIntoBufferAsync(262144, ct);
        return await response.Content.ReadFromJsonAsync<SignedDeploymentLicense>(ct) ?? throw new InvalidOperationException("Empty license response.");
    }
}
