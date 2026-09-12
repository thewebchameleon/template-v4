using System.Buffers.Binary;
using System.IO.Compression;
using System.Text.RegularExpressions;
using Microsoft.EntityFrameworkCore;
using TemplateV4.Application;
using TemplateV4.Infrastructure.Persistence;

namespace TemplateV4.Infrastructure.Security;

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
        if (request.AvatarBase64 is not null && (request.RemoveAvatar || !TryAvatar(request.AvatarBase64, out png)))
            return Result<Guid>.Fail("profile.avatar_invalid", ErrorKind.Validation);

        await using var tx = await db.Database.BeginTransactionAsync(ct);
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

    private static bool TryAvatar(string encoded, out byte[]? png)
    {
        png = null;
        if (encoded.Length > 349528) return false;
        byte[] content;
        try { content = Convert.FromBase64String(encoded); }
        catch (FormatException) { return false; }
        if (content.Length is < 57 or > 262144 || !content.AsSpan(0, 8).SequenceEqual(new byte[] { 137, 80, 78, 71, 13, 10, 26, 10 })) return false;
        // Only bounded, non-interlaced PNGs. Strip ancillary chunks, including uploaded metadata.
        using var clean = new MemoryStream(); clean.Write(content, 0, 8);
        using var compressed = new MemoryStream();
        var offset = 8; var hasHeader = false; var hasData = false; var stride = 0; var rows = 0;
        while (offset <= content.Length - 12)
        {
            var length = BinaryPrimitives.ReadUInt32BigEndian(content.AsSpan(offset, 4));
            if (length > content.Length - offset - 12) return false;
            var chunk = content.AsSpan(offset, (int)length + 12);
            var type = chunk.Slice(4, 4);
            if (Crc(chunk.Slice(4, (int)length + 4)) != BinaryPrimitives.ReadUInt32BigEndian(chunk[^4..])) return false;
            if (!hasHeader)
            {
                if (!type.SequenceEqual("IHDR"u8) || length != 13) return false;
                var width = BinaryPrimitives.ReadUInt32BigEndian(chunk.Slice(8, 4));
                var height = BinaryPrimitives.ReadUInt32BigEndian(chunk.Slice(12, 4));
                if (width is < 1 or > 256 || height is < 1 or > 256 || chunk[16] != 8 || chunk[17] is not (0 or 2 or 4 or 6) || chunk[18] != 0 || chunk[19] != 0 || chunk[20] != 0) return false;
                stride = (int)width * (chunk[17] switch { 0 => 1, 2 => 3, 4 => 2, _ => 4 }) + 1; rows = (int)height;
                hasHeader = true; clean.Write(chunk);
            }
            else if (type.SequenceEqual("IDAT"u8)) { hasData = true; clean.Write(chunk); compressed.Write(chunk.Slice(8, (int)length)); }
            else if (type.SequenceEqual("IEND"u8))
            {
                if (!hasData || length != 0 || offset + 12 != content.Length) return false;
                compressed.Position = 0;
                try
                {
                    using var inflater = new ZLibStream(compressed, CompressionMode.Decompress);
                    var row = new byte[stride];
                    for (var index = 0; index < rows; index++)
                    {
                        inflater.ReadExactly(row);
                        if (row[0] > 4) return false;
                    }
                    if (inflater.ReadByte() != -1) return false;
                }
                catch (Exception error) when (error is IOException or InvalidDataException) { return false; }
                clean.Write(chunk); png = clean.ToArray(); return true;
            }
            else if ((type[0] & 32) == 0) return false;
            offset += chunk.Length;
        }
        return false;
    }

    private static uint Crc(ReadOnlySpan<byte> value)
    {
        var crc = uint.MaxValue;
        foreach (var item in value)
        {
            crc ^= item;
            for (var bit = 0; bit < 8; bit++) crc = (crc >> 1) ^ ((crc & 1) == 0 ? 0 : 0xedb88320u);
        }
        return ~crc;
    }
}
