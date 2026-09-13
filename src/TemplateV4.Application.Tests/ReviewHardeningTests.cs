using System.Net;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging.Abstractions;
using TemplateV4.Application.Billing;
using TemplateV4.Application.Customers;
using TemplateV4.Application.Users;
using TemplateV4.Infrastructure;
using TemplateV4.Infrastructure.Billing;
using TemplateV4.Infrastructure.Persistence;
using TemplateV4.Infrastructure.Security;
using TemplateV4.Infrastructure.Storage;
using Xunit;

namespace TemplateV4.Application.Tests;

public sealed partial class SecurityAndMessagingTests
{
    [Theory]
    [Trait("Category", "ReviewHardening")]
    [InlineData("../outside")]
    [InlineData("00000000000000000000000000000000/00000000000000000000000000000000")]
    [InlineData("00000000000000000000000000000000-0000000000000000000000000000000z")]
    public void Storage_key_contract_rejects_traversal_and_malformed_customer_scope(string key) =>
        Assert.Throws<ArgumentException>(() => StorageKey.Validate(key));

    [Fact]
    [Trait("Category", "ReviewHardening")]
    public async Task Organization_files_roundtrip_through_S3_and_capabilities_follow_membership()
    {
        var fixture = new S3StorageTests(); await fixture.InitializeAsync();
        try
        {
            using var storage = fixture.Provider();
            await using var scope = _services.CreateAsyncScope(); var sp = scope.ServiceProvider;
            var owner = await User(sp); var member = await User(sp); var customers = sp.GetRequiredService<ICustomers>();
            var team = (await customers.Create(owner.Id, new("S3 team"), default)).Value!;
            Assert.True((await customers.Invite(owner.Id, team.Id, new(member.Email!, "Member"), default)).IsSuccess);
            var invitation = Assert.Single((await customers.Home(member.Id, default)).Value!.Invitations);
            Assert.True((await customers.Accept(member.Id, invitation.Id, default)).IsSuccess);
            var db = sp.GetRequiredService<FrameworkDb>();
            var files = new OrganizationFiles(db, sp.GetRequiredService<ICustomerAccess>(), sp.GetRequiredService<IStorageEntitlements>(), storage, _clock);
            using var content = new MemoryStream("organization payload"u8.ToArray());
            Assert.True((await files.Upload(owner.Id, team.Id, "shared.txt", content, default)).IsSuccess);
            var file = Assert.Single((await files.List(member.Id, team.Id, 1, 10, "name", "asc", default)).Value!.Page.Items);
            Assert.False(file.CanDelete);
            Assert.True(Assert.Single((await files.List(owner.Id, team.Id, 1, 10, "name", "asc", default)).Value!.Page.Items).CanDelete);
            Assert.False((await files.Delete(member.Id, team.Id, file.Id, default)).IsSuccess);
            var download = (await files.Download(member.Id, team.Id, file.Id, default)).Value!;
            using (var reader = new StreamReader(download.Content)) Assert.Equal("organization payload", await reader.ReadToEndAsync());
            Assert.True((await files.Delete(owner.Id, team.Id, file.Id, default)).IsSuccess);
            _clock.Now = _clock.Now.AddDays(31);
            var retention = new FileRetention(db, storage, sp.GetRequiredService<IConfiguration>(), _clock, NullLogger<FileRetention>.Instance);
            Assert.Equal(0, (await retention.Run(default)).Count);
            Assert.Equal(0, (await files.List(owner.Id, team.Id, 1, 10, "name", "asc", default)).Value!.UsedBytes);
        }
        finally { await fixture.DisposeAsync(); }
    }

    [Fact]
    [Trait("Category", "ReviewHardening")]
    public async Task Overdue_billing_exposes_cancellation_and_terminal_reconciliation_does_not_grow_receipts()
    {
        await using var scope = _services.CreateAsyncScope(); var sp = scope.ServiceProvider;
        var owner = await User(sp); var customer = (await sp.GetRequiredService<ICustomers>().Create(owner.Id, new("Overdue"), default)).Value!;
        var db = sp.GetRequiredService<FrameworkDb>(); var order = Guid.NewGuid();
        db.Set<PaymentOrderRow>().Add(new() { Id = order, CustomerId = customer.Id, Provider = "stripe", PlanId = "standard", UnitMinor = 9900, Quantity = 1, CreatedAt = _clock.Now.AddMonths(-2) });
        db.Set<SubscriptionRow>().Add(new() { CustomerId = customer.Id, OrderId = order, PaidUntil = _clock.Now.AddDays(-9), NextCheckAt = _clock.Now }); await db.SaveChangesAsync();
        var billing = sp.GetRequiredService<BillingStore>(); var summary = (await billing.Summary(owner.Id, customer.Id, default)).Value!;
        Assert.Equal("PastDue", summary.State); Assert.Equal("Free", summary.EntitlementState); Assert.True(summary.CanCancel); Assert.False(summary.CanCheckout);
        Assert.True((await billing.Cancel(owner.Id, customer.Id, default)).IsSuccess);
        await billing.Apply(order, "stripe", "", new("sub-review", "canceled", _clock.Now.AddDays(-9), 9900, "ZAR"), default, reconciliation: true);
        for (var i = 0; i < 3; i++) await billing.Reconcile(customer.Id, default);
        Assert.Empty(await db.Set<PaymentReceiptRow>().ToArrayAsync());
        Assert.Single(await db.Audit.Where(x => x.Action == "billing.reconciled").ToArrayAsync());
        Assert.False((await billing.Summary(owner.Id, customer.Id, default)).Value!.CanCancel);
    }

    [Fact]
    [Trait("Category", "ReviewHardening")]
    public async Task Organization_invitation_provisions_reader_and_closure_unblocks_owner_erasure()
    {
        await using var scope = _services.CreateAsyncScope(); var sp = scope.ServiceProvider;
        var owner = await User(sp); var reviewer = await User(sp); var customers = sp.GetRequiredService<ICustomers>();
        var team = (await customers.Create(owner.Id, new("Lifecycle"), default)).Value!;
        Assert.True((await customers.Invite(owner.Id, team.Id, new("new-member@example.test", "Member"), default)).IsSuccess);
        var users = sp.GetRequiredService<UserManager<AppUser>>(); var invited = (await users.FindByEmailAsync("new-member@example.test"))!;
        Assert.False(invited.EmailConfirmed); Assert.Null(invited.PasswordHash); Assert.Equal("Reader", Assert.Single(await users.GetRolesAsync(invited)));
        var db = sp.GetRequiredService<FrameworkDb>(); var invitation = await db.Set<CustomerInviteRow>().SingleAsync();
        Assert.False((await customers.Accept(invited.Id, invitation.Id, default)).IsSuccess);
        Assert.Equal(2, await db.Outbox.CountAsync());
        Assert.False((await customers.Close(reviewer.Id, team.Id, team.Version, default)).IsSuccess);
        var version = (await customers.Find(owner.Id, team.Id, default))!.Version;
        Assert.True((await customers.Close(owner.Id, team.Id, version, default)).IsSuccess);
        Assert.Null(await customers.Find(owner.Id, team.Id, default)); Assert.Empty(await db.Set<CustomerInviteRow>().ToArrayAsync());
        var privacy = sp.GetRequiredService<PrivacyService>(); await privacy.RequestDeletion(owner.Id, default);
        Assert.True((await privacy.Review(reviewer.Id, new((await privacy.Status(owner.Id, default)).Request!.Id, true), default)).IsSuccess);
    }

    [Fact]
    [Trait("Category", "ReviewHardening")]
    public async Task Erasure_redacts_cached_subject_data_and_keeps_a_non_replayable_tombstone()
    {
        await using var scope = _services.CreateAsyncScope(); var sp = scope.ServiceProvider;
        var owner = await User(sp); var reviewer = await User(sp);
        sp.GetRequiredService<BackgroundExecutionContext>().ActorId = reviewer.Id;
        var unit = sp.GetRequiredService<IUnitOfWork>();
        var response = new UserDto(owner.Id, owner.Email!, "Private name", "en-ZA", false, [], Guid.NewGuid());
        await unit.Execute(() => Task.FromResult(Result<UserDto>.Success(response)), "review-key", "create", default);
        var privacy = sp.GetRequiredService<PrivacyService>(); await privacy.RequestDeletion(owner.Id, default);
        Assert.True((await privacy.Review(reviewer.Id, new((await privacy.Status(owner.Id, default)).Request!.Id, true), default)).IsSuccess);
        var db = sp.GetRequiredService<FrameworkDb>(); db.ChangeTracker.Clear();
        var cached = await db.Idempotency.SingleAsync(); Assert.True(cached.Erased); Assert.Equal("", cached.Response);
        var replay = await unit.Execute<UserDto>(() => throw new InvalidOperationException("Must not execute"), "review-key", "create", default);
        Assert.Equal("idempotency.erased", replay.Error!.Code);
    }

    [Fact]
    [Trait("Category", "ReviewHardening")]
    public async Task Retention_defers_one_failed_object_and_commits_other_files_and_notifications()
    {
        await using var scope = _services.CreateAsyncScope(); var sp = scope.ServiceProvider; var owner = await User(sp);
        var db = sp.GetRequiredService<FrameworkDb>(); var bad = Guid.NewGuid(); var good = Guid.NewGuid();
        db.Files.AddRange(new StoredFile { Id = bad, OwnerId = owner.Id, Name = "bad", Ready = true, CreatedAt = _clock.Now.AddDays(-50), DeletedAt = _clock.Now.AddDays(-40) },
            new StoredFile { Id = good, OwnerId = owner.Id, Name = "good", Ready = true, CreatedAt = _clock.Now.AddDays(-49), DeletedAt = _clock.Now.AddDays(-40) });
        db.Notifications.Add(new() { UserId = owner.Id, CreatedAt = _clock.Now.AddDays(-100) }); await db.SaveChangesAsync();
        var storage = new FailingPurge(bad.ToString("N"));
        var retention = new FileRetention(db, storage, sp.GetRequiredService<IConfiguration>(), _clock, NullLogger<FileRetention>.Instance);
        Assert.Equal(1, (await retention.Run(default)).Count);
        Assert.Empty(await db.Notifications.ToArrayAsync()); Assert.NotNull((await db.Files.FindAsync(good))!.PurgedAt);
        Assert.NotNull((await db.Files.FindAsync(bad))!.PurgeRetryAt);
        Assert.Equal(1, (await retention.Run(default)).Count); Assert.Equal(1, storage.Failures);
    }
    [Fact]
    [Trait("Category", "ReviewHardening")]
    public async Task Challenge_reader_waits_for_account_lock_without_blocking_erasure()
    {
        Guid subject; string raw;
        await using (var setup = _services.CreateAsyncScope())
        {
            var user = await User(setup.ServiceProvider); subject = user.Id;
            raw = await setup.ServiceProvider.GetRequiredService<SecurityService>().Challenge(user, "mfa-login", "code", null, default);
        }
        using var deadline = new CancellationTokenSource(TimeSpan.FromSeconds(10)); var ct = deadline.Token;
        await using var holder = _services.CreateAsyncScope(); var db = holder.ServiceProvider.GetRequiredService<FrameworkDb>();
        await using var transaction = await db.Database.BeginTransactionAsync(ct);
        await holder.ServiceProvider.GetRequiredService<SecurityService>().Lock(subject, ct);
        var pending = Task.Run(async () =>
        {
            await using var reader = _services.CreateAsyncScope(); var database = reader.ServiceProvider.GetRequiredService<FrameworkDb>();
            await using var tx = await database.Database.BeginTransactionAsync(ct);
            return await reader.ServiceProvider.GetRequiredService<SecurityService>().ReadChallenge(raw, "mfa-login", ct);
        }, ct);
        while (!await db.Database.SqlQueryRaw<bool>("SELECT EXISTS (SELECT 1 FROM pg_locks WHERE locktype = 'advisory' AND NOT granted) AS \"Value\"").SingleAsync(ct)) await Task.Delay(10, ct);
        // With the former row-before-account order this deletion cannot finish.
        await db.AuthChallenges.Where(x => x.UserId == subject).ExecuteDeleteAsync(ct);
        await transaction.CommitAsync(ct); Assert.Null(await pending);
    }

    [Fact]
    [Trait("Category", "ReviewHardening")]
    public async Task Mfa_policy_change_requires_recent_proof_and_does_not_change_state_on_failure()
    {
        await using var scope = _services.CreateAsyncScope(); var sp = scope.ServiceProvider; var user = await User(sp);
        var security = sp.GetRequiredService<SecurityService>();
        Assert.Equal("auth.reauthentication_required", (await security.SetPolicy(user.Id, new("Everyone", Guid.Empty), default)).Error!.Code);
        var db = sp.GetRequiredService<FrameworkDb>(); db.ChangeTracker.Clear(); Assert.Empty(await db.SecuritySettings.ToArrayAsync());
        await sp.GetRequiredService<AuthService>().CreateSession(user, "recent", true, default); await db.SaveChangesAsync();
        var session = await db.Sessions.SingleAsync();
        sp.GetRequiredService<IHttpContextAccessor>().HttpContext = new DefaultHttpContext { User = new(new System.Security.Claims.ClaimsIdentity([new("sid", session.Id.ToString())])) };
        Assert.True((await security.SetPolicy(user.Id, new("Everyone", Guid.Empty), default)).IsSuccess);
    }

    private sealed class FailingPurge(string bad) : IFileStorage
    {
        public int Failures { get; private set; }
        public Task Write(string key, Stream content, CancellationToken ct) => throw new NotSupportedException();
        public Task<Stream> Read(string key, CancellationToken ct) => throw new NotSupportedException();
        public Task Delete(string key, CancellationToken ct) { if (key == bad) { Failures++; throw new IOException("Unavailable"); } return Task.CompletedTask; }
    }

    [Fact]
    [Trait("Category", "ReviewHardening")]
    public async Task Administrator_passkey_policy_restricts_weak_sessions_and_uses_verification_timestamp()
    {
        await using var scope = _services.CreateAsyncScope(); var sp = scope.ServiceProvider; var user = await User(sp);
        sp.GetRequiredService<IConfiguration>()["Security:RequireAdministratorPasskey"] = "true";
        user.EmailMfaEnabled = true; await sp.GetRequiredService<FrameworkDb>().SaveChangesAsync();
        var security = sp.GetRequiredService<SecurityService>(); Assert.Empty(await security.ConfiguredMethods(user));
        var weak = await sp.GetRequiredService<AuthService>().CreateSession(user, "weak", true, default); Assert.True(weak.Access.SetupRequired);
        var strong = await sp.GetRequiredService<AuthService>().CreateSession(user, "strong", true, default, passkeyVerified: true);
        Assert.False(strong.Access.SetupRequired);
        var db = sp.GetRequiredService<FrameworkDb>(); await db.SaveChangesAsync();
        var session = await db.Sessions.SingleAsync(x => x.PasskeyVerified);
        session.CreatedAt = _clock.Now.AddDays(-2); await db.SaveChangesAsync();
        sp.GetRequiredService<IHttpContextAccessor>().HttpContext = new DefaultHttpContext { User = new(new System.Security.Claims.ClaimsIdentity([new("sid", session.Id.ToString())])) };
        Assert.True(await security.RecentlyVerified(user.Id, default));
        _clock.Now = _clock.Now.AddMinutes(6); Assert.False(await security.RecentlyVerified(user.Id, default));
    }

    [Fact]
    [Trait("Category", "ReviewHardening")]
    public async Task Organization_file_HTTP_endpoints_honor_the_files_feature_flag()
    {
        await using var scope = _services.CreateAsyncScope(); var sp = scope.ServiceProvider; var owner = await User(sp);
        var customer = (await sp.GetRequiredService<ICustomers>().Create(owner.Id, new("Flag test"), default)).Value!;
        var token = await sp.GetRequiredService<AuthService>().CreateSession(owner, "flag-test", true, default); await sp.GetRequiredService<FrameworkDb>().SaveChangesAsync();
        _configuration["Features:files:Enabled"] = "false";
        await using var factory = new ApiFactory(_configuration); using var client = factory.CreateClient(new() { BaseAddress = new("https://localhost") });
        client.DefaultRequestHeaders.Authorization = new("Bearer", token.Access.AccessToken);
        Assert.Equal(HttpStatusCode.NotFound, (await client.GetAsync($"/api/v1/auth/customers/{customer.Id}/files")).StatusCode);
    }
}
