using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using TemplateV4.Application.Cms;
using TemplateV4.Application.Modules;
using TemplateV4.Application.Users;
using TemplateV4.Infrastructure.Persistence;
using IExecutionContext = TemplateV4.SharedKernel.IExecutionContext;

namespace TemplateV4.Infrastructure.Cms;

public sealed class CmsSectionsRow
{
    public int Id { get; set; } = 1;
    public Guid Version { get; set; }
    public string Draft { get; set; } = "[]";
    public string Published { get; set; } = "[]";
}
public sealed class CmsSectionsStore(FrameworkDb db, IExecutionContext context, ICapabilities capabilities, TimeProvider time) : ICmsSections
{
    private static LandingSection[] Parse(string json) => JsonSerializer.Deserialize<LandingSection[]>(json)!;
    private static CmsSections View(CmsSectionsRow row) => new(row.Version, Parse(row.Draft), Parse(row.Published));
    private async Task<bool> Allowed(CancellationToken ct) => context.ActorId is not null && context.Permissions.Contains(Permissions.CmsEdit) && await capabilities.Enabled(CapabilityIds.Cms, ct);
    public async Task<Result<CmsSections>> Read(CancellationToken ct) => !await Allowed(ct)
        ? Result<CmsSections>.Fail("access.forbidden", ErrorKind.Forbidden)
        : Result<CmsSections>.Success(View(await db.Set<CmsSectionsRow>().AsNoTracking().SingleAsync(ct)));
    public Task<Result<CmsSections>> Save(SaveCmsSections request, CancellationToken ct)
    {
        if (request.Sections is null || request.Sections.Length > 12 || request.Sections.Select(x => x?.Key).Distinct().Count() != request.Sections.Length ||
            request.Sections.Any(x => x is null || x.Key is not ("hero" or "about" or "services" or "testimonials" or "contact") ||
                string.IsNullOrWhiteSpace(x.Heading) || x.Heading.Length > 200 || string.IsNullOrWhiteSpace(x.Text) || x.Text.Length > 4000 ||
                x.ImageUrl is null || x.ImageAlt is null || x.ImageAlt.Length > 200 ||
                x.ImageUrl.Length > 0 && (!ValidImage(x.ImageUrl) || string.IsNullOrWhiteSpace(x.ImageAlt))))
            return Task.FromResult(Result<CmsSections>.Fail("validation.failed", ErrorKind.Validation));
        return Update(request.Version, row => row.Draft = JsonSerializer.Serialize(request.Sections), "cms.sections_saved", ct);
    }
    private static bool ValidImage(string value) => value.Length <= 2048 &&
        (value.StartsWith("/api/v1/website/images/", StringComparison.Ordinal) && Guid.TryParse(value["/api/v1/website/images/".Length..], out _) ||
        Uri.TryCreate(value, UriKind.Absolute, out var uri) && uri.Scheme == "https" && uri.UserInfo == "");
    public Task<Result<CmsSections>> Publish(PublishCmsSections request, CancellationToken ct) => Update(request.Version, row => row.Published = row.Draft, "cms.sections_published", ct);
    private async Task<Result<CmsSections>> Update(Guid version, Action<CmsSectionsRow> apply, string action, CancellationToken ct)
    {
        if (!await Allowed(ct)) return Result<CmsSections>.Fail("access.forbidden", ErrorKind.Forbidden);
        await using var tx = await db.Database.BeginTransactionAsync(ct);
        var row = await db.Set<CmsSectionsRow>().SingleAsync(ct);
        if (row.Version != version) return Result<CmsSections>.Fail("concurrency.conflict", ErrorKind.Conflict);
        apply(row); row.Version = Guid.NewGuid();
        db.Audit.Add(new() { ActorId = context.ActorId, Action = action, At = time.GetUtcNow() });
        try { await db.SaveChangesAsync(ct); await tx.CommitAsync(ct); }
        catch (DbUpdateConcurrencyException) { await tx.RollbackAsync(ct); db.ChangeTracker.Clear(); return Result<CmsSections>.Fail("concurrency.conflict", ErrorKind.Conflict); }
        return Result<CmsSections>.Success(View(row));
    }
    public async Task<Result<LandingSection[]>> Public(CancellationToken ct) => !await capabilities.Enabled(CapabilityIds.Cms, ct)
        ? Result<LandingSection[]>.Fail("resource.not_found", ErrorKind.NotFound)
        : Result<LandingSection[]>.Success(Parse((await db.Set<CmsSectionsRow>().AsNoTracking().SingleAsync(ct)).Published));
}
