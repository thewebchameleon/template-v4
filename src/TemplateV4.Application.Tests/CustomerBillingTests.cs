using System.Net;
using System.Net.Http.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using TemplateV4.Application.Billing;
using TemplateV4.Application.Customers;
using TemplateV4.Infrastructure.Billing;
using TemplateV4.Infrastructure.Persistence;
using TemplateV4.Infrastructure.Security;
using TemplateV4.Infrastructure.Storage;
using Xunit;

namespace TemplateV4.Application.Tests;

public sealed partial class SecurityAndMessagingTests
{
    [Fact]
    public async Task Customer_privacy_blocks_owner_erasure_and_exports_only_the_users_memberships()
    {
        await using var scope = _services.CreateAsyncScope(); var sp = scope.ServiceProvider;
        var owner = await User(sp); var reviewer = await User(sp);
        var customers = sp.GetRequiredService<ICustomers>(); var team = (await customers.Create(owner.Id, new("Owned team"), default)).Value!;
        var privacy = sp.GetRequiredService<PrivacyService>();
        var export = System.Text.Encoding.UTF8.GetString(await privacy.Export(owner.Id, default)); Assert.Contains(team.Id.ToString(), export);
        var otherExport = System.Text.Encoding.UTF8.GetString(await privacy.Export(reviewer.Id, default)); Assert.DoesNotContain(team.Id.ToString(), otherExport);
        Assert.True((await privacy.RequestDeletion(owner.Id, default)).IsSuccess);
        var request = (await privacy.Status(owner.Id, default)).Request!;
        Assert.Equal("customers.deletion_obligations", (await privacy.Review(reviewer.Id, new(request.Id, true), default)).Error!.Code);
        Assert.NotNull(await customers.Find(owner.Id, team.Id, default));
    }

    [Fact]
    public async Task Billing_worker_recovers_abandoned_checkout_without_provider_credentials()
    {
        await using var scope = _services.CreateAsyncScope(); var sp = scope.ServiceProvider; var owner = await User(sp);
        var customer = (await sp.GetRequiredService<ICustomers>().Create(owner.Id, new("Abandoned checkout"), default)).Value!.Id;
        var db = sp.GetRequiredService<FrameworkDb>(); var id = Guid.NewGuid();
        db.Set<PaymentOrderRow>().Add(new() { Id = id, CustomerId = customer, Provider = "payfast", PlanId = "standard", UnitMinor = 9900, Quantity = 1, CreatedAt = _clock.Now.AddDays(-2) });
        db.Set<SubscriptionRow>().Add(new() { CustomerId = customer, OrderId = id, NextCheckAt = _clock.Now.AddMinutes(-1) }); await db.SaveChangesAsync();
        await sp.GetRequiredService<BillingStore>().Reconcile(customer, default); db.ChangeTracker.Clear();
        Assert.True((await db.Set<PaymentOrderRow>().SingleAsync()).Abandoned);
        Assert.Null((await db.Set<SubscriptionRow>().SingleAsync()).OrderId);
    }

    [Fact]
    public async Task Customer_memberships_isolate_global_admins_and_serialize_ownership_transfer()
    {
        Guid owner; Guid member; Guid other; Guid organization; Guid version;
        await using (var scope = _services.CreateAsyncScope())
        {
            var sp = scope.ServiceProvider; var a = await User(sp); var b = await User(sp); var c = await User(sp);
            owner = a.Id; member = b.Id; other = c.Id;
            var customers = sp.GetRequiredService<ICustomers>();
            var home = (await customers.Home(owner, default)).Value!;
            Assert.Equal(owner, Assert.Single(home.Accounts).Id);
            organization = (await customers.Create(owner, new("Team A"), default)).Value!.Id;
            Assert.Null(await customers.Find(other, organization, default));
            Assert.False((await customers.Members(other, organization, 1, 10, "name", "asc", default)).IsSuccess);
            Assert.True((await customers.Invite(owner, organization, new(b.Email!, "Member"), default)).IsSuccess);
            var invite = Assert.Single((await customers.Home(member, default)).Value!.Invitations);
            Assert.False((await customers.Accept(other, invite.Id, default)).IsSuccess);
            Assert.True((await customers.Accept(member, invite.Id, default)).IsSuccess);
            Assert.False((await customers.Accept(member, invite.Id, default)).IsSuccess);
            Assert.False((await customers.Invite(member, organization, new(c.Email!, "Admin"), default)).IsSuccess);
            version = (await customers.Find(owner, organization, default))!.Version;
            Assert.Equal("customers.last_owner", (await customers.Remove(owner, organization, owner, version, default)).Error!.Code);
        }
        async Task<Result<Unit>> Transfer()
        {
            await using var scope = _services.CreateAsyncScope(); return await scope.ServiceProvider.GetRequiredService<ICustomers>().Transfer(owner, organization, member, version, default);
        }
        var results = await Task.WhenAll(Transfer(), Transfer()); Assert.Single(results, x => x.IsSuccess); Assert.Single(results, x => !x.IsSuccess);
        await using var check = _services.CreateAsyncScope(); var store = check.ServiceProvider.GetRequiredService<ICustomers>();
        var info = (await store.Find(member, organization, default))!; Assert.Equal("Owner", info.Role);
        Assert.Equal("Admin", (await store.Find(owner, organization, default))!.Role);
        Assert.True((await store.Remove(member, organization, owner, info.Version, default)).IsSuccess);
        Assert.Null(await store.Find(owner, organization, default));
    }

    [Fact]
    public async Task Customer_trials_and_paid_storage_fall_back_without_deleting_downloads()
    {
        await using var scope = _services.CreateAsyncScope(); var sp = scope.ServiceProvider; var owner = await User(sp); var other = await User(sp);
        var customers = sp.GetRequiredService<ICustomers>(); await customers.Home(owner.Id, default);
        var billing = sp.GetRequiredService<IBilling>(); var entitlements = sp.GetRequiredService<IStorageEntitlements>(); var files = sp.GetRequiredService<FileService>();
        Assert.False((await billing.Trial(other.Id, owner.Id, new("standard"), default)).IsSuccess);
        Assert.True((await billing.Trial(owner.Id, owner.Id, new("standard"), default)).IsSuccess);
        Assert.Equal(10L * 1024 * 1024 * 1024, await entitlements.Quota(owner.Id, default));
        Assert.Equal("billing.trial_used", (await billing.Trial(owner.Id, owner.Id, new("standard"), default)).Error!.Code);
        using var bytes = new MemoryStream(new byte[10]); var file = (await files.Upload(owner.Id, "preserved.bin", bytes, default)).Value!;
        var db = sp.GetRequiredService<FrameworkDb>();
        // A retained reservation simulates storage exceeding the free tier without writing a large test object.
        db.Files.Add(new() { OwnerId = owner.Id, Name = "reserved.bin", Size = 101L * 1024 * 1024, CreatedAt = _clock.Now }); await db.SaveChangesAsync();
        _clock.Now = _clock.Now.AddDays(15);
        Assert.Equal(100L * 1024 * 1024, await entitlements.Quota(owner.Id, default));
        using var upload = new MemoryStream(new byte[1]); Assert.Equal("files.quota", (await files.Upload(owner.Id, "denied.bin", upload, default)).Error!.Code);
        var download = await files.Download(owner.Id, file.Id, default); Assert.True(download.IsSuccess); await download.Value!.Content.DisposeAsync();
        var settings = await billing.Settings(default);
        Assert.True((await billing.SaveSettings(other.Id, settings with { Ownership = "Organization" }, default)).IsSuccess);
        Assert.False((await billing.Summary(owner.Id, owner.Id, default)).Value!.CanCheckout);
        Assert.True((await billing.Cancel(owner.Id, owner.Id, default)).IsSuccess);
    }

    [Fact]
    public async Task Billing_durable_receipts_deduplicate_and_reject_mismatches_and_seat_overcommit()
    {
        Guid customer; Guid orderId; Guid owner; Guid member; string email; DateTimeOffset paid;
        await using (var scope = _services.CreateAsyncScope())
        {
            var sp = scope.ServiceProvider; var a = await User(sp); var b = await User(sp); owner = a.Id; member = b.Id; email = b.Email!;
            customer = (await sp.GetRequiredService<ICustomers>().Create(owner, new("Paid team"), default)).Value!.Id;
            orderId = Guid.NewGuid(); paid = DateTimeOffset.FromUnixTimeSeconds(_clock.Now.AddMonths(1).ToUnixTimeSeconds());
            var db = sp.GetRequiredService<FrameworkDb>();
            db.Set<PaymentOrderRow>().Add(new() { Id = orderId, CustomerId = customer, PlanId = "team", Name = "Team", Provider = "stripe", UnitMinor = 4900, Quantity = 1, CreatedAt = _clock.Now });
            db.Set<SubscriptionRow>().Add(new() { CustomerId = customer, OrderId = orderId, Seats = 1 }); await db.SaveChangesAsync();
            await Assert.ThrowsAsync<PaymentProviderException>(() => sp.GetRequiredService<BillingStore>().Apply(orderId, "stripe", "bad", new("sub-test", "active", paid, 999, "ZAR"), default));
            await Assert.ThrowsAsync<PaymentProviderException>(() => sp.GetRequiredService<BillingStore>().Apply(orderId, "stripe", "bad-currency", new("sub-test", "active", paid, 4900, "USD"), default));
        }
        async Task Apply(string receipt, DateTimeOffset until) { await using var s = _services.CreateAsyncScope(); await s.ServiceProvider.GetRequiredService<BillingStore>().Apply(orderId, "stripe", receipt, new("sub-test", "active", until, 4900, "ZAR"), default); }
        await Task.WhenAll(Apply("evt-1", paid), Apply("evt-1", paid)); await Apply("evt-old", paid.AddMonths(-1));
        await using var check = _services.CreateAsyncScope(); var provider = check.ServiceProvider;
        var database = provider.GetRequiredService<FrameworkDb>(); var sub = await database.Set<SubscriptionRow>().AsNoTracking().SingleAsync(x => x.CustomerId == customer);
        Assert.Equal(paid, sub.PaidUntil); Assert.Equal(2, await database.Set<PaymentReceiptRow>().CountAsync());
        Assert.Equal(50L * 1024 * 1024 * 1024, await provider.GetRequiredService<IStorageEntitlements>().Quota(customer, default));
        var customers = provider.GetRequiredService<ICustomers>(); Assert.True((await customers.Invite(owner, customer, new(email, "Member"), default)).IsSuccess);
        var invite = Assert.Single((await customers.Home(member, default)).Value!.Invitations);
        Assert.Equal("billing.seats", (await customers.Accept(member, invite.Id, default)).Error!.Code);
        _clock.Now = paid.AddDays(6); Assert.Equal(50L * 1024 * 1024 * 1024, await provider.GetRequiredService<IStorageEntitlements>().Quota(customer, default));
        _clock.Now = paid.AddDays(8); Assert.Equal(100L * 1024 * 1024, await provider.GetRequiredService<IStorageEntitlements>().Quota(customer, default));
    }

    [Fact]
    public async Task Customer_shared_files_and_http_routes_recheck_membership_and_never_grant_global_admin_access()
    {
        await using var scope = _services.CreateAsyncScope(); var sp = scope.ServiceProvider; var owner = await User(sp); var other = await User(sp);
        var customers = sp.GetRequiredService<ICustomers>(); var customer = (await customers.Create(owner.Id, new("Files team"), default)).Value!;
        var files = sp.GetRequiredService<OrganizationFiles>(); using var content = new MemoryStream("private"u8.ToArray());
        Assert.True((await files.Upload(owner.Id, customer.Id, "private.txt", content, default)).IsSuccess);
        var listed = (await files.List(owner.Id, customer.Id, 1, 10, "name", "asc", default)).Value!; var file = Assert.Single(listed.Page.Items);
        Assert.False((await files.Download(other.Id, customer.Id, file.Id, default)).IsSuccess);
        Assert.False((await files.Delete(other.Id, customer.Id, file.Id, default)).IsSuccess);
        Assert.True((await customers.Invite(owner.Id, customer.Id, new(other.Email!, "Member"), default)).IsSuccess);
        var invite = Assert.Single((await customers.Home(other.Id, default)).Value!.Invitations); Assert.True((await customers.Accept(other.Id, invite.Id, default)).IsSuccess);
        var downloaded = await files.Download(other.Id, customer.Id, file.Id, default); Assert.True(downloaded.IsSuccess); await downloaded.Value!.Content.DisposeAsync();
        Assert.True((await customers.Remove(owner.Id, customer.Id, other.Id, (await customers.Find(owner.Id, customer.Id, default))!.Version, default)).IsSuccess);
        Assert.False((await files.Download(other.Id, customer.Id, file.Id, default)).IsSuccess);
        var token = await sp.GetRequiredService<AuthService>().CreateSession(other, "customer-test", true, default); await sp.GetRequiredService<FrameworkDb>().SaveChangesAsync();
        await using var factory = new ApiFactory(_configuration); using var client = factory.CreateClient(new() { BaseAddress = new("https://localhost") });
        Assert.Equal(HttpStatusCode.Unauthorized, (await client.GetAsync("/api/v1/auth/customers/")).StatusCode);
        client.DefaultRequestHeaders.Authorization = new("Bearer", token.Access.AccessToken);
        Assert.Equal(HttpStatusCode.NotFound, (await client.GetAsync($"/api/v1/auth/customers/{customer.Id}/billing")).StatusCode);
        Assert.Equal(HttpStatusCode.Forbidden, (await client.PostAsJsonAsync("/api/v1/auth/customers/", new CreateOrganization("No CSRF"))).StatusCode);
        Assert.Equal(HttpStatusCode.BadRequest, (await client.PostAsync("/api/v1/billing/callbacks/stripe", new StringContent("{}"))).StatusCode);
    }
}
