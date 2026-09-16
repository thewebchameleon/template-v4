using TemplateV4.Application.Platform;

namespace TemplateV4.Application.Licensing;

public sealed record LicensedComponent(string Id, string Version, string Digest);
public sealed record ModuleAllowance(string Id, DateTimeOffset? UseUntil, DateTimeOffset? UpdatesUntil,
    string ExpiryPolicy, string InstalledVersion, string InstalledDigest);
public sealed record DeploymentLicense(int SchemaVersion, Guid OrganizationId, Guid DeploymentId, long Revision,
    DateTimeOffset IssuedAt, DateTimeOffset ValidUntil, ModuleAllowance[] Modules);
public sealed record SignedDeploymentLicense(string Payload, string Signature);
public sealed record DeploymentHeartbeat(LicensedComponent[] Components, string Health);
public sealed record LicenseStatus(bool Configured, DateTimeOffset? VerifiedAt, string Status, ModuleLicenseStatus[] Modules);
public sealed record ModuleLicenseStatus(string Id, bool CanUse, bool CanUpdate, string Status);
public interface IModuleLicenses
{
    Task<LicenseStatus> Read(CancellationToken ct);
}

/// <summary>Pure license decisions. Data authorization and runtime activation remain independent.</summary>
public static class LicensePolicy
{
    public static bool Fresh(DeploymentLicense license, DateTimeOffset now) => license.SchemaVersion == 1 &&
        license.IssuedAt <= now && now < license.ValidUntil &&
        license.ValidUntil <= license.IssuedAt.AddHours(24) && license.ValidUntil > license.IssuedAt;

    public static ModuleLicenseStatus Evaluate(string id, LicensedComponent? installed, ModuleAllowance? allowance,
        bool fresh, DateTimeOffset now)
    {
        if (!fresh) return new(id, false, false, "unavailable");
        if (allowance is null || installed is null) return new(id, false, false, "unlicensed");
        if (allowance.ExpiryPolicy is not ("disable" or "keep-installed")) return new(id, false, false, "invalid");
        var useActive = allowance.UseUntil is null || now < allowance.UseUntil;
        var updatesActive = useActive && (allowance.UpdatesUntil is null || now < allowance.UpdatesUntil);
        var pinned = installed.Version == allowance.InstalledVersion && installed.Digest == allowance.InstalledDigest;
        // Once update rights expire, only the recorded deployment-specific artifact remains usable.
        var canUse = (useActive && (updatesActive || pinned)) || (!useActive && allowance.ExpiryPolicy == "keep-installed" && pinned);
        return new(id, canUse, updatesActive, canUse ? updatesActive ? "active" : "frozen" : "expired");
    }

    public static LicensedComponent[] Components(InstalledRelease installed) => installed.Components
        .Select(x => new LicensedComponent(x.Id, x.Version, x.Artifact?.Sha256 ?? x.Commit)).ToArray();
}
