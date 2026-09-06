using TemplateV4.Application;
using TemplateV4.Application.Users;
using TemplateV4.Domain.Users;
using TemplateV4.Infrastructure.Security;
using Xunit;

namespace TemplateV4.Application.Tests;

public sealed class FoundationTests
{
    [Fact]
    public void First_scheduled_job_accepts_absent_optional_metadata()
    {
        var map = new Quartz.JobDataMap();
        Assert.Null(TemplateV4.BackgroundWorker.MaintenanceJob.ReadString(map, "attempt"));
        Assert.Null(TemplateV4.BackgroundWorker.MaintenanceJob.ReadString(map, "culture"));
        map["attempt"] = "2";
        Assert.Equal("2", TemplateV4.BackgroundWorker.MaintenanceJob.ReadString(map, "attempt"));
    }
    [Fact]
    public void Domain_has_no_framework_dependencies()
    {
        var references = typeof(UserProfile).Assembly.GetReferencedAssemblies();
        Assert.All(references, reference => Assert.StartsWith("System", reference.Name!, StringComparison.Ordinal));
    }
    [Fact]
    public void Application_does_not_reference_infrastructure_or_hosting()
    {
        Assert.All(typeof(CreateUser).Assembly.GetReferencedAssemblies(), reference =>
            Assert.True(reference.Name!.StartsWith("System", StringComparison.Ordinal) || reference.Name is "TemplateV4.Domain" or "TemplateV4.SharedKernel"));
    }
    [Fact]
    public void User_creation_records_domain_event_and_updates_concurrency_token()
    {
        var user = UserProfile.Create(Guid.NewGuid(), " Jane ", "en-ZA");
        Assert.Equal("Jane", user.DisplayName); Assert.IsType<UserProvisioned>(Assert.Single(user.Events));
        var version = user.Version; user.SetDisabled(true); Assert.NotEqual(version, user.Version);
    }
    [Theory]
    [InlineData("bad", "", "fr-FR", "Owner")]
    [InlineData("", "Jane", "en-ZA", "Reader")]
    public void Validation_rejects_invalid_user_input(string email, string name, string culture, string role)
    { Assert.NotEmpty(new CreateUserValidator(CultureCatalog.Examples).Validate(new(email, name, culture, [role]))); }
    [Fact]
    public void Refresh_hash_does_not_store_plaintext()
    { Assert.Equal(64, AuthService.Hash("secret-token").Length); Assert.NotEqual(AuthService.Hash("secret-token"), AuthService.Hash("different-token")); }
}
