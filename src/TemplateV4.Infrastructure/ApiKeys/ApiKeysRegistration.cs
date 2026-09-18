using Microsoft.Extensions.DependencyInjection;
using TemplateV4.Application.ApiKeys;

namespace TemplateV4.Infrastructure;

public static partial class Registration
{
    private static void AddApiKeys(IServiceCollection services) => services.AddScoped<IApiKeys, ApiKeys.ApiKeyService>();
}
