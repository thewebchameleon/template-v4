using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.Extensions.DependencyInjection;
using TemplateV4.ApiService;
using TemplateV4.ApiService.Endpoints;
using TemplateV4.Application.ApiKeys;
using TemplateV4.Application.Cms;
using TemplateV4.Application.Modules;
using TemplateV4.Application.Users;
using TemplateV4.Infrastructure.ApiKeys;
using TemplateV4.Infrastructure.Persistence;
using Xunit;

namespace TemplateV4.Application.Tests.ApiKeys;

public sealed class ApiKeyDatabaseFactAttribute : FactAttribute
{
    public ApiKeyDatabaseFactAttribute()
    {
        if (string.IsNullOrEmpty(Environment.GetEnvironmentVariable("TEMPLATEV4_API_KEYS_TEST_DATABASE")))
            Skip = "Set TEMPLATEV4_API_KEYS_TEST_DATABASE to an empty disposable PostgreSQL database.";
    }
}

public sealed class ApiKeyTests
{
    [Fact]
    public async Task External_CMS_routes_are_unversioned_module_owned_and_scope_protected()
    {
        var builder = WebApplication.CreateBuilder();
        builder.Services.AddAuthorization();
        builder.Services.AddScoped<ICms>(_ => null!);
        builder.Services.AddScoped<ICmsSections>(_ => null!);
        await using var app = builder.Build();
        app.MapExternalCmsEndpoints();
        var endpoints = ((IEndpointRouteBuilder)app).DataSources.SelectMany(x => x.Endpoints).OfType<RouteEndpoint>().ToArray();
        Assert.Equal(3, endpoints.Length);
        Assert.All(endpoints, endpoint =>
        {
            Assert.StartsWith("/api/external/cms/", endpoint.RoutePattern.RawText, StringComparison.Ordinal);
            Assert.Equal(ModuleIds.Cms, endpoint.Metadata.GetMetadata<ModuleOwnership>()?.Id);
            Assert.Equal(CapabilityIds.Cms, endpoint.Metadata.GetMetadata<CapabilityRequirement>()?.Id);
            Assert.Contains(endpoint.Metadata.GetOrderedMetadata<IAuthorizeData>(), authorization => ApiScopes.All.Contains(authorization.Policy));
        });
    }

    [Theory]
    [InlineData("")]
    [InlineData("tv4_not-a-key")]
    [InlineData("tv4_00000000000000000000000000000000.short")]
    public void Credential_parser_rejects_malformed_values(string credential)
        => Assert.False(ApiKeyAuthentication.TryReadId(credential, out _));

    [Fact]
    public void Credential_parser_reads_the_embedded_identifier()
    {
        var expected = Guid.NewGuid();
        var credential = $"tv4_{expected:N}.{new string('a', 64)}";
        Assert.True(ApiKeyAuthentication.TryReadId(credential, out var actual));
        Assert.Equal(expected, actual);
    }

    [ApiKeyDatabaseFact]
    public async Task Key_secret_is_one_time_hashed_metered_and_revocable()
    {
        var options = new DbContextOptionsBuilder<FrameworkDb>().UseNpgsql(
            Environment.GetEnvironmentVariable("TEMPLATEV4_API_KEYS_TEST_DATABASE"),
            postgres => postgres.MigrationsHistoryTable("migrations", "app")).Options;
        await using var db = new FrameworkDb(options);
        await db.GetService<IMigrator>().MigrateAsync();
        Assert.False(db.Database.HasPendingModelChanges());
        var actor = Guid.NewGuid();
        db.Users.Add(new AppUser { Id = actor, UserName = actor.ToString(), NormalizedUserName = actor.ToString().ToUpperInvariant(), EmailConfirmed = true });
        await db.SaveChangesAsync();
        var context = new TestExecutionContext(actor, new HashSet<string>(StringComparer.Ordinal) { Permissions.ApiKeysManage });
        var service = new ApiKeyService(db, context, TimeProvider.System);

        var created = await service.Create(new("Reporting", [ApiScopes.CmsArticlesRead], 30), CancellationToken.None);
        Assert.True(created.IsSuccess);
        var secret = created.Value!.Secret;
        Assert.True(ApiKeyAuthentication.TryReadId(secret, out var id));
        var row = await db.ApiKeys.AsNoTracking().SingleAsync(x => x.Id == id);
        Assert.Equal(32, row.SecretHash.Length);
        Assert.DoesNotContain(secret, Convert.ToHexString(row.SecretHash), StringComparison.Ordinal);
        Assert.Equal(ApiScopes.CmsArticlesRead, (await service.Authenticate(id, secret, CancellationToken.None))!.Scopes.Single());
        Assert.Equal(1, (await db.ApiKeys.AsNoTracking().SingleAsync(x => x.Id == id)).RequestCount);
        Assert.Equal(1, await db.Audit.CountAsync(x => x.Action == "api_key.created" && x.SubjectId == id));

        Assert.True((await service.Revoke(id, CancellationToken.None)).IsSuccess);
        Assert.Null(await service.Authenticate(id, secret, CancellationToken.None));
        Assert.Equal(1, await db.Audit.CountAsync(x => x.Action == "api_key.revoked" && x.SubjectId == id));
    }

    private sealed record TestExecutionContext(Guid UserId, IReadOnlySet<string> Grants) : IExecutionContext
    {
        public Guid? ActorId => UserId;
        public IReadOnlySet<string> Permissions => Grants;
        public string Culture => "en-ZA";
        public string? TraceParent => null;
    }
}
