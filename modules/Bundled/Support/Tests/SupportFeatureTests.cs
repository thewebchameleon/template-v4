using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using TemplateV4.ApiService.Endpoints;
using TemplateV4.Application.Contact;
using TemplateV4.Application.Modules;
using TemplateV4.Application.Support;
using TemplateV4.Application.Users;
using TemplateV4.Domain.Users;
using TemplateV4.Infrastructure;
using TemplateV4.Infrastructure.Contact;
using TemplateV4.Infrastructure.Persistence;
using TemplateV4.Infrastructure.Support;
using Xunit;

namespace TemplateV4.Application.Tests.Support;

public sealed class SupportDatabaseFactAttribute : FactAttribute
{
    public SupportDatabaseFactAttribute()
    {
        if (string.IsNullOrEmpty(Environment.GetEnvironmentVariable("TEMPLATEV4_SUPPORT_TEST_DATABASE")))
            Skip = "Set TEMPLATEV4_SUPPORT_TEST_DATABASE to an empty disposable PostgreSQL database.";
    }
}

public sealed class SupportFeatureTests
{
    [Fact]
    public async Task Support_routes_gate_each_feature_and_keep_retained_enquiries_accessible()
    {
        var builder = WebApplication.CreateBuilder();
        builder.Services.AddScoped(typeof(Dispatcher<,>));
        builder.Services.AddScoped<ISupportTickets, SupportTicketStore>();
        builder.Services.AddScoped<ISupportCategories, SupportCategoriesStore>();
        builder.Services.AddScoped<ISupportAttachments, SupportAttachmentsStore>();
        builder.Services.AddScoped<IContact, ContactStore>();
        await using var app = builder.Build();
        app.MapGroup("/api/v1/auth").MapSupportEndpoints().MapContactAdministration();
        var endpoints = ((IEndpointRouteBuilder)app).DataSources.SelectMany(x => x.Endpoints).OfType<RouteEndpoint>().ToArray();
        Assert.NotEmpty(endpoints);
        foreach (var endpoint in endpoints)
        {
            Assert.Equal(ModuleIds.Support, endpoint.Metadata.GetMetadata<ModuleOwnership>()?.Id);
            var path = endpoint.RoutePattern.RawText!;
            if (path.StartsWith("/api/v1/auth/contact", StringComparison.Ordinal))
            {
                Assert.NotNull(endpoint.Metadata.GetMetadata<ModuleLifecycleException>());
                Assert.Null(endpoint.Metadata.GetMetadata<CapabilityRequirement>());
            }
            else Assert.Equal(CapabilityIds.SupportTickets, endpoint.Metadata.GetMetadata<CapabilityRequirement>()?.Id);
        }
    }

    [SupportDatabaseFact]
    public async Task Migration_feature_admission_concurrency_and_retained_enquiries_use_committed_state()
    {
        var builder = WebApplication.CreateBuilder(new WebApplicationOptions { EnvironmentName = "Testing" });
        builder.Configuration.AddInMemoryCollection(new Dictionary<string, string?>
        {
            ["ConnectionStrings:app"] = Environment.GetEnvironmentVariable("TEMPLATEV4_SUPPORT_TEST_DATABASE"),
            ["DataProtection:KeyPath"] = Path.Combine(Path.GetTempPath(), "templatev4-support-tests"),
            ["Web:PublicUrl"] = "https://support.example.test"
        });
        builder.Logging.ClearProviders();
        builder.Services.AddInfrastructure(builder.Configuration, builder.Environment, []);
        builder.Services.AddScoped<BackgroundExecutionContext>();
        builder.Services.AddScoped<IExecutionContext>(sp => sp.GetRequiredService<BackgroundExecutionContext>());
        await using var provider = builder.Services.BuildServiceProvider();
        var administrator = Guid.NewGuid(); var requester = Guid.NewGuid(); var other = Guid.NewGuid();
        var enquiry = Guid.NewGuid();
        using (var scope = provider.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<FrameworkDb>();
            await db.GetService<IMigrator>().MigrateAsync("20260916110315_UnifiedFileLibrary");
            await db.Database.ExecuteSqlInterpolatedAsync($"""
                UPDATE app.runtime_modules SET "Enabled" = FALSE WHERE "Id" = 'contact';
                UPDATE website.settings SET "NotificationEmail" = 'enquiries@example.test', "Configured" = TRUE, "Enabled" = TRUE;
                INSERT INTO contact.enquiries ("Id", "Name", "Email", "Message", "CreatedAt", "Read")
                    VALUES ({enquiry}, 'Retained', 'retained@example.test', 'Existing enquiry', now(), FALSE);
                """);
            await db.Database.MigrateAsync();
            Assert.False(db.Database.HasPendingModelChanges());
            var settings = await db.Set<SupportSettingsRow>().SingleAsync();
            Assert.False(settings.EnquiriesEnabled);
            Assert.Equal("enquiries@example.test", settings.NotificationEmail);
            Assert.False(await db.RuntimeModules.AnyAsync(x => x.Id == "contact"));
            Assert.True(await db.Set<ContactRow>().AnyAsync(x => x.Id == enquiry));
            foreach (var id in new[] { administrator, requester, other })
            {
                db.Users.Add(new AppUser { Id = id, UserName = id.ToString(), EmailConfirmed = true });
                db.Profiles.Add(UserProfile.Create(id, "Support test", "en-ZA"));
            }
            var role = Guid.NewGuid();
            db.Roles.Add(new IdentityRole<Guid> { Id = role, Name = "Administrator", NormalizedName = "ADMINISTRATOR" });
            db.UserRoles.Add(new IdentityUserRole<Guid> { RoleId = role, UserId = administrator });
            await db.SaveChangesAsync();
        }
        IServiceScope Scope(Guid? actor)
        {
            var scope = provider.CreateScope();
            var execution = scope.ServiceProvider.GetRequiredService<BackgroundExecutionContext>();
            execution.ActorId = actor;
            execution.Permissions = actor == administrator ? new HashSet<string> { Permissions.Settings, Permissions.ContactManage } : new HashSet<string>();
            return scope;
        }
        async Task<SupportModuleSettings> Settings()
        {
            using var scope = Scope(administrator);
            return (await scope.ServiceProvider.GetRequiredService<ISupportModuleSettings>().Read(default)).Value!;
        }
        async Task<Result<SupportModuleSettings>> Save(SaveSupportModuleSettings request)
        {
            using var scope = Scope(administrator);
            return await scope.ServiceProvider.GetRequiredService<Dispatcher<SaveSupportModuleSettings, SupportModuleSettings>>().Send(request);
        }
        async Task<Dictionary<string, bool>> Capabilities()
        {
            using var scope = Scope(null);
            return await scope.ServiceProvider.GetRequiredService<ICapabilities>().Read(default);
        }
        var initial = await Settings();
        var races = await Task.WhenAll(Save(new(false, initial.Version)), Save(new(true, initial.Version)));
        Assert.Single(races, x => x.IsSuccess);
        Assert.Single(races, x => !x.IsSuccess);
        var current = await Settings();
        using (var scope = Scope(administrator))
            Assert.Equal(1, await scope.ServiceProvider.GetRequiredService<FrameworkDb>().Audit.CountAsync(x => x.Action == "module.support_features_changed"));
        Assert.True((await Save(new(false, current.Version))).IsSuccess);
        var capabilities = await Capabilities();
        Assert.False(capabilities[CapabilityIds.SupportTickets]);
        using (var scope = Scope(requester))
        {
            Assert.False((await scope.ServiceProvider.GetRequiredService<ISupportTickets>().Create(new("Blocked", "Ticket", new Guid("9a0e9b19-33fb-49e0-8bd0-77eb7eca5c20")), default)).IsSuccess);
            Assert.False((await scope.ServiceProvider.GetRequiredService<ISupportModuleSettings>().Read(default)).IsSuccess);
        }
        current = await Settings();
        Assert.True((await Save(new(true, current.Version))).IsSuccess);
        Guid ticketId;
        using (var scope = Scope(requester))
            ticketId = (await scope.ServiceProvider.GetRequiredService<Dispatcher<CreateTicket, Guid>>().Send(new("Ticket", "Description", new Guid("9a0e9b19-33fb-49e0-8bd0-77eb7eca5c20")))).Value;
        Guid version; Guid attachment;
        using (var scope = Scope(requester))
        {
            var ticket = (await scope.ServiceProvider.GetRequiredService<ISupportTickets>().Get(new(ticketId), default)).Value!;
            Assert.True((await scope.ServiceProvider.GetRequiredService<Dispatcher<AttachTicket, Unit>>().Send(new(ticketId, "sample.txt", [1, 2, 3], ticket.Ticket.Version))).IsSuccess);
            var db = scope.ServiceProvider.GetRequiredService<FrameworkDb>();
            attachment = await db.Set<SupportAttachmentRow>().Select(x => x.Id).SingleAsync();
            version = await db.Set<SupportTicketRow>().Where(x => x.Id == ticketId).Select(x => x.Version).SingleAsync();
        }
        using (var scope = Scope(other))
            Assert.False((await scope.ServiceProvider.GetRequiredService<ISupportAttachments>().Download(ticketId, attachment, default)).IsSuccess);
        using (var scope = Scope(requester))
            Assert.True((await scope.ServiceProvider.GetRequiredService<ISupportAttachments>().Download(ticketId, attachment, default)).IsSuccess);
        current = await Settings();
        Assert.True((await Save(new(false, current.Version))).IsSuccess);
        using (var scope = Scope(requester))
        {
            Assert.False((await scope.ServiceProvider.GetRequiredService<ISupportAttachments>().Download(ticketId, attachment, default)).IsSuccess);
            Assert.False((await scope.ServiceProvider.GetRequiredService<Dispatcher<AttachTicket, Unit>>().Send(new(ticketId, "blocked.txt", [4], version))).IsSuccess);
            Assert.False((await scope.ServiceProvider.GetRequiredService<ISupportTickets>().Get(new(ticketId), default)).IsSuccess);
            Assert.True(await scope.ServiceProvider.GetRequiredService<FrameworkDb>().Set<SupportAttachmentRow>().AnyAsync());
        }
        using (var scope = Scope(administrator))
        {
            var activation = scope.ServiceProvider.GetRequiredService<IModuleActivation>();
            var module = (await activation.Read(default)).Single(x => x.Id == ModuleIds.Support);
            Assert.True((await scope.ServiceProvider.GetRequiredService<Dispatcher<SaveModuleActivation, ModuleActivation>>().Send(new(ModuleIds.Support, false, module.Version))).IsSuccess);
        }
        Assert.False((await Capabilities())[CapabilityIds.SupportTickets]);
        using (var scope = Scope(administrator))
        {
            var contact = scope.ServiceProvider.GetRequiredService<IContact>();
            Assert.True((await contact.List("", 1, 10, "createdAt", "desc", default)).IsSuccess);
            Assert.True((await contact.MarkRead(enquiry, default)).IsSuccess);
        }
        // Settings remain editable while disabled; a rollback must include their audit entry.
        current = await Settings();
        using (var scope = Scope(administrator))
        {
            var db = scope.ServiceProvider.GetRequiredService<FrameworkDb>();
            await using var tx = await db.Database.BeginTransactionAsync();
            Assert.True((await scope.ServiceProvider.GetRequiredService<ISupportModuleSettings>().Save(new(true, current.Version), default)).IsSuccess);
            await db.SaveChangesAsync(); await tx.RollbackAsync();
        }
        Assert.Equal(current, await Settings());
        // Activation and feature writes share the runtime-first lock order and have independent versions.
        async Task<bool> EnableSupport()
        {
            using var scope = Scope(administrator);
            var module = (await scope.ServiceProvider.GetRequiredService<IModuleActivation>().Read(default)).Single(x => x.Id == ModuleIds.Support);
            return (await scope.ServiceProvider.GetRequiredService<Dispatcher<SaveModuleActivation, ModuleActivation>>().Send(new(ModuleIds.Support, true, module.Version))).IsSuccess;
        }
        var activationTask = EnableSupport();
        var featureTask = Save(new(true, current.Version));
        await Task.WhenAll(activationTask, featureTask);
        Assert.True(await activationTask);
        Assert.True((await featureTask).IsSuccess);
        capabilities = await Capabilities();
        Assert.True(capabilities[CapabilityIds.SupportTickets]);
        using (var scope = Scope(administrator))
        {
            var db = scope.ServiceProvider.GetRequiredService<FrameworkDb>();
            await db.Set<SupportSettingsRow>().ExecuteDeleteAsync();
        }
        capabilities = await Capabilities();
        Assert.False(capabilities[CapabilityIds.SupportTickets]);
    }
}
