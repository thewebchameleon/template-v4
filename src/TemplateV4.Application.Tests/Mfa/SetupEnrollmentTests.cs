using TemplateV4.Infrastructure.Security;
using TemplateV4.Infrastructure.Persistence;
using Xunit;

namespace TemplateV4.Application.Tests.Mfa;

public sealed class SetupEnrollmentTests
{
    [Fact]
    public void Recent_setup_login_authorizes_enrollment_but_token_refresh_does_not_extend_it()
    {
        var now = DateTimeOffset.UtcNow;
        var user = new AppUser { Id = Guid.NewGuid(), SecurityStamp = "current-stamp" };
        var session = SetupSession(user, now);
        Assert.True(SecurityService.IsRecentSetupSession(session, user, now));
        Assert.False(SecurityService.IsRecentSetupSession(session, user, now.AddMinutes(5)));
    }

    [Theory]
    [InlineData("ordinary")]
    [InlineData("completed")]
    [InlineData("revoked")]
    [InlineData("expired")]
    [InlineData("different-user")]
    [InlineData("changed-password")]
    public void Enrollment_rejects_sessions_without_current_setup_authority(string state)
    {
        var now = DateTimeOffset.UtcNow;
        var user = new AppUser { Id = Guid.NewGuid(), SecurityStamp = "current-stamp" };
        var session = SetupSession(user, now);
        switch (state)
        {
            case "ordinary": session.SetupOnly = false; break;
            case "completed": session.MfaVerified = true; break;
            case "revoked": session.RevokedAt = now; break;
            case "expired": session.ExpiresAt = now; break;
            case "different-user": session.UserId = Guid.NewGuid(); break;
            case "changed-password": user.SecurityStamp = "new-stamp"; break;
        }
        Assert.False(SecurityService.IsRecentSetupSession(session, user, now));
    }

    private static Session SetupSession(AppUser user, DateTimeOffset now) => new()
    {
        UserId = user.Id,
        SecurityStamp = user.SecurityStamp!,
        SetupOnly = true,
        CreatedAt = now.AddMinutes(-1),
        ExpiresAt = now.AddDays(30)
    };
}
