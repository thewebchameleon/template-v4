using System.Collections.Specialized;
using System.Net;
using System.Net.Http.Json;
using System.Security.Cryptography;
using System.Text.Json;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging.Abstractions;
using Quartz;
using Quartz.Impl;
using Quartz.Spi;
using templatev4.Application;
using templatev4.Application.Users;
using templatev4.Domain.Users;
using templatev4.Infrastructure;
using templatev4.Infrastructure.Persistence;
using templatev4.Infrastructure.Security;
using templatev4.Worker;
using Testcontainers.PostgreSql;
using Xunit;

namespace templatev4.Tests;

public sealed class SecurityAndMessagingTests : IAsyncLifetime
{
    private readonly PostgreSqlContainer _postgres = new PostgreSqlBuilder("postgres:18.6-alpine").Build();
    private readonly string _directory = Path.Combine(Path.GetTempPath(), "templatev4-tests", Guid.NewGuid().ToString("N"));
    private ServiceProvider _services = null!;
    private Dictionary<string, string?> _configuration = null!;
    private readonly ManualTime _clock = new();
    public async Task InitializeAsync()
    {
        await _postgres.StartAsync(); Directory.CreateDirectory(_directory);
        using var rsa = RSA.Create(3072); await File.WriteAllTextAsync(Path.Combine(_directory, "jwt.pem"), rsa.ExportRSAPrivateKeyPem());
        _configuration = new() { ["ConnectionStrings:app"] = _postgres.GetConnectionString(), ["DataProtection:KeyPath"] = _directory, ["Jwt:PrivateKeyPath"] = Path.Combine(_directory, "jwt.pem"), ["Jwt:KeyId"] = "tests", ["Web:PublicUrl"] = "https://localhost", ["Web:AllowedOrigins:0"] = "https://localhost" };
        var builder = WebApplication.CreateBuilder(new WebApplicationOptions { EnvironmentName = "Testing" });
        builder.Configuration.AddInMemoryCollection(_configuration);
        builder.Services.AddInfrastructure(builder.Configuration, builder.Environment);
        builder.Services.AddSingleton<TimeProvider>(_clock);
        builder.Services.AddLogging(); builder.Services.AddScoped<BackgroundExecutionContext>();
        builder.Services.AddScoped<IExecutionContext>(provider => provider.GetRequiredService<BackgroundExecutionContext>());
        builder.Services.AddScoped<IIntegrationTransport, RecordingTransport>();
        _services = builder.Services.BuildServiceProvider();
        await using var scope = _services.CreateAsyncScope(); var db = scope.ServiceProvider.GetRequiredService<FrameworkDb>(); await db.Database.MigrateAsync();
        var roles = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole<Guid>>>();
        foreach (var name in new[] { "Administrator", "Reader" }) Assert.True((await roles.CreateAsync(new(name) { Id = Guid.NewGuid() })).Succeeded);
        var admin = await roles.FindByNameAsync("Administrator");
        foreach (var permission in Permissions.All) await roles.AddClaimAsync(admin!, new("permission", permission));
    }
    public async Task DisposeAsync() { await _services.DisposeAsync(); await _postgres.DisposeAsync(); Directory.Delete(_directory, true); }
    private async Task<AppUser> User(IServiceProvider services)
    {
        var users = services.GetRequiredService<UserManager<AppUser>>();
        var user = new AppUser { Id = Guid.NewGuid(), Email = $"{Guid.NewGuid():N}@example.test", EmailConfirmed = true }; user.UserName = user.Email;
        Assert.True((await users.CreateAsync(user, "Test-only!Password942")).Succeeded);
        await users.AddToRoleAsync(user, "Administrator");
        var db = services.GetRequiredService<FrameworkDb>(); var profile = UserProfile.Create(user.Id, "Test administrator", "en-ZA"); profile.ClearEvents(); db.Profiles.Add(profile); await db.SaveChangesAsync(); return user;
    }
    [Fact]
    public async Task Bootstrap_token_creates_exactly_one_durable_administrator_who_can_login_by_username()
    {
        await using var scope = _services.CreateAsyncScope();
        var bootstrap = scope.ServiceProvider.GetRequiredService<AdminBootstrapService>();
        var token = scope.ServiceProvider.GetRequiredService<AdminBootstrapToken>();
        Assert.True(await bootstrap.Initialize(default));
        using var output = new StringWriter();
        token.Enable(output);
        var raw = output.ToString().Trim().Split(": ", 2)[1];

        var invalid = await bootstrap.Create(new("not-the-token", "first_admin", "Test-only!Password942"), default);
        Assert.Equal("bootstrap.invalid", invalid.Error!.Code);
        var tooShort = await bootstrap.Create(new(raw, "first_admin", "Aa1!aaa"), default);
        Assert.Equal("validation.failed", tooShort.Error!.Code);
        var created = await bootstrap.Create(new(raw, "first_admin", "Aa1!aaaa"), default);
        Assert.True(created.IsSuccess);
        Assert.False(await bootstrap.Available(default));

        var db = scope.ServiceProvider.GetRequiredService<FrameworkDb>();
        var user = await scope.ServiceProvider.GetRequiredService<UserManager<AppUser>>().FindByNameAsync("first_admin");
        Assert.NotNull(user);
        Assert.EndsWith("@example.invalid", user.Email, StringComparison.Ordinal);
        Assert.NotNull((await db.SecuritySettings.SingleAsync()).BootstrapCompletedAt);
        Assert.Single(await db.Audit.Where(entry => entry.Action == "bootstrap.administrator").ToArrayAsync());

        var login = await scope.ServiceProvider.GetRequiredService<AuthService>().Login(new("first_admin", "Aa1!aaaa", "test"), default);
        Assert.True(login.IsSuccess);

        db.UserRoles.RemoveRange(db.UserRoles.Where(membership => membership.UserId == user.Id));
        await db.SaveChangesAsync();
        token.Enable(TextWriter.Null);
        Assert.False(await bootstrap.Initialize(default));
        Assert.Equal("bootstrap.unavailable", (await bootstrap.Create(new(raw, "second_admin", "Test-only!Password942"), default)).Error!.Code);
    }
    [Fact]
    public async Task Starting_authenticator_enrollment_preserves_only_the_setup_session()
    {
        await using var scope = _services.CreateAsyncScope(); var sp = scope.ServiceProvider;
        var user = await User(sp); var auth = sp.GetRequiredService<AuthService>();
        var login = await auth.Login(new(user.Email!, "Test-only!Password942", "test"), default);
        var jwt = new System.IdentityModel.Tokens.Jwt.JwtSecurityTokenHandler().ReadJwtToken(login.Value!.Access.AccessToken);
        var sid = Guid.Parse(jwt.Claims.Single(x => x.Type == "sid").Value);
        var enrollment = await sp.GetRequiredService<SecurityService>().BeginEnrollment(user.Id, sid, new("Test-only!Password942"), default);
        Assert.True(enrollment.IsSuccess);
        // A new request must remain authorized to submit the confirmation code after Identity resets the stamp.
        await using var check = _services.CreateAsyncScope();
        Assert.True(await check.ServiceProvider.GetRequiredService<AuthService>().Validate(new System.Security.Claims.ClaimsPrincipal(new System.Security.Claims.ClaimsIdentity(jwt.Claims, "test")), default));
    }
    [Fact]
    public async Task Reconciler_restores_a_stranded_request_trigger_and_terminal_failure_is_replayable()
    {
        var factory = new StdSchedulerFactory(new NameValueCollection { ["quartz.scheduler.instanceName"] = "reconcile-" + Guid.NewGuid().ToString("N") });
        var scheduler = await factory.GetScheduler(); var id = Guid.NewGuid();
        try
        {
            await using (var scope = _services.CreateAsyncScope())
            {
                var db = scope.ServiceProvider.GetRequiredService<FrameworkDb>();
                db.JobRuns.Add(new() { Id = id, State = "Running", Attempts = 1, LeaseUntil = _clock.Now.AddMinutes(-1), AvailableAt = _clock.Now.AddMinutes(-2) });
                await db.SaveChangesAsync();
            }
            var key = new JobKey(id.ToString("N"), "requests");
            await scheduler.AddJob(JobBuilder.Create<MaintenanceJob>().WithIdentity(key).StoreDurably().RequestRecovery().Build(), false);
            var reconciler = new JobReconciler(_services.GetRequiredService<IServiceScopeFactory>(), factory, NullLogger<JobReconciler>.Instance);
            await reconciler.Reconcile(default); await reconciler.Reconcile(default);
            Assert.Single(await scheduler.GetTriggersOfJob(key));
            await using var scope2 = _services.CreateAsyncScope(); var services = scope2.ServiceProvider;
            var db2 = services.GetRequiredService<FrameworkDb>(); var run = await db2.JobRuns.SingleAsync(x => x.Id == id); run.State = "Failed"; await db2.SaveChangesAsync();
            Assert.True((await services.GetRequiredService<OperationsService>().Replay(Guid.NewGuid(), new(id, "job"), default)).IsSuccess);
            Assert.Equal("Retry", (await db2.JobRuns.SingleAsync()).State);
            Assert.Single(await db2.Audit.Where(x => x.Action == "operations.replayed").ToArrayAsync());
        }
        finally { await scheduler.Shutdown(); }
    }
    [Fact]
    public async Task Expired_delivery_lease_can_be_claimed_and_active_lease_is_not_stolen()
    {
        await using (var scope = _services.CreateAsyncScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<FrameworkDb>();
            db.Outbox.Add(new() { Type = "test", Payload = "{}", CreatedAt = _clock.Now, AvailableAt = _clock.Now, LeaseId = Guid.NewGuid(), LeaseUntil = _clock.Now.AddMinutes(1) });
            await db.SaveChangesAsync();
        }
        var pump = new OutboxPump(_services.GetRequiredService<IServiceScopeFactory>(), NullLogger<OutboxPump>.Instance);
        Assert.False(await pump.Process(default));
        _clock.Now = _clock.Now.AddMinutes(2);
        Assert.True(await pump.Process(default));
        await using var check = _services.CreateAsyncScope();
        Assert.NotNull((await check.ServiceProvider.GetRequiredService<FrameworkDb>().Outbox.SingleAsync()).CompletedAt);
    }
    [Fact]
    public async Task Required_Mfa_issues_only_a_setup_session_and_reader_has_no_directory_permission()
    {
        await using var scope = _services.CreateAsyncScope(); var sp = scope.ServiceProvider;
        var user = await User(sp); var auth = sp.GetRequiredService<AuthService>();
        var login = await auth.Login(new(user.Email!, "Test-only!Password942", "test"), default);
        Assert.True(login.Value!.Access.SetupRequired); Assert.Empty(login.Value.Access.Permissions);
        var context = sp.GetRequiredService<BackgroundExecutionContext>(); context.ActorId = user.Id; context.Permissions = new HashSet<string>();
        Assert.Equal("authorization.denied", (await sp.GetRequiredService<Dispatcher<ListUsers, Page<UserDto>>>().Send(new())).Error!.Code);
    }
    [Fact]
    public async Task Mfa_challenge_is_single_use_and_recovery_code_cannot_be_reused()
    {
        string email; string recovery; string challenge;
        await using (var scope = _services.CreateAsyncScope())
        {
            var user = await User(scope.ServiceProvider); email = user.Email!;
            var users = scope.ServiceProvider.GetRequiredService<UserManager<AppUser>>();
            await users.ResetAuthenticatorKeyAsync(user); await users.SetTwoFactorEnabledAsync(user, true);
            recovery = (await users.GenerateNewTwoFactorRecoveryCodesAsync(user, 2))!.First();
            var login = await scope.ServiceProvider.GetRequiredService<AuthService>().Login(new(email, "Test-only!Password942", "test"), default);
            Assert.Empty(login.Value!.RefreshToken); Assert.Empty(login.Value.Access.AccessToken); challenge = login.Value.Access.ChallengeId!;
        }
        await using (var scope = _services.CreateAsyncScope())
        {
            var auth = scope.ServiceProvider.GetRequiredService<AuthService>();
            var completed = await auth.CompleteMfa(new(challenge, recovery, true), default);
            Assert.True(completed.IsSuccess); Assert.False(completed.Value!.Access.SetupRequired);
            Assert.Contains(Permissions.Manage, completed.Value.Access.Permissions);
        }
        await using (var scope = _services.CreateAsyncScope())
        {
            var auth = scope.ServiceProvider.GetRequiredService<AuthService>();
            Assert.False((await auth.CompleteMfa(new(challenge, recovery, true), default)).IsSuccess);
            var login = await auth.Login(new(email, "Test-only!Password942", "test"), default);
            Assert.False((await auth.CompleteMfa(new(login.Value!.Access.ChallengeId!, recovery, true), default)).IsSuccess);
        }
    }
    [Fact]
    public async Task Mfa_challenge_expires_and_totp_matching_rejects_invalid_codes()
    {
        string challenge;
        await using (var scope = _services.CreateAsyncScope())
        {
            var user = await User(scope.ServiceProvider); var security = scope.ServiceProvider.GetRequiredService<SecurityService>();
            challenge = await security.Challenge(user, "mfa", "", "test", default);
        }
        _clock.Now = _clock.Now.AddMinutes(6);
        await using var check = _services.CreateAsyncScope();
        Assert.False((await check.ServiceProvider.GetRequiredService<AuthService>().CompleteMfa(new(challenge, "000000"), default)).IsSuccess);
        // RFC 6238 test key at Unix second 59 has six-digit code 287082.
        Assert.Equal(1, SecurityService.MatchingTotpStep("GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ", "287082", DateTimeOffset.FromUnixTimeSeconds(59)));
        Assert.Equal(-1, SecurityService.MatchingTotpStep("GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ", "invalid", DateTimeOffset.FromUnixTimeSeconds(59)));
    }
    [Fact]
    public async Task Directory_returns_one_row_for_multiple_roles_and_includes_roleless_users()
    {
        await using var scope = _services.CreateAsyncScope(); var sp = scope.ServiceProvider;
        var user = await User(sp); var users = sp.GetRequiredService<UserManager<AppUser>>();
        await users.AddToRoleAsync(user, "Reader");
        var second = await User(sp); await users.RemoveFromRoleAsync(second, "Administrator");
        var page = await sp.GetRequiredService<IUserDirectory>().List(new(), default);
        Assert.Equal(2, page.Total); Assert.Equal(2, page.Items.Single(x => x.Id == user.Id).Roles.Length);
        Assert.Empty(page.Items.Single(x => x.Id == second.Id).Roles);
    }
    [Fact]
    public async Task Shared_rate_limit_is_atomic_across_service_scopes()
    {
        var results = await Task.WhenAll(Enumerable.Range(0, 12).Select(async _ =>
        {
            await using var scope = _services.CreateAsyncScope();
            return await scope.ServiceProvider.GetRequiredService<SharedRateLimiter>().Allow("test", "one-client", 3, TimeSpan.FromMinutes(1), default);
        }));
        Assert.Equal(3, results.Count(x => x));
    }
    [Fact]
    public async Task Refresh_reuse_revokes_entire_session_family()
    {
        string original; string rotated;
        await using (var scope = _services.CreateAsyncScope())
        {
            var user = await User(scope.ServiceProvider); var auth = scope.ServiceProvider.GetRequiredService<AuthService>();
            var login = await auth.Login(new(user.Email!, "Test-only!Password942", "test"), default); Assert.True(login.IsSuccess);
            original = login.Value!.RefreshToken;
        }
        await using (var scope = _services.CreateAsyncScope())
        {
            var refresh = await scope.ServiceProvider.GetRequiredService<AuthService>().Refresh(original, default); Assert.True(refresh.IsSuccess); rotated = refresh.Value!.RefreshToken;
        }
        await using (var scope = _services.CreateAsyncScope()) Assert.Equal("auth.refresh_reuse", (await scope.ServiceProvider.GetRequiredService<AuthService>().Refresh(original, default)).Error!.Code);
        await using (var scope = _services.CreateAsyncScope()) Assert.False((await scope.ServiceProvider.GetRequiredService<AuthService>().Refresh(rotated, default)).IsSuccess);
    }
    [Fact]
    public async Task Expired_refresh_is_rejected_with_deterministic_time()
    {
        string token;
        await using (var scope = _services.CreateAsyncScope())
        {
            var user = await User(scope.ServiceProvider);
            token = (await scope.ServiceProvider.GetRequiredService<AuthService>().Login(new(user.Email!, "Test-only!Password942", "clock-test"), default)).Value!.RefreshToken;
        }
        _clock.Now = _clock.Now.AddDays(31);
        await using var check = _services.CreateAsyncScope();
        Assert.False((await check.ServiceProvider.GetRequiredService<AuthService>().Refresh(token, default)).IsSuccess);
    }
    [Fact]
    public async Task Quartz_executes_maintenance_without_optional_metadata()
    {
        var factory = new StdSchedulerFactory(new NameValueCollection { ["quartz.scheduler.instanceName"] = "execute-" + Guid.NewGuid().ToString("N") });
        var scheduler = await factory.GetScheduler();
        await using var scope = _services.CreateAsyncScope(); var services = scope.ServiceProvider;
        scheduler.JobFactory = new TestJobFactory(new MaintenanceJob(services.GetRequiredService<FrameworkDb>(), _clock,
            NullLogger<MaintenanceJob>.Instance, services.GetRequiredService<BackgroundExecutionContext>(), CultureCatalog.Examples,
            new ConfigurationBuilder().Build()));
        try
        {
            await scheduler.ScheduleJob(JobBuilder.Create<MaintenanceJob>().WithIdentity("maintenance-test").Build(), TriggerBuilder.Create().StartNow().Build());
            await scheduler.Start();
            using var timeout = new CancellationTokenSource(TimeSpan.FromSeconds(10));
            await using var check = _services.CreateAsyncScope(); var db = check.ServiceProvider.GetRequiredService<FrameworkDb>();
            while (!await db.Audit.AnyAsync(entry => entry.Action == "job.maintenance.completed", timeout.Token)) await Task.Delay(100, timeout.Token);
        }
        finally { await scheduler.Shutdown(waitForJobsToComplete: true); }
    }
    [Fact]
    public async Task Quartz_request_is_persistent_and_duplicate_delivery_does_not_reschedule()
    {
        var properties = new NameValueCollection
        {
            ["quartz.scheduler.instanceName"] = "test-" + Guid.NewGuid().ToString("N"),
            ["quartz.scheduler.instanceId"] = "AUTO",
            ["quartz.jobStore.type"] = "Quartz.Impl.AdoJobStore.JobStoreTX, Quartz",
            ["quartz.jobStore.driverDelegateType"] = "Quartz.Impl.AdoJobStore.PostgreSQLDelegate, Quartz",
            ["quartz.jobStore.dataSource"] = "app",
            ["quartz.jobStore.tablePrefix"] = "quartz.qrtz_",
            ["quartz.jobStore.clustered"] = "true",
            ["quartz.dataSource.app.provider"] = "Npgsql",
            ["quartz.dataSource.app.connectionString"] = _postgres.GetConnectionString(),
            ["quartz.serializer.type"] = "stj"
        };
        var factory = new StdSchedulerFactory(properties); var scheduler = await factory.GetScheduler();
        var request = new JobRequested(Guid.NewGuid(), "af-ZA");
        var envelope = new MessageEnvelope(Guid.NewGuid(), "maintenance.requested.v1", JsonSerializer.Serialize(request), "af-ZA", null, null);
        try
        {
            await using var scope = _services.CreateAsyncScope(); var services = scope.ServiceProvider;
            var db = services.GetRequiredService<FrameworkDb>();
            await using var transaction = await db.Database.BeginTransactionAsync();
            var transport = new LocalTransport(db, services.GetRequiredService<UserManager<AppUser>>(), services.GetRequiredService<AccountService>(), services.GetRequiredService<IEmailSender>(), _clock, []);
            await transport.Publish(envelope, default); await db.SaveChangesAsync();
            await transport.Publish(envelope, default); await transaction.CommitAsync();
            Assert.Single(await db.Inbox.ToArrayAsync());
            await new JobReconciler(_services.GetRequiredService<IServiceScopeFactory>(), factory, NullLogger<JobReconciler>.Instance).Reconcile(default);
            Assert.True(await scheduler.CheckExists(new JobKey(request.RequestId.ToString("N"), "requests")));
        }
        finally { await scheduler.Shutdown(); }
        var restarted = await new StdSchedulerFactory(properties).GetScheduler();
        try { Assert.True(await restarted.CheckExists(new JobKey(request.RequestId.ToString("N"), "requests"))); }
        finally { await restarted.Shutdown(); }
    }
    [Fact]
    public async Task Failed_command_rolls_back_identity_and_outbox()
    {
        await using var scope = _services.CreateAsyncScope(); var db = scope.ServiceProvider.GetRequiredService<FrameworkDb>();
        var unit = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();
        var result = await unit.Execute(() =>
        {
            scope.ServiceProvider.GetRequiredService<IEventOutbox>().Add(new JobRequested(Guid.NewGuid(), "en-ZA"));
            return Task.FromResult(Result.Fail("test.failed", ErrorKind.Conflict));
        }, null, "rollback", default);
        Assert.False(result.IsSuccess); Assert.Empty(await db.Outbox.ToListAsync());
    }
    [Fact]
    public async Task User_slice_persists_atomic_outbox_and_idempotent_response_then_worker_consumes()
    {
        await using (var scope = _services.CreateAsyncScope())
        {
            var actor = await User(scope.ServiceProvider); var context = scope.ServiceProvider.GetRequiredService<BackgroundExecutionContext>(); context.ActorId = actor.Id; context.Permissions = Permissions.All.ToHashSet();
            var dispatcher = scope.ServiceProvider.GetRequiredService<Dispatcher<CreateUser, UserDto>>();
            var command = new CreateUser("new@example.test", "New user", "af-ZA", ["Reader"], "create-one");
            var first = await dispatcher.Send(command); var second = await dispatcher.Send(command);
            Assert.True(first.IsSuccess); Assert.Equal(JsonSerializer.Serialize(first.Value), JsonSerializer.Serialize(second.Value));
            var db = scope.ServiceProvider.GetRequiredService<FrameworkDb>(); Assert.Single(await db.Outbox.ToListAsync());
            Assert.Equal("idempotency.conflict", (await dispatcher.Send(command with { DisplayName = "Changed" })).Error!.Code);
        }
        var pump = new OutboxPump(_services.GetRequiredService<IServiceScopeFactory>(), NullLogger<OutboxPump>.Instance);
        Assert.True(await pump.Process(default)); Assert.False(await pump.Process(default));
        await using var check = _services.CreateAsyncScope(); Assert.NotNull((await check.ServiceProvider.GetRequiredService<FrameworkDb>().Outbox.SingleAsync()).CompletedAt);
    }
    [Fact]
    public async Task Api_requires_authorization_and_Csrf_and_exports_contract()
    {
        await using var factory = new ApiFactory(_configuration);
        using var client = factory.CreateClient(new() { BaseAddress = new("https://localhost"), AllowAutoRedirect = false });
        Assert.Equal(HttpStatusCode.Unauthorized, (await client.GetAsync("/api/v1/users")).StatusCode);
        Assert.True((await client.GetFromJsonAsync<AdminBootstrapStatus>("/api/v1/bootstrap/status"))!.Available);
        using var bootstrapWithoutCsrf = new HttpRequestMessage(HttpMethod.Post, "/api/v1/bootstrap") { Content = JsonContent.Create(new AdminBootstrapRequest("secret", "admin", "Test-only!Password942")) };
        bootstrapWithoutCsrf.Headers.Add("Origin", "https://localhost");
        Assert.Equal(HttpStatusCode.Forbidden, (await client.SendAsync(bootstrapWithoutCsrf)).StatusCode);
        using var request = new HttpRequestMessage(HttpMethod.Post, "/api/v1/auth/refresh") { Content = JsonContent.Create(new { }) }; request.Headers.Add("Origin", "https://localhost");
        Assert.Equal(HttpStatusCode.Forbidden, (await client.SendAsync(request)).StatusCode);
        string email; Guid readerId;
        await using (var scope = _services.CreateAsyncScope())
        {
            var reader = await User(scope.ServiceProvider); readerId = reader.Id; email = reader.Email!;
            var manager = scope.ServiceProvider.GetRequiredService<UserManager<AppUser>>();
            await manager.RemoveFromRoleAsync(reader, "Administrator"); await manager.AddToRoleAsync(reader, "Reader");
        }
        var csrf = await client.GetFromJsonAsync<JsonElement>("/api/v1/auth/csrf");
        client.DefaultRequestHeaders.Add("Origin", "https://localhost"); client.DefaultRequestHeaders.Add("X-CSRF-TOKEN", csrf.GetProperty("token").GetString());
        var signedIn = await client.PostAsJsonAsync("/api/v1/auth/login", new LoginRequest(email, "Test-only!Password942", "test"));
        Assert.Equal(HttpStatusCode.OK, signedIn.StatusCode);
        var access = (await signedIn.Content.ReadFromJsonAsync<AccessResponse>())!;
        client.DefaultRequestHeaders.Authorization = new("Bearer", access.AccessToken);
        Assert.Equal(HttpStatusCode.Forbidden, (await client.GetAsync("/api/v1/users")).StatusCode);
        Assert.Equal(readerId, (await client.GetFromJsonAsync<ProfileResponse>("/api/v1/auth/profile"))!.Id);
        // The same anonymous-bound CSRF token remains valid after the principal changes at login.
        Assert.Equal(HttpStatusCode.NoContent, (await client.PostAsJsonAsync("/api/v1/auth/logout", new { })).StatusCode);
        var contract = await client.GetStringAsync("/openapi/v1.json");
        using var parsed = JsonDocument.Parse(contract); Assert.True(parsed.RootElement.GetProperty("paths").TryGetProperty("/api/v1/users", out _));
        Assert.True(parsed.RootElement.GetProperty("paths").TryGetProperty("/api/v1/bootstrap/status", out var bootstrapStatus));
        Assert.True(bootstrapStatus.TryGetProperty("get", out _));
        Assert.True(parsed.RootElement.GetProperty("paths").TryGetProperty("/api/v1/bootstrap", out var bootstrapContract));
        Assert.True(bootstrapContract.TryGetProperty("post", out _));
        if (Environment.GetEnvironmentVariable("TEMPLATEV4_EXPORT_OPENAPI") is { Length: > 0 } output)
        { Directory.CreateDirectory(Path.GetDirectoryName(Path.GetFullPath(output))!); await File.WriteAllTextAsync(output, contract.Replace("\r\n", "\n") + "\n"); }
    }
    private sealed class ApiFactory(Dictionary<string, string?> config) : WebApplicationFactory<templatev4.API.HttpExecutionContext>
    {
        protected override void ConfigureWebHost(IWebHostBuilder builder)
        {
            builder.UseEnvironment("Development");
            foreach (var setting in config) builder.UseSetting(setting.Key, setting.Value);
        }
    }
    private sealed class RecordingTransport(FrameworkDb db, TimeProvider time) : IIntegrationTransport
    {
        public Task Publish(MessageEnvelope message, CancellationToken cancellationToken)
        { db.Inbox.Add(new() { Id = message.Id, CompletedAt = time.GetUtcNow() }); return Task.CompletedTask; }
    }
    private sealed class ManualTime : TimeProvider
    {
        public DateTimeOffset Now { get; set; } = DateTimeOffset.UtcNow;
        public override DateTimeOffset GetUtcNow() => Now;
    }
    private sealed class TestJobFactory(IJob job) : IJobFactory
    {
        public IJob NewJob(TriggerFiredBundle bundle, IScheduler scheduler) => job;
        public void ReturnJob(IJob completed) { }
    }
}
