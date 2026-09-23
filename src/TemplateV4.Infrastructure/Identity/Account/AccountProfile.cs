using System.Text.RegularExpressions;
using Microsoft.EntityFrameworkCore;
using TemplateV4.Application.FileStorage;
using TemplateV4.Infrastructure.Images;
using TemplateV4.Infrastructure.Persistence;

namespace TemplateV4.Infrastructure.Security;

public sealed class AvatarStorageUsage(FrameworkDb db) : IStorageUsageSource
{
    public Task<long> Read(CancellationToken ct) => db.Set<UserAvatar>().SumAsync(x => (long)x.Png.Length, ct);
}

public sealed record UpdateProfileRequest(string DisplayName, string? FirstName, string? LastName, string? PhoneNumber,
    string Culture, string TimeZone, Guid Version, string? AvatarBase64 = null, bool RemoveAvatar = false);
public sealed record ProfileOptions(string[] Cultures, string[] TimeZones);

public sealed partial class AccountService
{
    // IANA identifiers are understood by both Intl in browsers and .NET on Windows/Linux.
    private static readonly string[] TimeZones = TimeZoneInfo.GetSystemTimeZones()
        .Select(x => x.HasIanaId ? x.Id : TimeZoneInfo.TryConvertWindowsIdToIanaId(x.Id, out var id) ? id : null)
        .OfType<string>().Append("UTC").Distinct(StringComparer.Ordinal).Order(StringComparer.Ordinal).ToArray();

    public ProfileOptions GetProfileOptions() => new(cultures.Supported.ToArray(), TimeZones);

    public async Task<Result<Guid>> UpdateProfile(Guid actor, UpdateProfileRequest request, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(request.DisplayName) || request.DisplayName.Trim().Length > 120 ||
            request.FirstName?.Trim().Length > 100 || request.LastName?.Trim().Length > 100)
            return Result<Guid>.Fail("profile.name_invalid", ErrorKind.Validation);
        if (!cultures.Supported.Contains(request.Culture)) return Result<Guid>.Fail("culture.unsupported", ErrorKind.Validation);
        if (!TimeZones.Contains(request.TimeZone, StringComparer.Ordinal)) return Result<Guid>.Fail("profile.time_zone_invalid", ErrorKind.Validation);
        var phone = string.IsNullOrWhiteSpace(request.PhoneNumber) ? null : request.PhoneNumber.Trim();
        if (phone is not null && (phone.Length > 16 || !Regex.IsMatch(phone, @"^\+[1-9][0-9]{6,14}$", RegexOptions.CultureInvariant)))
            return Result<Guid>.Fail("profile.phone_invalid", ErrorKind.Validation);
        byte[]? png = null;
        if (request.AvatarBase64 is not null && (request.RemoveAvatar || !PngImage.TryNormalize(request.AvatarBase64, 256, 262144, out png)))
            return Result<Guid>.Fail("profile.avatar_invalid", ErrorKind.Validation);

        await using var tx = await db.Session.BeginTransactionAsync(ct);
        await db.Database.ExecuteSqlInterpolatedAsync($"SELECT pg_advisory_xact_lock(hashtextextended({actor.ToString()}, 0))", ct);
        var profile = await db.Profiles.SingleOrDefaultAsync(x => x.Id == actor && !x.Disabled, ct);
        if (profile is null) return Result<Guid>.Fail("user.not_found", ErrorKind.NotFound);
        await db.Entry(profile).ReloadAsync(ct);
        if (profile.Version != request.Version) return Result<Guid>.Fail("concurrency.conflict", ErrorKind.Conflict);
        var user = await db.Users.SingleAsync(x => x.Id == actor, ct);
        await db.Entry(user).ReloadAsync(ct);
        profile.Update(request.DisplayName, request.FirstName, request.LastName, request.Culture, request.TimeZone);
        // Contact only. Changing this field never asserts possession or enables an MFA method.
        if (user.PhoneNumber != phone) { user.PhoneNumber = phone; user.PhoneNumberConfirmed = false; }
        if (png is not null || request.RemoveAvatar)
        {
            var avatar = await db.Set<UserAvatar>().SingleOrDefaultAsync(x => x.UserId == actor, ct);
            if (png is not null && !await storageQuota.Fits(avatar?.Png.LongLength ?? 0, png.LongLength, ct))
                return Result<Guid>.Fail("files.quota", ErrorKind.Conflict);
            if (request.RemoveAvatar) { if (avatar is not null) db.Remove(avatar); }
            else if (avatar is null) db.Add(new UserAvatar { UserId = actor, Png = png! });
            else avatar.Png = png!;
        }
        db.Audit.Add(new() { ActorId = actor, SubjectId = actor, Action = "profile.updated", At = time.GetUtcNow() });
        try { await db.SaveChangesAsync(ct); }
        catch (DbUpdateConcurrencyException) { return Result<Guid>.Fail("concurrency.conflict", ErrorKind.Conflict); }
        await tx.CommitAsync(ct);
        return Result<Guid>.Success(profile.Version);
    }

}
