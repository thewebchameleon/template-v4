using Microsoft.EntityFrameworkCore;
using TemplateV4.Application.Billing;
using TemplateV4.Application.Customers;
using TemplateV4.Application.Users;
using TemplateV4.Infrastructure.Persistence;

namespace TemplateV4.Infrastructure.Storage;

public sealed class OrganizationFileRow
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid CustomerId { get; set; }
    public Guid? UploadedBy { get; set; }
    public string Name { get; set; } = "";
    public long Size { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public bool Ready { get; set; }
    public DateTimeOffset? DeletedAt { get; set; }
    public DateTimeOffset? PurgedAt { get; set; }
    public static string Key(Guid customer, Guid id) => customer.ToString("N") + "-" + id.ToString("N");
}
public sealed record OrganizationFileItem(Guid Id, string Name, long Size, DateTimeOffset CreatedAt);
public sealed record OrganizationFilePage(Page<OrganizationFileItem> Page, long UsedBytes, long QuotaBytes);
public sealed class OrganizationFiles(FrameworkDb db, ICustomerAccess customers, IStorageEntitlements entitlements, IFileStorage storage, TimeProvider time)
{
    private async Task<bool> Access(Guid actor, Guid customer, CancellationToken ct) => await customers.Find(actor, customer, ct) is { Kind: "Organization" };
    public async Task<Result<OrganizationFilePage>> List(Guid actor, Guid customer, int page, int size, string sort, string direction, CancellationToken ct)
    {
        if (page is < 1 or > 10000 || size is < 1 or > 100 || sort is not ("name" or "size" or "createdAt") || direction is not ("asc" or "desc")) return Result<OrganizationFilePage>.Fail("validation.failed", ErrorKind.Validation);
        if (!await Access(actor, customer, ct)) return Result<OrganizationFilePage>.Fail("customers.not_found", ErrorKind.NotFound);
        var all = db.Set<OrganizationFileRow>().AsNoTracking().Where(x => x.CustomerId == customer && x.Ready && x.DeletedAt == null);
        var total = await all.CountAsync(ct);
        var ordered = sort switch { "name" => direction == "asc" ? all.OrderBy(x => x.Name) : all.OrderByDescending(x => x.Name), "size" => direction == "asc" ? all.OrderBy(x => x.Size) : all.OrderByDescending(x => x.Size), _ => direction == "asc" ? all.OrderBy(x => x.CreatedAt) : all.OrderByDescending(x => x.CreatedAt) };
        var items = await ordered.ThenBy(x => x.Id).Skip((page - 1) * size).Take(size).Select(x => new OrganizationFileItem(x.Id, x.Name, x.Size, x.CreatedAt)).ToArrayAsync(ct);
        return Result<OrganizationFilePage>.Success(new(new(items, total, page, size), await db.Set<OrganizationFileRow>().Where(x => x.CustomerId == customer && x.PurgedAt == null).SumAsync(x => x.Size, ct), await entitlements.Quota(customer, ct) ?? 100L * 1024 * 1024));
    }
    public async Task<Result<Unit>> Upload(Guid actor, Guid customer, string name, Stream input, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(name) || name.Length > 180 || name.Any(c => char.IsControl(c) || c is '/' or '\\')) return Result.Fail("files.invalid_name", ErrorKind.Validation);
        if (!await Access(actor, customer, ct)) return Result.Fail("customers.not_found", ErrorKind.NotFound);
        using var content = new MemoryStream(); var buffer = new byte[81920]; int read;
        while ((read = await input.ReadAsync(buffer, ct)) > 0) { if (content.Length + read > FileService.MaxUploadBytes) return Result.Fail("files.too_large", ErrorKind.Validation); await content.WriteAsync(buffer.AsMemory(0, read), ct); }
        var file = new OrganizationFileRow { CustomerId = customer, UploadedBy = actor, Name = name.Trim(), Size = content.Length, CreatedAt = time.GetUtcNow() };
        await using (var tx = await db.Database.BeginTransactionAsync(ct))
        {
            await customers.Lock(customer, ct);
            if (!await Access(actor, customer, ct)) return Result.Fail("customers.not_found", ErrorKind.NotFound);
            var used = await db.Set<OrganizationFileRow>().Where(x => x.CustomerId == customer && x.PurgedAt == null).SumAsync(x => x.Size, ct);
            var quota = await entitlements.Quota(customer, ct) ?? 100L * 1024 * 1024;
            if (quota == 0 || used + file.Size > quota) return Result.Fail("files.quota", ErrorKind.Conflict);
            db.Set<OrganizationFileRow>().Add(file); await db.SaveChangesAsync(ct); await tx.CommitAsync(ct);
        }
        content.Position = 0; await storage.Write(OrganizationFileRow.Key(customer, file.Id), content, ct);
        await using var finish = await db.Database.BeginTransactionAsync(ct); await customers.Lock(customer, ct); await db.Entry(file).ReloadAsync(ct);
        if (!await Access(actor, customer, ct) || file.DeletedAt != null || file.PurgedAt != null) return Result.Fail("authorization.denied", ErrorKind.Forbidden);
        file.Ready = true; db.Audit.Add(new() { ActorId = actor, SubjectId = customer, Action = "customer.file_uploaded", At = time.GetUtcNow() });
        await db.SaveChangesAsync(ct); await finish.CommitAsync(ct); return Result.Success();
    }
    public async Task<Result<FileDownload>> Download(Guid actor, Guid customer, Guid id, CancellationToken ct)
    {
        if (!await Access(actor, customer, ct)) return Result<FileDownload>.Fail("customers.not_found", ErrorKind.NotFound);
        var file = await db.Set<OrganizationFileRow>().AsNoTracking().SingleOrDefaultAsync(x => x.CustomerId == customer && x.Id == id && x.Ready && x.DeletedAt == null, ct);
        return file is null ? Result<FileDownload>.Fail("files.not_found", ErrorKind.NotFound) : Result<FileDownload>.Success(new(await storage.Read(OrganizationFileRow.Key(customer, id), ct), file.Name));
    }
    public async Task<Result<Unit>> Delete(Guid actor, Guid customer, Guid id, CancellationToken ct)
    {
        await using var tx = await db.Database.BeginTransactionAsync(ct); await customers.Lock(customer, ct);
        var account = await customers.Find(actor, customer, ct);
        if (account is null) return Result.Fail("customers.not_found", ErrorKind.NotFound);
        var file = await db.Set<OrganizationFileRow>().SingleOrDefaultAsync(x => x.CustomerId == customer && x.Id == id && x.DeletedAt == null, ct);
        if (file is null || account.Role == "Member" && file.UploadedBy != actor) return Result.Fail("authorization.denied", ErrorKind.Forbidden);
        file.DeletedAt = time.GetUtcNow(); db.Audit.Add(new() { ActorId = actor, SubjectId = customer, Action = "customer.file_deleted", At = time.GetUtcNow() });
        await db.SaveChangesAsync(ct); await tx.CommitAsync(ct); return Result.Success();
    }
}
