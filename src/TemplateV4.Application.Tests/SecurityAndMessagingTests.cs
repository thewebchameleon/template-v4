using System.Collections.Specialized;
using System.Net;
using System.Net.Http.Json;
using System.Security.Cryptography;
using System.Text.Json;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.DataProtection;
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
using TemplateV4.Application;
using TemplateV4.Application.Users;
using TemplateV4.BackgroundWorker;
using TemplateV4.Domain.Users;
using TemplateV4.Infrastructure;
using TemplateV4.Infrastructure.Persistence;
using TemplateV4.Infrastructure.Security;
using Testcontainers.PostgreSql;
using Xunit;

namespace TemplateV4.Application.Tests;

public sealed partial class SecurityAndMessagingTests : IAsyncLifetime
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
        builder.Configuration["Storage:Path"] = Path.Combine(_directory, "files");
        builder.Services.AddInfrastructure(builder.Configuration, builder.Environment);
        builder.Services.AddSingleton<TimeProvider>(_clock);
        builder.Services.AddLogging(); builder.Services.AddScoped<BackgroundExecutionContext>();
        builder.Services.AddScoped<IExecutionContext>(provider => provider.GetRequiredService<BackgroundExecutionContext>());
        builder.Services.AddSingleton<TransportControl>();
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
        var db = services.GetRequiredService<FrameworkDb>(); var profile = UserProfile.Create(user.Id, "Test administrator", "en-ZA", invitationRequired: false); db.Profiles.Add(profile); await db.SaveChangesAsync(); return user;
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
    public async Task Concurrent_bootstrap_requests_create_only_one_administrator()
    {
        string raw;
        await using (var scope = _services.CreateAsyncScope())
        {
            var bootstrap = scope.ServiceProvider.GetRequiredService<AdminBootstrapService>();
            Assert.True(await bootstrap.Initialize(default));
            using var output = new StringWriter();
            scope.ServiceProvider.GetRequiredService<AdminBootstrapToken>().Enable(output);
            raw = output.ToString().Trim().Split(": ", 2)[1];
        }
        async Task<Result<Unit>> Create(string username)
        {
            await using var scope = _services.CreateAsyncScope();
            return await scope.ServiceProvider.GetRequiredService<AdminBootstrapService>().Create(new(raw, username, "Test-only!Password942"), default);
        }
        var results = await Task.WhenAll(Create("first_admin"), Create("second_admin"));
        Assert.Single(results, result => result.IsSuccess);
        Assert.Single(results, result => result.Error?.Code == "bootstrap.unavailable");
        await using var check = _services.CreateAsyncScope();
        var db = check.ServiceProvider.GetRequiredService<FrameworkDb>();
        Assert.Equal(1, await db.UserRoles.Join(db.Roles, membership => membership.RoleId, role => role.Id, (membership, role) => role.NormalizedName).CountAsync(name => name == "ADMINISTRATOR"));
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
    public async Task Stale_delivery_owner_cannot_complete_or_fail_a_newer_lease()
    {
        Guid id;
        await using (var scope = _services.CreateAsyncScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<FrameworkDb>();
            var message = new OutboxMessage { Type = "test", Payload = "{}", CreatedAt = _clock.Now, AvailableAt = _clock.Now };
            db.Outbox.Add(message); await db.SaveChangesAsync(); id = message.Id;
        }
        var newerLease = Guid.NewGuid();
        var control = _services.GetRequiredService<TransportControl>();
        control.BeforePublish = async () =>
        {
            _clock.Now = _clock.Now.AddMinutes(3);
            await using var scope = _services.CreateAsyncScope();
            await scope.ServiceProvider.GetRequiredService<FrameworkDb>().Outbox.Where(x => x.Id == id)
                .ExecuteUpdateAsync(update => update.SetProperty(x => x.LeaseId, newerLease).SetProperty(x => x.LeaseUntil, _clock.Now.AddMinutes(2)));
        };
        try
        {
            var pump = new OutboxPump(_services.GetRequiredService<IServiceScopeFactory>(), NullLogger<OutboxPump>.Instance);
            Assert.True(await pump.Process(default));
        }
        finally { control.BeforePublish = null; }
        await using var check = _services.CreateAsyncScope();
        var persisted = await check.ServiceProvider.GetRequiredService<FrameworkDb>().Outbox.SingleAsync(x => x.Id == id);
        Assert.Null(persisted.CompletedAt); Assert.Equal(newerLease, persisted.LeaseId); Assert.Equal(0, persisted.Attempts);
    }
    [Fact]
    public async Task Required_Mfa_issues_only_a_setup_session_and_reader_has_no_directory_permission()
    {
        await using var scope = _services.CreateAsyncScope(); var sp = scope.ServiceProvider;
        var user = await User(sp); var auth = sp.GetRequiredService<AuthService>();
        var login = await auth.Login(new(user.Email!, "Test-only!Password942", "test"), default);
        Assert.False(login.Value!.Access.MfaConfigured); Assert.True(login.Value.Access.SetupRequired); Assert.Empty(login.Value.Access.Permissions);
        var context = sp.GetRequiredService<BackgroundExecutionContext>(); context.ActorId = user.Id; context.Permissions = new HashSet<string>();
        Assert.Equal("authorization.denied", (await sp.GetRequiredService<Dispatcher<ListUsers, Page<UserDto>>>().Send(new())).Error!.Code);
    }
    [Fact]
    public async Task Password_login_offers_a_configured_passkey()
    {
        await using var scope = _services.CreateAsyncScope(); var sp = scope.ServiceProvider;
        var user = await User(sp); var users = sp.GetRequiredService<UserManager<AppUser>>();
        var passkey = new UserPasskeyInfo([1], [2], _clock.Now, 0, ["internal"], true, false, false, [], []) { Name = "Test passkey" };
        Assert.True((await users.AddOrUpdatePasskeyAsync(user, passkey)).Succeeded);

        var login = await sp.GetRequiredService<AuthService>().Login(new(user.Email!, "Test-only!Password942", "test"), default);

        Assert.True(login.IsSuccess);
        Assert.NotNull(login.Value!.Access.ChallengeId);
        Assert.Empty(login.Value.Access.AccessToken);
        Assert.True(login.Value.Access.MfaConfigured);
        Assert.Equal(new[] { MfaMethods.Passkey }, login.Value.Access.MfaMethods);
        Assert.Equal(MfaMethods.Passkey, login.Value.Access.PreferredMfaMethod);
        Assert.False(login.Value.Access.SetupRequired);
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
            challenge = await security.Challenge(user, "mfa-login", "", "test", default, TimeSpan.FromMinutes(10));
        }
        _clock.Now = _clock.Now.AddMinutes(11);
        await using var check = _services.CreateAsyncScope();
        Assert.False((await check.ServiceProvider.GetRequiredService<AuthService>().CompleteMfa(new(challenge, "000000"), default)).IsSuccess);
        // RFC 6238 test key at Unix second 59 has six-digit code 287082.
        Assert.Equal(1, SecurityService.MatchingTotpStep("GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ", "287082", DateTimeOffset.FromUnixTimeSeconds(59)));
        Assert.Equal(-1, SecurityService.MatchingTotpStep("GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ", "invalid", DateTimeOffset.FromUnixTimeSeconds(59)));
    }
    [Fact]
    public async Task Verified_email_is_the_default_configured_method_and_its_protected_code_is_single_use()
    {
        await using var scope = _services.CreateAsyncScope(); var sp = scope.ServiceProvider;
        var user = await User(sp); user.EmailMfaEnabled = true;
        var db = sp.GetRequiredService<FrameworkDb>(); await db.SaveChangesAsync();

        var login = await sp.GetRequiredService<AuthService>().Login(new(user.Email!, "Test-only!Password942", "email-test"), default);

        Assert.True(login.IsSuccess); Assert.Empty(login.Value!.Access.AccessToken);
        Assert.Equal(new[] { MfaMethods.Email }, login.Value.Access.MfaMethods);
        Assert.Equal(MfaMethods.Email, login.Value.Access.PreferredMfaMethod);
        Assert.True(login.Value.Access.EmailCodeSent);
        Assert.Equal(TimeSpan.FromMinutes(10), login.Value.Access.ExpiresAt - _clock.Now);
        var challenge = await db.AuthChallenges.SingleAsync(x => x.Id == AuthService.Hash(login.Value.Access.ChallengeId!));
        var code = sp.GetRequiredService<IDataProtectionProvider>().CreateProtector("TemplateV4.authentication-challenge.v1").Unprotect(challenge.State);
        var message = await db.Outbox.SingleAsync();
        Assert.DoesNotContain(code, message.Payload, StringComparison.Ordinal);
        Assert.NotNull(JsonSerializer.Deserialize<EmailRequest>(message.Payload)!.ProtectedContent);

        var auth = sp.GetRequiredService<AuthService>();
        var completed = await auth.CompleteMfa(new(login.Value.Access.ChallengeId!, code, Method: MfaMethods.Email), default);
        Assert.True(completed.IsSuccess); Assert.NotEmpty(completed.Value!.Access.AccessToken);
        Assert.False((await auth.CompleteMfa(new(login.Value.Access.ChallengeId!, code, Method: MfaMethods.Email), default)).IsSuccess);
    }
    [Fact]
    public async Task Login_lists_only_configured_methods_and_uses_the_saved_preference()
    {
        await using var scope = _services.CreateAsyncScope(); var sp = scope.ServiceProvider;
        var user = await User(sp); user.EmailMfaEnabled = true;
        var users = sp.GetRequiredService<UserManager<AppUser>>();
        await users.ResetAuthenticatorKeyAsync(user); await users.SetTwoFactorEnabledAsync(user, true);
        var passkey = new UserPasskeyInfo([3], [4], _clock.Now, 0, ["internal"], true, false, false, [], []) { Name = "Second factor" };
        Assert.True((await users.AddOrUpdatePasskeyAsync(user, passkey)).Succeeded);
        var security = sp.GetRequiredService<SecurityService>();
        Assert.True((await security.SetPreferredMethod(user.Id, new(MfaMethods.Authenticator), default)).IsSuccess);
        Assert.Equal("auth.mfa_method_unavailable", (await security.SetPreferredMethod(user.Id, new("Sms"), default)).Error!.Code);

        var login = await sp.GetRequiredService<AuthService>().Login(new(user.Email!, "Test-only!Password942", "methods-test"), default);

        Assert.Equal(new[] { MfaMethods.Email, MfaMethods.Authenticator, MfaMethods.Passkey }, login.Value!.Access.MfaMethods);
        Assert.Equal(MfaMethods.Authenticator, login.Value.Access.PreferredMfaMethod);
        Assert.False(login.Value.Access.EmailCodeSent);
        var profile = await security.Profile(user.Id, default);
        Assert.Equal(MfaMethods.Authenticator, profile.PreferredMfaMethod);
    }
    [Fact]
    public async Task Email_codes_enforce_resend_and_five_failure_cooldowns_across_scopes()
    {
        string email; string challenge; string firstCode;
        await using (var scope = _services.CreateAsyncScope())
        {
            var sp = scope.ServiceProvider; var user = await User(sp); user.EmailMfaEnabled = true; email = user.Email!;
            var db = sp.GetRequiredService<FrameworkDb>(); await db.SaveChangesAsync();
            var login = await sp.GetRequiredService<AuthService>().Login(new(email, "Test-only!Password942", "cooldown-test"), default);
            challenge = login.Value!.Access.ChallengeId!;
            firstCode = sp.GetRequiredService<IDataProtectionProvider>().CreateProtector("TemplateV4.authentication-challenge.v1")
                .Unprotect((await db.AuthChallenges.SingleAsync(x => x.Id == AuthService.Hash(challenge))).State);
            Assert.Equal("auth.email_code_cooldown", (await sp.GetRequiredService<AuthService>().SendEmailCode(new(challenge), default)).Error!.Code);
        }
        _clock.Now = _clock.Now.AddSeconds(31);
        string secondCode;
        await using (var scope = _services.CreateAsyncScope())
        {
            var sp = scope.ServiceProvider; var sent = await sp.GetRequiredService<AuthService>().SendEmailCode(new(challenge), default);
            Assert.True(sent.IsSuccess); Assert.Equal(_clock.Now.AddSeconds(30), sent.Value!.ResendAt);
            var db = sp.GetRequiredService<FrameworkDb>();
            secondCode = sp.GetRequiredService<IDataProtectionProvider>().CreateProtector("TemplateV4.authentication-challenge.v1")
                .Unprotect((await db.AuthChallenges.SingleAsync(x => x.Id == AuthService.Hash(challenge))).State);
            Assert.NotEqual(firstCode, secondCode); Assert.Equal(2, await db.Outbox.CountAsync());
        }
        var wrong = secondCode == "000000" ? "000001" : "000000";
        for (var attempt = 1; attempt <= 5; attempt++)
        {
            await using var scope = _services.CreateAsyncScope();
            var result = await scope.ServiceProvider.GetRequiredService<AuthService>().CompleteMfa(new(challenge, wrong, Method: MfaMethods.Email), default);
            Assert.Equal(attempt == 5 ? "auth.email_code_locked" : "auth.factor_invalid", result.Error!.Code);
        }
        await using (var scope = _services.CreateAsyncScope())
            Assert.Equal("auth.email_code_locked", (await scope.ServiceProvider.GetRequiredService<AuthService>().CompleteMfa(new(challenge, secondCode, Method: MfaMethods.Email), default)).Error!.Code);
        _clock.Now = _clock.Now.AddMinutes(10).AddSeconds(1);
        await using (var scope = _services.CreateAsyncScope())
        {
            var sp = scope.ServiceProvider; var login = await sp.GetRequiredService<AuthService>().Login(new(email, "Test-only!Password942", "after-cooldown"), default);
            var access = login.Value!.Access;
            var db = sp.GetRequiredService<FrameworkDb>();
            var code = sp.GetRequiredService<IDataProtectionProvider>().CreateProtector("TemplateV4.authentication-challenge.v1")
                .Unprotect((await db.AuthChallenges.SingleAsync(x => x.Id == AuthService.Hash(access.ChallengeId!))).State);
            Assert.True((await sp.GetRequiredService<AuthService>().CompleteMfa(new(access.ChallengeId!, code, Method: MfaMethods.Email), default)).IsSuccess);
        }
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
    public async Task Concurrent_refresh_rotation_allows_one_winner_and_revokes_its_family()
    {
        string original;
        await using (var scope = _services.CreateAsyncScope())
        {
            var user = await User(scope.ServiceProvider);
            original = (await scope.ServiceProvider.GetRequiredService<AuthService>().Login(new(user.Email!, "Test-only!Password942", "test"), default)).Value!.RefreshToken;
        }
        async Task<Result<AuthTokens>> Rotate()
        {
            await using var scope = _services.CreateAsyncScope();
            return await scope.ServiceProvider.GetRequiredService<AuthService>().Refresh(original, default);
        }
        var results = await Task.WhenAll(Rotate(), Rotate());
        var winner = Assert.Single(results, result => result.IsSuccess);
        Assert.Single(results, result => result.Error?.Code == "auth.refresh_reuse");
        await using var check = _services.CreateAsyncScope();
        Assert.False((await check.ServiceProvider.GetRequiredService<AuthService>().Refresh(winner.Value!.RefreshToken, default)).IsSuccess);
    }
    [Fact]
    public async Task Concurrent_demotions_cannot_remove_the_last_administrator()
    {
        Guid firstId; Guid firstVersion; Guid secondId; Guid secondVersion;
        await using (var scope = _services.CreateAsyncScope())
        {
            var first = await User(scope.ServiceProvider); var second = await User(scope.ServiceProvider);
            var initialDb = scope.ServiceProvider.GetRequiredService<FrameworkDb>();
            firstId = first.Id; secondId = second.Id;
            firstVersion = (await initialDb.Profiles.SingleAsync(x => x.Id == firstId)).Version;
            secondVersion = (await initialDb.Profiles.SingleAsync(x => x.Id == secondId)).Version;
        }
        async Task<Result<UserDto>> Demote(Guid id, Guid version)
        {
            await using var scope = _services.CreateAsyncScope(); var sp = scope.ServiceProvider;
            var execution = sp.GetRequiredService<BackgroundExecutionContext>();
            execution.ActorId = Guid.NewGuid(); execution.Permissions = new HashSet<string> { Permissions.Manage };
            return await sp.GetRequiredService<Dispatcher<UpdateUser, UserDto>>().Send(new(id, version, false, ["Reader"]));
        }
        var results = await Task.WhenAll(Demote(firstId, firstVersion), Demote(secondId, secondVersion));
        Assert.Single(results, result => result.IsSuccess);
        Assert.Single(results, result => result.Error?.Code == "user.last_administrator");
        await using var check = _services.CreateAsyncScope();
        var db = check.ServiceProvider.GetRequiredService<FrameworkDb>();
        Assert.Equal(1, await db.UserRoles.Join(db.Roles, membership => membership.RoleId, role => role.Id, (membership, role) => role.NormalizedName).CountAsync(name => name == "ADMINISTRATOR"));
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
        var email = $"rollback-{Guid.NewGuid():N}@example.test";
        var result = await unit.Execute(async () =>
        {
            var created = await scope.ServiceProvider.GetRequiredService<UserManager<AppUser>>().CreateAsync(new() { Id = Guid.NewGuid(), UserName = email, Email = email });
            Assert.True(created.Succeeded);
            scope.ServiceProvider.GetRequiredService<IEventOutbox>().Add(new JobRequested(Guid.NewGuid(), "en-ZA"));
            return Result.Fail("test.failed", ErrorKind.Conflict);
        }, null, "rollback", default);
        Assert.False(result.IsSuccess); Assert.Empty(await db.Outbox.ToListAsync()); Assert.False(await db.Users.AnyAsync(x => x.Email == email));
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
        await using var consume = _services.CreateAsyncScope();
        var services = consume.ServiceProvider; var consumerDb = services.GetRequiredService<FrameworkDb>();
        var message = await consumerDb.Outbox.SingleAsync();
        await using var transaction = await consumerDb.Database.BeginTransactionAsync();
        var transport = new LocalTransport(consumerDb, services.GetRequiredService<UserManager<AppUser>>(), services.GetRequiredService<AccountService>(), services.GetRequiredService<IEmailSender>(), _clock, []);
        await transport.Publish(new(message.Id, message.Type, message.Payload, message.Culture, message.TraceParent, message.ActorId), default);
        await consumerDb.SaveChangesAsync(); await transaction.CommitAsync();
        Assert.Single(await consumerDb.Inbox.ToArrayAsync());
        Assert.Equal(2, await consumerDb.Outbox.CountAsync());
        Assert.Contains(await consumerDb.Outbox.ToArrayAsync(), x => x.Type == "email.requested.v1");
    }

    [Fact]
    public async Task Email_or_passkey_only_factor_changes_require_a_recent_verified_session()
    {
        await using var scope = _services.CreateAsyncScope(); var sp = scope.ServiceProvider;
        var user = await User(sp); user.EmailMfaEnabled = true;
        var db = sp.GetRequiredService<FrameworkDb>();
        var session = new Session { UserId = user.Id, SecurityStamp = user.SecurityStamp!, CreatedAt = _clock.Now, ExpiresAt = _clock.Now.AddDays(1), MfaVerified = true };
        db.Sessions.Add(session); await db.SaveChangesAsync();
        _clock.Now = _clock.Now.AddMinutes(6);
        var result = await sp.GetRequiredService<SecurityService>().BeginEnrollment(user.Id, session.Id, new("Test-only!Password942"), default);
        Assert.Equal("auth.reauthentication_required", result.Error!.Code);
    }

    [Fact]
    public async Task Operations_are_filterable_and_pageable_without_hiding_failures()
    {
        await using var scope = _services.CreateAsyncScope(); var sp = scope.ServiceProvider;
        var db = sp.GetRequiredService<FrameworkDb>();
        for (var index = 0; index < 30; index++) db.Outbox.Add(new() { Type = "test", CreatedAt = _clock.Now.AddSeconds(index), AvailableAt = _clock.Now, PoisonedAt = index % 2 == 0 ? _clock.Now : null });
        await db.SaveChangesAsync();
        var operations = sp.GetRequiredService<OperationsService>();
        var first = await operations.List("message", 1, 10, true, default);
        var second = await operations.List("message", 2, 10, true, default);
        Assert.Equal(15, first.Value!.Total); Assert.Equal(10, first.Value.Items.Count); Assert.Equal(5, second.Value!.Items.Count);
        Assert.All(first.Value.Items.Concat(second.Value.Items), item => Assert.Equal("Failed", item.State));
    }

    [Fact]
    public void Bootstrap_accounts_do_not_enter_email_delivery_workflows()
    {
        Assert.False(AccountDelivery.CanReceiveEmail(new() { Email = "bootstrap@example.invalid" }));
        Assert.True(AccountDelivery.CanReceiveEmail(new() { Email = "person@example.test" }));
    }
    [Fact]
    public async Task Setup_only_session_can_save_culture_but_cannot_access_protected_apis()
    {
        string email; Guid userId;
        await using (var scope = _services.CreateAsyncScope())
        {
            var user = await User(scope.ServiceProvider); email = user.Email!; userId = user.Id;
        }
        await using var factory = new ApiFactory(_configuration);
        using var client = factory.CreateClient(new() { BaseAddress = new("https://localhost"), AllowAutoRedirect = false });
        var csrf = await client.GetFromJsonAsync<JsonElement>("/api/v1/auth/csrf");
        client.DefaultRequestHeaders.Add("Origin", "https://localhost");
        client.DefaultRequestHeaders.Add("X-CSRF-TOKEN", csrf.GetProperty("token").GetString());
        var signedIn = await client.PostAsJsonAsync("/api/v1/auth/login", new LoginRequest(email, "Test-only!Password942", "test"));
        var access = (await signedIn.Content.ReadFromJsonAsync<AccessResponse>())!;
        Assert.True(access.SetupRequired);
        client.DefaultRequestHeaders.Authorization = new("Bearer", access.AccessToken);

        Assert.Equal(HttpStatusCode.NoContent, (await client.PostAsJsonAsync("/api/v1/auth/culture", new CultureRequest("af-ZA"))).StatusCode);
        var forbidden = await client.GetAsync("/api/v1/users");
        Assert.Equal(HttpStatusCode.Forbidden, forbidden.StatusCode);
        Assert.Equal("auth.mfa_setup_required", (await forbidden.Content.ReadFromJsonAsync<JsonElement>()).GetProperty("code").GetString());

        await using var check = _services.CreateAsyncScope();
        Assert.Equal("af-ZA", await check.ServiceProvider.GetRequiredService<FrameworkDb>().Profiles.Where(x => x.Id == userId).Select(x => x.Culture).SingleAsync());
    }
    [Fact]
    public async Task Api_requires_authorization_and_Csrf_and_exports_contract()
    {
        await using var factory = new ApiFactory(_configuration);
        using var client = factory.CreateClient(new() { BaseAddress = new("https://localhost"), AllowAutoRedirect = false });
        Assert.False((await client.GetFromJsonAsync<RegistrationSettings>("/api/v1/auth/registration"))!.Enabled);
        using var registrationWithoutCsrf = new HttpRequestMessage(HttpMethod.Post, "/api/v1/auth/register") { Content = JsonContent.Create(new RegistrationRequest("reader@example.test", "Reader", "Test-only!Password942", "en-ZA")) };
        registrationWithoutCsrf.Headers.Add("Origin", "https://localhost");
        Assert.Equal(HttpStatusCode.Forbidden, (await client.SendAsync(registrationWithoutCsrf)).StatusCode);
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
        Assert.Equal(HttpStatusCode.Forbidden, (await client.PostAsJsonAsync("/api/v1/auth/register", new RegistrationRequest("new@example.test", "New", "Test-only!Password942", "en-ZA"))).StatusCode);
        var signedIn = await client.PostAsJsonAsync("/api/v1/auth/login", new LoginRequest(email, "Test-only!Password942", "test"));
        Assert.Equal(HttpStatusCode.OK, signedIn.StatusCode);
        var access = (await signedIn.Content.ReadFromJsonAsync<AccessResponse>())!;
        client.DefaultRequestHeaders.Authorization = new("Bearer", access.AccessToken);
        Assert.Equal(HttpStatusCode.Forbidden, (await client.GetAsync("/api/v1/users")).StatusCode);
        Assert.Equal(HttpStatusCode.Forbidden, (await client.GetAsync("/api/v1/auth/settings/security")).StatusCode);
        Assert.Equal(HttpStatusCode.Forbidden, (await client.PostAsJsonAsync("/api/v1/auth/settings/security", new SecurityPolicyRequest("Optional", Guid.Empty, true))).StatusCode);
        Assert.Equal(readerId, (await client.GetFromJsonAsync<ProfileResponse>("/api/v1/auth/profile"))!.Id);
        // The same anonymous-bound CSRF token remains valid after the principal changes at login.
        Assert.Equal(HttpStatusCode.NoContent, (await client.PostAsJsonAsync("/api/v1/auth/logout", new { })).StatusCode);
        var contract = await client.GetStringAsync("/openapi/v1.json");
        using var parsed = JsonDocument.Parse(contract); Assert.True(parsed.RootElement.GetProperty("paths").TryGetProperty("/api/v1/users", out _));
        Assert.True(parsed.RootElement.GetProperty("paths").TryGetProperty("/api/v1/bootstrap/status", out var bootstrapStatus));
        Assert.True(bootstrapStatus.TryGetProperty("get", out var bootstrapStatusGet));
        Assert.False(bootstrapStatusGet.TryGetProperty("security", out _));
        Assert.True(parsed.RootElement.GetProperty("paths").TryGetProperty("/api/v1/bootstrap", out var bootstrapContract));
        Assert.True(bootstrapContract.TryGetProperty("post", out var bootstrapPost));
        Assert.False(bootstrapPost.TryGetProperty("security", out _));
        Assert.Contains(bootstrapPost.GetProperty("parameters").EnumerateArray(), parameter => parameter.GetProperty("name").GetString() == "X-CSRF-TOKEN");
        var profileGet = parsed.RootElement.GetProperty("paths").GetProperty("/api/v1/auth/profile").GetProperty("get");
        Assert.True(profileGet.TryGetProperty("security", out var profileSecurity));
        Assert.NotEmpty(profileSecurity.EnumerateArray());
        if (Environment.GetEnvironmentVariable("TEMPLATEV4_EXPORT_OPENAPI") is { Length: > 0 } output)
        { Directory.CreateDirectory(Path.GetDirectoryName(Path.GetFullPath(output))!); await File.WriteAllTextAsync(output, contract.Replace("\r\n", "\n") + "\n"); }
    }
    [Fact]
    public async Task Public_registration_is_disabled_by_default_and_policy_changes_require_permission_and_version()
    {
        await using var scope = _services.CreateAsyncScope(); var sp = scope.ServiceProvider;
        var registration = sp.GetRequiredService<RegistrationService>();
        Assert.False((await registration.Settings(default)).Enabled);
        var request = new RegistrationRequest("reader@example.test", "Reader", "Test-only!Password942", "en-ZA");
        Assert.Equal("auth.registration_disabled", (await registration.Register(request, default)).Error!.Code);
        var admin = await User(sp); var security = sp.GetRequiredService<SecurityService>();
        var enabled = await security.SetPolicy(admin.Id, new("Administrators", Guid.Empty, true), default);
        Assert.True(enabled.IsSuccess); Assert.True((await registration.Settings(default)).Enabled);
        Assert.Equal("concurrency.conflict", (await security.SetPolicy(admin.Id, new("Administrators", Guid.Empty, false), default)).Error!.Code);
        Assert.True((await security.SetPolicy(admin.Id, new("Administrators", enabled.Value!.Version, false), default)).IsSuccess);
        Assert.Equal("auth.registration_disabled", (await registration.Register(request, default)).Error!.Code);
    }

    [Fact]
    public async Task Public_registration_creates_only_reader_and_requires_single_use_email_verification()
    {
        await using var scope = _services.CreateAsyncScope(); var sp = scope.ServiceProvider;
        var db = sp.GetRequiredService<FrameworkDb>(); db.SecuritySettings.Add(new() { RegistrationEnabled = true }); await db.SaveChangesAsync();
        var registration = sp.GetRequiredService<RegistrationService>();
        var request = new RegistrationRequest("reader@example.test", "Reader", "Test-only!Password942", "af-ZA");
        Assert.Equal("validation.failed", (await registration.Register(request with { Password = "weak" }, default)).Error!.Code);
        Assert.True((await registration.Register(request, default)).IsSuccess);
        Assert.True((await registration.Register(request with { Email = "READER@example.test" }, default)).IsSuccess);
        var users = sp.GetRequiredService<UserManager<AppUser>>(); var user = (await users.FindByEmailAsync(request.Email))!;
        Assert.False(user.EmailConfirmed); Assert.Equal(new[] { "Reader" }, await users.GetRolesAsync(user));
        Assert.Equal("af-ZA", (await db.Profiles.SingleAsync()).Culture);
        Assert.Single(await db.Outbox.ToArrayAsync()); Assert.Single(await db.Audit.Where(x => x.Action == "auth.registered").ToArrayAsync());
        var auth = sp.GetRequiredService<AuthService>();
        Assert.False((await auth.Login(new(request.Email, request.Password, "test"), default)).IsSuccess);
        var accounts = sp.GetRequiredService<AccountService>(); var token = await users.GenerateEmailConfirmationTokenAsync(user);
        Assert.False((await accounts.Confirm(new(user.Id, "invalid"), default)).IsSuccess);
        Assert.True((await accounts.Confirm(new(user.Id, token), default)).IsSuccess);
        Assert.True(user.EmailMfaEnabled);
        Assert.False((await accounts.Confirm(new(user.Id, token), default)).IsSuccess);
        Assert.Single(await db.Outbox.ToArrayAsync()); // Password already exists; no reset email follows verification.
        var signedIn = await auth.Login(new(request.Email, request.Password, "test"), default);
        Assert.True(signedIn.IsSuccess); Assert.Equal(new[] { MfaMethods.Email }, signedIn.Value!.Access.MfaMethods); Assert.Empty(signedIn.Value.Access.Permissions);
    }
    private sealed class ApiFactory(Dictionary<string, string?> config) : WebApplicationFactory<TemplateV4.ApiService.HttpExecutionContext>
    {
        protected override void ConfigureWebHost(IWebHostBuilder builder)
        {
            builder.UseEnvironment("Development");
            foreach (var setting in config) builder.UseSetting(setting.Key, setting.Value);
        }
    }
    private sealed class TransportControl
    {
        public Func<Task>? BeforePublish { get; set; }
    }
    private sealed class RecordingTransport(FrameworkDb db, TimeProvider time, TransportControl control) : IIntegrationTransport
    {
        public async Task Publish(MessageEnvelope message, CancellationToken cancellationToken)
        { if (control.BeforePublish is not null) await control.BeforePublish(); db.Inbox.Add(new() { Id = message.Id, CompletedAt = time.GetUtcNow() }); }
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
