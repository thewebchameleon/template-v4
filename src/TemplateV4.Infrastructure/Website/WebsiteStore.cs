using System.Net.Mail;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using TemplateV4.Application.Modules;
using TemplateV4.Application.Users;
using TemplateV4.Application.Website;
using TemplateV4.Infrastructure.Persistence;
using IExecutionContext = TemplateV4.SharedKernel.IExecutionContext;

namespace TemplateV4.Infrastructure.Website;

public sealed class WebsiteStore(FrameworkDb db, IExecutionContext context, ICapabilities capabilities,
    IFileStorage storage, TimeProvider time) : IWebsite
{
    private static readonly JsonSerializerOptions Json = new(JsonSerializerDefaults.Web);
    private static readonly BusinessDetails Empty = new("", "", "", "#245c46", "", "", "", "", "", "", "");
    private static WebsiteSettings Read(WebsiteRow row) => new(row.Version,
        row.Configured ? JsonSerializer.Deserialize<BusinessDetails>(row.Details, Json)! : Empty,
        row.NotificationEmail, row.Configured, row.Enabled);
    public async Task<WebsiteSettings> Settings(CancellationToken ct) => Read(await db.Set<WebsiteRow>().AsNoTracking().SingleAsync(ct));
    public static bool Origin(string? value) => value is { Length: <= 2048 } && Uri.TryCreate(value, UriKind.Absolute, out var uri) &&
        uri.Scheme is "https" or "http" && uri.UserInfo == "" && uri.AbsolutePath == "/" && uri.Query == "" && uri.Fragment == "";
    public static bool ImageUrl(string? value) => value is { Length: > 0 and <= 2048 } &&
        (value.StartsWith("/api/v1/website/images/", StringComparison.Ordinal) && Guid.TryParse(value["/api/v1/website/images/".Length..], out _) ||
        Uri.TryCreate(value, UriKind.Absolute, out var uri) && uri.Scheme == "https" && uri.UserInfo == "");
    private static bool Email(string? value) => value is { Length: > 0 and <= 254 } && MailAddress.TryCreate(value, out var address) && address.Address == value;
    private static bool Text(string? value, int max) => !string.IsNullOrWhiteSpace(value) && value.Length <= max;
    public async Task<Result<WebsiteSettings>> Save(SaveWebsite request, CancellationToken ct)
    {
        if (context.ActorId is null || !context.Permissions.Contains(Permissions.Settings)) return Result<WebsiteSettings>.Fail("access.forbidden", ErrorKind.Forbidden);
        var d = request.Details;
        if (d is null || !Text(d.Name, 120) || !Text(d.Description, 1000) || !ImageUrl(d.LogoUrl) ||
            d.PrimaryColor is not { Length: 7 } || d.PrimaryColor[0] != '#' || !d.PrimaryColor[1..].All(char.IsAsciiHexDigit) ||
            !Email(d.Email) || !Text(d.Phone, 60) || !Text(d.Address, 500) || !Origin(d.PublicUrl) || !Origin(d.AdminUrl) ||
            string.Equals(d.PublicUrl.TrimEnd('/'), d.AdminUrl.TrimEnd('/'), StringComparison.OrdinalIgnoreCase) ||
            !Text(d.SeoTitle, 200) || !Text(d.SeoDescription, 500) || !Email(request.NotificationEmail))
            return Result<WebsiteSettings>.Fail("validation.failed", ErrorKind.Validation);
        return await Update(request.Version, row =>
        {
            row.Details = JsonSerializer.Serialize(d with { PublicUrl = d.PublicUrl.TrimEnd('/'), AdminUrl = d.AdminUrl.TrimEnd('/') }, Json); row.NotificationEmail = request.NotificationEmail;
            row.Configured = true;
        }, "website.configured", ct);
    }
    public Task<Result<WebsiteSettings>> Enable(SetWebsiteEnabled request, CancellationToken ct) =>
        Update(request.Version, row => row.Enabled = request.Enabled, request.Enabled ? "website.enabled" : "website.disabled", ct, request.Enabled);
    private async Task<Result<WebsiteSettings>> Update(Guid version, Action<WebsiteRow> update, string action, CancellationToken ct, bool requireConfigured = false)
    {
        if (context.ActorId is null || !context.Permissions.Contains(Permissions.Settings)) return Result<WebsiteSettings>.Fail("access.forbidden", ErrorKind.Forbidden);
        await using var tx = await db.Database.BeginTransactionAsync(ct);
        var row = await db.Set<WebsiteRow>().SingleAsync(ct);
        if (row.Version != version) return Result<WebsiteSettings>.Fail("concurrency.conflict", ErrorKind.Conflict);
        if (requireConfigured && !row.Configured) return Result<WebsiteSettings>.Fail("website.setup_required", ErrorKind.Validation);
        update(row); row.Version = Guid.NewGuid();
        db.Audit.Add(new() { ActorId = context.ActorId, Action = action, At = time.GetUtcNow() });
        try { await db.SaveChangesAsync(ct); await tx.CommitAsync(ct); }
        catch (DbUpdateConcurrencyException) { await tx.RollbackAsync(ct); db.ChangeTracker.Clear(); return Result<WebsiteSettings>.Fail("concurrency.conflict", ErrorKind.Conflict); }
        return Result<WebsiteSettings>.Success(Read(row));
    }
    public async Task<PublicWebsite> Public(CancellationToken ct)
    {
        var site = await Settings(ct);
        if (!site.Configured || !site.Enabled) return new(false, null, false, false);
        return new(true, site.Details, await capabilities.Enabled(CapabilityIds.Cms, ct), await capabilities.Enabled("contact", ct));
    }
    public async Task<string?> NotificationRecipient(CancellationToken ct)
    {
        var site = await Settings(ct);
        return site.Configured && site.Enabled ? site.NotificationEmail : null;
    }
    public async Task<Result<WebsiteImage>> Upload(byte[] bytes, CancellationToken ct)
    {
        if (context.ActorId is null || !context.Permissions.Contains(Permissions.Settings) &&
            !(context.Permissions.Contains(Permissions.CmsEdit) && await capabilities.Enabled(CapabilityIds.Cms, ct)))
            return Result<WebsiteImage>.Fail("access.forbidden", ErrorKind.Forbidden);
        if (bytes.Length is < 12 or > 1048576) return Result<WebsiteImage>.Fail("validation.failed", ErrorKind.Validation);
        var type = bytes.AsSpan(0, 8).SequenceEqual(new byte[] { 137, 80, 78, 71, 13, 10, 26, 10 }) ? "image/png" :
            bytes[0] == 255 && bytes[1] == 216 && bytes[2] == 255 ? "image/jpeg" :
            bytes.AsSpan(0, 4).SequenceEqual("RIFF"u8) && bytes.AsSpan(8, 4).SequenceEqual("WEBP"u8) ? "image/webp" : null;
        if (type is null) return Result<WebsiteImage>.Fail("validation.failed", ErrorKind.Validation);
        var id = Guid.NewGuid();
        await storage.Write(id.ToString("N"), new MemoryStream(bytes, writable: false), ct);
        db.Add(new WebsiteImageRow { Id = id, ContentType = type });
        db.Audit.Add(new() { ActorId = context.ActorId, SubjectId = id, Action = "website.image_uploaded", At = time.GetUtcNow() });
        try { await db.SaveChangesAsync(ct); }
        catch { await storage.Delete(id.ToString("N"), ct); throw; }
        return Result<WebsiteImage>.Success(new($"/api/v1/website/images/{id}"));
    }
    public async Task<(Stream Content, string ContentType)?> Image(Guid id, CancellationToken ct)
    {
        var row = await db.Set<WebsiteImageRow>().AsNoTracking().SingleOrDefaultAsync(x => x.Id == id, ct);
        return row is null ? null : (await storage.Read(id.ToString("N"), ct), row.ContentType);
    }
}
