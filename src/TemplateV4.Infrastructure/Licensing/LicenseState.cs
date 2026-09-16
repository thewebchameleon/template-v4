namespace TemplateV4.Infrastructure.Licensing;

public sealed class LicenseState
{
    public int Id { get; set; } = 1;
    public Guid DeploymentId { get; set; }
    public long Revision { get; set; }
    public string Payload { get; set; } = "";
    public string Signature { get; set; } = "";
    public DateTimeOffset VerifiedAt { get; set; }
}
