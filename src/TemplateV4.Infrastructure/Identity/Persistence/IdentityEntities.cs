using Microsoft.AspNetCore.Identity;

namespace TemplateV4.Infrastructure.Persistence;

public sealed class AppUser : IdentityUser<Guid>
{
    public string RegistrationState { get; set; } = "NotRequired";
    public DateTimeOffset? RegistrationReviewedAt { get; set; }
    public Guid? RegistrationReviewedBy { get; set; }
    public long? StorageQuotaBytes { get; set; }
    public DateTimeOffset? InvitationSentAt { get; set; }
    public DateTimeOffset? InvitationExpiresAt { get; set; }
    public DateTimeOffset? InvitationAcceptedAt { get; set; }
    public DateTimeOffset? InvitationCancelledAt { get; set; }
    public bool OptionalEmailEnabled { get; set; }
    public bool PushEnabled { get; set; }
    public bool PushShowPreview { get; set; }
    public long LastTotpStep { get; set; } = -1;
    public bool EmailMfaEnabled { get; set; }
    public string PreferredMfaMethod { get; set; } = "Email";
    public int EmailMfaFailedAttempts { get; set; }
    public DateTimeOffset? EmailMfaLockedUntil { get; set; }
    public DateTimeOffset? EmailMfaLastSentAt { get; set; }
}
public sealed class SecuritySettings
{
    public int Id { get; set; } = 1;
    public string MfaPolicy { get; set; } = "Administrators";
    public bool RegistrationEnabled { get; set; }
    public bool RegistrationApprovalRequired { get; set; }
    public DateTimeOffset? BootstrapCompletedAt { get; set; }
    public Guid Version { get; set; } = Guid.NewGuid();
}
public sealed class RateBucket
{
    public string Id { get; set; } = "";
    public int Count { get; set; }
    public DateTimeOffset ExpiresAt { get; set; }
}
public sealed class AuthChallenge
{
    public string Id { get; set; } = "";
    public Guid? UserId { get; set; }
    public string Purpose { get; set; } = "";
    public string State { get; set; } = "";
    public string SecurityStamp { get; set; } = "";
    public string Device { get; set; } = "";
    public DateTimeOffset ExpiresAt { get; set; }
}
public sealed class Session
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UserId { get; set; }
    public string SecurityStamp { get; set; } = "";
    public string Device { get; set; } = "";
    public string IpAddress { get; set; } = "";
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset LastActivityAt { get; set; }
    public DateTimeOffset ExpiresAt { get; set; }
    public DateTimeOffset? RevokedAt { get; set; }
    public bool MfaVerified { get; set; }
    public DateTimeOffset? MfaVerifiedAt { get; set; }
    public bool PasskeyVerified { get; set; }
    public bool SetupOnly { get; set; }
}
public sealed class RefreshToken
{
    public string Hash { get; set; } = "";
    public Guid SessionId { get; set; }
    public DateTimeOffset ExpiresAt { get; set; }
    public DateTimeOffset? ConsumedAt { get; set; }
}
public sealed class PasskeyDevice
{
    public byte[] CredentialId { get; set; } = [];
    public Guid UserId { get; set; }
    public Guid DeviceId { get; set; }
}
