using Microsoft.Extensions.DependencyInjection;
using TemplateV4.Application.Website;

namespace TemplateV4.Infrastructure;

public static partial class Registration
{
    private static void AddWebsite(IServiceCollection services) => services.AddScoped<IWebsite, Website.WebsiteStore>();
}
