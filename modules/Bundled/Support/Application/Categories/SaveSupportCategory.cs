using TemplateV4.Application.Users;

namespace TemplateV4.Application.Support;

public sealed record SaveSupportCategory(Guid? Id, string Name, bool Active, Guid Version) : ICommand<Unit>, IAuthorizedRequest
{ public string Permission => Permissions.SupportAdmin; }
public sealed class SaveSupportCategoryValidator : IValidator<SaveSupportCategory>
{
    public Dictionary<string, string[]> Validate(SaveSupportCategory q) => string.IsNullOrWhiteSpace(q.Name) || q.Name.Length > 80 || q.Id != null && q.Version == Guid.Empty
        ? new() { ["category"] = ["validation.failed"] } : [];
}
public sealed class SaveSupportCategoryHandler(ISupportCategories store) : IHandler<SaveSupportCategory, Unit>
{ public Task<Result<Unit>> Handle(SaveSupportCategory q, CancellationToken ct) => store.Category(q, ct); }
