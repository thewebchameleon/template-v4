using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.DependencyInjection;
using TemplateV4.ApiService.Endpoints;
using TemplateV4.Application.Cms;
using TemplateV4.Application.Contact;
using TemplateV4.Application.Modules;
using TemplateV4.Application.Website;
using TemplateV4.Infrastructure.Cms;
using TemplateV4.Infrastructure.Contact;
using TemplateV4.Infrastructure.Website;
using Xunit;

namespace TemplateV4.Application.Tests;

public sealed class WebsiteTests
{
    [Theory]
    [InlineData("javascript:alert(1)")]
    [InlineData("https://user:password@example.com")]
    [InlineData("https://example.com/path")]
    [InlineData("https://example.com?query=1")]
    public void Canonical_origins_reject_active_schemes_credentials_paths_and_queries(string value) => Assert.False(WebsiteStore.Origin(value));

    [Fact]
    public void Image_urls_allow_only_https_or_owned_images()
    {
        Assert.True(WebsiteStore.ImageUrl("https://example.com/logo.png"));
        Assert.True(WebsiteStore.ImageUrl("/api/v1/website/images/1435e55e-cf92-4619-baf4-b4a27327e98b"));
        Assert.False(WebsiteStore.ImageUrl("//attacker.example/logo"));
        Assert.False(WebsiteStore.ImageUrl("data:image/svg+xml,<svg></svg>"));
        Assert.False(WebsiteStore.ImageUrl("/api/v1/website/images/../../private"));
    }

    [Fact]
    public async Task Public_contact_and_cms_routes_have_independent_ownership_and_gates()
    {
        var builder = WebApplication.CreateBuilder();
        builder.Services.AddScoped<IWebsite, WebsiteStore>();
        builder.Services.AddScoped<IContact, ContactStore>();
        builder.Services.AddScoped<ICms, CmsStore>();
        builder.Services.AddScoped<ICmsSections, CmsSectionsStore>();
        await using var app = builder.Build();
        app.MapPublicWebsite();
        app.MapGroup("/api/v1/auth").MapWebsiteAdministration().MapContactAdministration().MapCmsEndpoints();
        var routes = ((IEndpointRouteBuilder)app).DataSources.SelectMany(source => source.Endpoints).OfType<RouteEndpoint>().ToArray();
        foreach (var route in routes.Where(route => route.RoutePattern.RawText!.Contains("/contact", StringComparison.Ordinal)))
        {
            Assert.Equal(ModuleIds.Contact, route.Metadata.GetMetadata<ModuleOwnership>()?.Id);
            Assert.True(route.Metadata.GetMetadata<CapabilityRequirement>()?.Id == CapabilityIds.Contact || route.Metadata.GetMetadata<ModuleLifecycleException>() is not null);
        }
        foreach (var route in routes.Where(route => route.RoutePattern.RawText!.Contains("/cms", StringComparison.Ordinal)))
        {
            Assert.Equal(ModuleIds.Cms, route.Metadata.GetMetadata<ModuleOwnership>()?.Id);
            Assert.Equal(CapabilityIds.Cms, route.Metadata.GetMetadata<CapabilityRequirement>()?.Id);
        }
    }
}
