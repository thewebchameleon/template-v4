using System.Globalization;
using Microsoft.EntityFrameworkCore;
using TemplateV4.Application.Platform;
using TemplateV4.Infrastructure.Persistence;

namespace TemplateV4.Infrastructure.Storage;

public sealed partial class FileStorageService
{
    private Task<long> Quota(Guid owner, CancellationToken ct) => capacity.Limit(ct);
    public Task<FileStorageSettings> Settings(CancellationToken ct) => db.FileStorageSettings.AsNoTracking().SingleAsync(ct);
    public async Task<Result<Unit>> SaveSettings(Guid actor, StorageSettingsRequest request, CancellationToken ct)
    {
        if (!ValidDefaultQuotaBytes(request.DefaultQuotaBytes) || !ValidMaxUploadBytes(request.MaxUploadBytes) || request.DemoExpiryMinutes is < 1 or > 525600) return Result.Fail("validation.failed", ErrorKind.Validation);
        await using var tx = await db.Database.BeginTransactionAsync(ct);
        var previous = await db.FileStorageSettings.FromSqlRaw("SELECT * FROM file_storage.file_storage_settings WHERE \"Id\" = 1 FOR UPDATE").AsNoTracking().SingleAsync(ct);
        var restartedAt = previous.DemoMode && previous.DemoExpiryMinutes != request.DemoExpiryMinutes ? time.GetUtcNow() : previous.DemoStartedAt;
        var changed = await db.FileStorageSettings.Where(x => x.Id == 1 && x.Version == request.Version).ExecuteUpdateAsync(x => x.SetProperty(s => s.DefaultQuotaBytes, request.DefaultQuotaBytes).SetProperty(s => s.MaxUploadBytes, request.MaxUploadBytes).SetProperty(s => s.DemoExpiryMinutes, request.DemoExpiryMinutes).SetProperty(s => s.DemoStartedAt, restartedAt).SetProperty(s => s.Version, Guid.NewGuid()), ct);
        if (changed == 0) return Result.Fail("files.settings_conflict", ErrorKind.Conflict);
        if (previous.DemoExpiryMinutes != request.DemoExpiryMinutes)
            db.Audit.Add(new() { ActorId = actor, Action = "file.demo_expiry_changed", SubjectType = "configuration", SubjectNameSnapshot = "storage", ChangesJson = AuditCapture.Changes(new AuditChange("demoExpiryMinutes", previous.DemoExpiryMinutes.ToString(CultureInfo.InvariantCulture), request.DemoExpiryMinutes.ToString(CultureInfo.InvariantCulture))), At = time.GetUtcNow() });
        if (previous.DefaultQuotaBytes != request.DefaultQuotaBytes)
            db.Audit.Add(new() { ActorId = actor, Action = "file.quota_default_changed", SubjectType = "configuration", SubjectNameSnapshot = "storage", ChangesJson = AuditCapture.Changes(new AuditChange("defaultQuotaBytes", previous.DefaultQuotaBytes.ToString(CultureInfo.InvariantCulture), request.DefaultQuotaBytes.ToString(CultureInfo.InvariantCulture))), At = time.GetUtcNow() });
        if (previous.MaxUploadBytes != request.MaxUploadBytes)
            db.Audit.Add(new() { ActorId = actor, Action = "file.max_upload_changed", SubjectType = "configuration", SubjectNameSnapshot = "storage", ChangesJson = AuditCapture.Changes(new AuditChange("maxUploadBytes", previous.MaxUploadBytes.ToString(CultureInfo.InvariantCulture), request.MaxUploadBytes.ToString(CultureInfo.InvariantCulture))), At = time.GetUtcNow() });
        await db.SaveChangesAsync(ct); await tx.CommitAsync(ct); return Result.Success();
    }
    private static bool ValidMaxUploadBytes(long bytes)
    {
        const long mb = 1024 * 1024;
        return bytes == 0
            || bytes is >= 5 * mb and <= 100 * mb && bytes % (5 * mb) == 0
            || bytes is >= 110 * mb and <= 200 * mb && bytes % (10 * mb) == 0
            || bytes is >= 250 * mb and <= 500 * mb && bytes % (50 * mb) == 0
            || bytes is >= 600 * mb and <= 1000 * mb && bytes % (100 * mb) == 0;
    }
    private static bool ValidDefaultQuotaBytes(long bytes)
    {
        const long mb = 1024 * 1024;
        return bytes == -1
            || bytes is >= 50 * mb and <= 100 * mb && bytes % (5 * mb) == 0
            || bytes is >= 110 * mb and <= 200 * mb && bytes % (10 * mb) == 0
            || bytes is >= 250 * mb and <= 500 * mb && bytes % (50 * mb) == 0
            || bytes is >= 600 * mb and <= 1000 * mb && bytes % (100 * mb) == 0
            || bytes is >= 1100 * mb and <= 5000 * mb && bytes % (100 * mb) == 0
            || bytes is >= 6000 * mb and <= 20000 * mb && bytes % (1000 * mb) == 0;
    }
}
