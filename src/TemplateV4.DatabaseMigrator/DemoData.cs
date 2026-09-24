using Microsoft.EntityFrameworkCore;
using TemplateV4.Application.Modules;
using TemplateV4.Domain.Users;
using TemplateV4.Infrastructure.Persistence;

internal static class DemoData
{
    public static async Task SeedAccount(FrameworkDb db)
    {
        if (await db.Users.AnyAsync(x => x.Id == DemoDataIds.Participant)) return;
        // This participant anchors sample workflows but has no password or sign-in access.
        db.Users.Add(new AppUser
        {
            Id = DemoDataIds.Participant,
            UserName = "demo.participant.8ad94c4a",
            NormalizedUserName = "DEMO.PARTICIPANT.8AD94C4A",
            Email = "demo.participant.8ad94c4a@example.invalid",
            NormalizedEmail = "DEMO.PARTICIPANT.8AD94C4A@EXAMPLE.INVALID",
            EmailConfirmed = true
        });
        var profile = UserProfile.Create(DemoDataIds.Participant, "Demo Participant", "en-ZA", invitationRequired: false);
        profile.SetDisabled(true);
        db.Profiles.Add(profile);
        await db.SaveChangesAsync();
    }
}
