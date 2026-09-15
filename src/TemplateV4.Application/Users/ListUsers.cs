namespace TemplateV4.Application.Users;

public sealed record UserDirectoryPage(IReadOnlyList<UserDto> Items, int Total, int PageNumber, int PageSize, int Active, int Invited, int Disabled, string[] Roles);
public sealed record ListUsers(int PageNumber = 1, int PageSize = 25, string? Search = null, string Status = "all", string? Role = null, string Sort = "displayName", string Direction = "asc") : IQuery<UserDirectoryPage>, IAuthorizedRequest
{ public string Permission => Permissions.Read; }
public sealed class ListUsersValidator : IValidator<ListUsers>
{
    public Dictionary<string, string[]> Validate(ListUsers query) => query.PageNumber < 1 || query.PageNumber > 10000 || query.PageSize is < 1 or > 100 || query.Search is { Length: > 120 } || query.Status is not ("all" or "Active" or "Invited" or "Disabled") || query.Role is { Length: > 80 } or "" || query.Sort is not ("username" or "displayName" or "email" or "roles" or "status") || query.Direction is not ("asc" or "desc")
        ? new() { ["pagination"] = ["query.invalid"] } : [];
}
public sealed class ListUsersHandler(IUserDirectory directory) : IHandler<ListUsers, UserDirectoryPage>
{ public async Task<Result<UserDirectoryPage>> Handle(ListUsers request, CancellationToken cancellationToken) => Result<UserDirectoryPage>.Success(await directory.List(request, cancellationToken)); }
