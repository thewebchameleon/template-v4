using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using TemplateV4.Application.Customers;
using TemplateV4.Infrastructure.Persistence;
using Xunit;

namespace TemplateV4.Application.Tests;

public sealed partial class SecurityAndMessagingTests
{
    [Fact]
    public async Task Organisation_selection_persists_and_revalidates_membership_across_scopes()
    {
        Guid actor; Guid first; Guid second;
        await using (var scope = _services.CreateAsyncScope())
        {
            var sp = scope.ServiceProvider; var admin = await User(sp); var member = await User(sp);
            actor = member.Id;
            await sp.GetRequiredService<UserManager<AppUser>>().RemoveFromRoleAsync(member, "Administrator");
            var customers = sp.GetRequiredService<ICustomers>();
            first = (await customers.Create(admin.Id, new("First"), default)).Value!.Id;
            second = (await customers.Create(admin.Id, new("Second"), default)).Value!.Id;
            Assert.False((await customers.Select(actor, first, default)).IsSuccess);
            Assert.True((await customers.Invite(admin.Id, first, new(member.Email!, "Member"), default)).IsSuccess);
            Assert.Equal(first, (await customers.Home(actor, default)).Value!.CurrentOrganisationId);
            Assert.True((await customers.Invite(admin.Id, second, new(member.Email!, "Member"), default)).IsSuccess);
            Assert.True((await customers.Select(actor, second, default)).IsSuccess);
            Assert.Empty((await customers.Home(actor, default)).Value!.Invitations);
        }
        await using (var scope = _services.CreateAsyncScope())
        {
            var sp = scope.ServiceProvider; var customers = sp.GetRequiredService<ICustomers>();
            Assert.Equal(second, (await customers.Home(actor, default)).Value!.CurrentOrganisationId);
            Assert.False((await customers.Select(actor, Guid.NewGuid(), default)).IsSuccess);
            Assert.Equal(second, (await customers.Home(actor, default)).Value!.CurrentOrganisationId);
            var admin = await User(sp);
            var version = (await customers.Administration(admin.Id, default)).Value!.Accounts.Single(x => x.Id == second).Version;
            Assert.True((await customers.Remove(admin.Id, second, actor, version, default)).IsSuccess);
            Assert.False((await customers.Select(actor, second, default)).IsSuccess);
            Assert.Equal(first, (await customers.Home(actor, default)).Value!.CurrentOrganisationId);
            version = (await customers.Administration(admin.Id, default)).Value!.Accounts.Single(x => x.Id == first).Version;
            Assert.True((await customers.Close(admin.Id, first, version, default)).IsSuccess);
            Assert.Null((await customers.Home(actor, default)).Value!.CurrentOrganisationId);
        }
    }

    [Fact]
    public async Task Organisation_management_requires_system_admin_without_granting_module_access()
    {
        await using var scope = _services.CreateAsyncScope(); var sp = scope.ServiceProvider;
        var creator = await User(sp); var administrator = await User(sp); var member = await User(sp);
        var users = sp.GetRequiredService<UserManager<AppUser>>();
        await users.RemoveFromRoleAsync(member, "Administrator");
        var customers = sp.GetRequiredService<ICustomers>();
        var team = (await customers.Create(creator.Id, new("Managed"), default)).Value!;
        Assert.Null(await customers.Find(administrator.Id, team.Id, default));
        Assert.False((await customers.Select(administrator.Id, team.Id, default)).IsSuccess);
        Assert.Contains((await customers.Administration(administrator.Id, default)).Value!.Accounts, x => x.Id == team.Id);
        Assert.True((await customers.Rename(administrator.Id, team.Id, new("Renamed", team.Version), default)).IsSuccess);
        Assert.True((await customers.Invite(administrator.Id, team.Id, new(member.Email!, "Admin"), default)).IsSuccess);
        var current = (await customers.Find(member.Id, team.Id, default))!;
        Assert.False((await customers.Create(member.Id, new("Denied"), default)).IsSuccess);
        Assert.False((await customers.Administration(member.Id, default)).IsSuccess);
        Assert.False((await customers.Rename(member.Id, team.Id, new("Denied", current.Version), default)).IsSuccess);
        Assert.False((await customers.Invite(member.Id, team.Id, new(creator.Email!, "Member"), default)).IsSuccess);
        Assert.False((await customers.Remove(member.Id, team.Id, member.Id, current.Version, default)).IsSuccess);
        Assert.False((await customers.Transfer(member.Id, team.Id, member.Id, current.Version, default)).IsSuccess);
        Assert.False((await customers.Close(member.Id, team.Id, current.Version, default)).IsSuccess);
        Assert.True((await customers.Transfer(administrator.Id, team.Id, member.Id, current.Version, default)).IsSuccess);
        current = (await customers.Find(member.Id, team.Id, default))!;
        Assert.Equal("Owner", current.Role);
        Assert.False((await customers.Rename(member.Id, team.Id, new("Denied owner", current.Version), default)).IsSuccess);
        Assert.False((await customers.Close(member.Id, team.Id, current.Version, default)).IsSuccess);
        Assert.True((await customers.Close(administrator.Id, team.Id, current.Version, default)).IsSuccess);
        Assert.Null(await customers.Find(member.Id, team.Id, default));
    }
}
