using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Configuration;
using TemplateV4.Infrastructure;
using Xunit;

namespace TemplateV4.Application.Tests;

public sealed class DataProtectionConfigurationTests
{
    [Fact]
    public void Production_requires_a_wrapping_certificate_by_default()
    {
        var builder = CreateProductionBuilder();

        var exception = Assert.Throws<InvalidOperationException>(() =>
            builder.Services.AddInfrastructure(builder.Configuration, builder.Environment, []));

        Assert.Contains("wrapping certificate is required", exception.Message);
    }

    [Fact]
    public void Production_can_explicitly_allow_unencrypted_keys()
    {
        var builder = CreateProductionBuilder();
        builder.Configuration["DataProtection:AllowUnencryptedKeys"] = "true";

        builder.Services.AddInfrastructure(builder.Configuration, builder.Environment, []);
    }

    private static WebApplicationBuilder CreateProductionBuilder()
    {
        var builder = WebApplication.CreateBuilder(new WebApplicationOptions { EnvironmentName = "Production" });
        builder.Configuration.AddInMemoryCollection(new Dictionary<string, string?>
        {
            ["ConnectionStrings:app"] = "Host=localhost;Database=data-protection;Username=unused",
            ["DataProtection:KeyPath"] = Path.Combine(Path.GetTempPath(), "templatev4-data-protection")
        });
        return builder;
    }
}
