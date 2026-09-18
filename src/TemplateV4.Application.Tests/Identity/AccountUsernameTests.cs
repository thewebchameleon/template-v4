using TemplateV4.Infrastructure.Security;
using Xunit;

namespace TemplateV4.Application.Tests.Identity;

public sealed class AccountUsernameTests
{
    [Theory]
    [InlineData("person.one")]
    [InlineData("Person-2")]
    [InlineData("user_name")]
    public void Username_changes_accept_supported_sign_in_names(string username) =>
        Assert.True(AccountService.ValidUsername(username));

    [Theory]
    [InlineData("")]
    [InlineData("ab")]
    [InlineData("person@example.com")]
    [InlineData("person name")]
    [InlineData("abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklm")]
    public void Username_changes_reject_unsupported_sign_in_names(string username) =>
        Assert.False(AccountService.ValidUsername(username));
}
