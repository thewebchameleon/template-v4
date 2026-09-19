using Microsoft.EntityFrameworkCore;
using TemplateV4.Application.Customers;
using TemplateV4.Application.FileStorage;
using TemplateV4.Application.Users;
using TemplateV4.Infrastructure.Persistence;

namespace TemplateV4.Infrastructure.Storage;

public sealed record OrganisationFileItem(Guid Id, string Name, long Size, DateTimeOffset CreatedAt, bool CanDelete);
public sealed record OrganisationFilePage(Page<OrganisationFileItem> Page, long UsedBytes, long QuotaBytes);
public sealed class OrganisationFiles(FrameworkDb db, ICustomerAccess customers, IStorageCapacity capacity, IStorageUsage usage, FileStorageService library)
{
    private async Task<bool> Access(Guid actor, CancellationToken ct) => await customers.Find(actor, ct) is not null;
    private Task<bool> CanWrite(Guid actor, CancellationToken ct) => (from assignment in db.UserRoles
                                                                      join claim in db.RoleClaims on assignment.RoleId equals claim.RoleId
                                                                      where assignment.UserId == actor && claim.ClaimType == "permission" && claim.ClaimValue == Permissions.SharedFilesManage
                                                                      select claim).AnyAsync(ct);
    public async Task<Result<OrganisationFilePage>> List(Guid actor, int page, int size, string sort, string direction, CancellationToken ct)
    {
        if (page is < 1 or > 10000 || size is < 1 or > 100 || sort is not ("name" or "size" or "createdAt") || direction is not ("asc" or "desc")) return Result<OrganisationFilePage>.Fail("validation.failed", ErrorKind.Validation);
        var account = await customers.Find(actor, ct);
        if (account is null) return Result<OrganisationFilePage>.Fail("customers.not_found", ErrorKind.NotFound);
        var all = db.Files.AsNoTracking().Where(x => !x.IsFolder && x.Ready && x.DeletedAt == null && x.PurgedAt == null && !x.PurgeRequested);
        var total = await all.CountAsync(ct);
        var canWrite = await CanWrite(actor, ct);
        var ordered = sort switch { "name" => direction == "asc" ? all.OrderBy(x => x.Name) : all.OrderByDescending(x => x.Name), "size" => direction == "asc" ? all.OrderBy(x => x.Size) : all.OrderByDescending(x => x.Size), _ => direction == "asc" ? all.OrderBy(x => x.CreatedAt) : all.OrderByDescending(x => x.CreatedAt) };
        var items = await ordered.ThenBy(x => x.Id).Skip((page - 1) * size).Take(size).Select(x => new OrganisationFileItem(x.Id, x.Name, x.Size, x.CreatedAt, canWrite)).ToArrayAsync(ct);
        return Result<OrganisationFilePage>.Success(new(new(items, total, page, size), await usage.Read(ct), await capacity.Limit(ct)));
    }
    public async Task<Result<Guid>> Upload(Guid actor, string name, Stream input, CancellationToken ct)
    {
        var result = await library.Upload(actor, name, input, ct);
        return result.IsSuccess ? Result<Guid>.Success(result.Value!.Id) : Result<Guid>.Fail(result.Error!.Code, result.Error.Kind);
    }
    public Task<Result<FileDownload>> Download(Guid actor, Guid id, CancellationToken ct) => library.Download(actor, id, ct);
    public Task<Result<Unit>> Delete(Guid actor, Guid id, CancellationToken ct) => library.Delete(actor, id, ct);
}
