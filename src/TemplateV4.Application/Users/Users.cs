using System.Net.Mail;

namespace TemplateV4.Application.Users;

public static class Permissions
{
    public const string Read = "users.read";
    public const string Manage = "users.manage";
    public const string Jobs = "jobs.trigger";
    public const string Settings = "settings.manage";
    public const string Roles = "roles.manage";
    public static readonly string[] All = [Read, Manage, Roles, Jobs, Settings];
}
public sealed record UserDto(Guid Id, string Email, string DisplayName, string Culture, bool Disabled, string[] Roles, Guid Version, string Status = "Active", string Username = "");
public sealed record Page<T>(IReadOnlyList<T> Items, int Total, int PageNumber, int PageSize);
public sealed record UserDirectoryPage(IReadOnlyList<UserDto> Items, int Total, int PageNumber, int PageSize, int Active, int Invited, int Disabled, string[] Roles);
public interface IUserDirectory
{
    Task<Result<UserDto>> Create(CreateUser command, CancellationToken cancellationToken);
    Task<UserDirectoryPage> List(ListUsers query, CancellationToken cancellationToken);
    Task<Result<UserDto>> Update(UpdateUser command, CancellationToken cancellationToken);
}
public sealed record CreateUser(string Email, string DisplayName, string Culture, string[] Roles, string? IdempotencyKey = null)
    : ICommand<UserDto>, IAuthorizedRequest, IIdempotentRequest
{ public string Permission => Permissions.Manage; }
public sealed record ListUsers(int PageNumber = 1, int PageSize = 25, string? Search = null, string Status = "all", string? Role = null, string Sort = "displayName", string Direction = "asc") : IQuery<UserDirectoryPage>, IAuthorizedRequest
{ public string Permission => Permissions.Read; }
public sealed record UpdateUser(Guid Id, Guid Version, bool Disabled, string[] Roles) : ICommand<UserDto>, IAuthorizedRequest
{ public string Permission => Permissions.Manage; }
public sealed class CreateUserValidator(CultureCatalog cultures) : IValidator<CreateUser>
{
    public Dictionary<string, string[]> Validate(CreateUser command)
    {
        var errors = new Dictionary<string, string[]>();
        if (string.IsNullOrWhiteSpace(command.Email) || command.Email.Length > 254 || !MailAddress.TryCreate(command.Email, out var address) || address.Address != command.Email)
            errors["email"] = ["email.invalid"];
        if (string.IsNullOrWhiteSpace(command.DisplayName) || command.DisplayName.Trim().Length > 120) errors["displayName"] = ["name.invalid"];
        if (!cultures.Supported.Contains(command.Culture)) errors["culture"] = ["culture.unsupported"];
        if (command.Roles is null || command.Roles.Length > 20 || command.Roles.Distinct().Count() != command.Roles.Length || command.Roles.Any(role => string.IsNullOrWhiteSpace(role) || role.Length > 80)) errors["role"] = ["role.invalid"];
        if (command.IdempotencyKey is { Length: > 100 } or "") errors["idempotencyKey"] = ["idempotency.invalid"];
        return errors;
    }
}
public sealed class ListUsersValidator : IValidator<ListUsers>
{
    public Dictionary<string, string[]> Validate(ListUsers query) => query.PageNumber < 1 || query.PageNumber > 10000 || query.PageSize is < 1 or > 100 || query.Search is { Length: > 120 } || query.Status is not ("all" or "Active" or "Invited" or "Disabled") || query.Role is { Length: > 80 } or "" || query.Sort is not ("username" or "displayName" or "email" or "roles" or "status") || query.Direction is not ("asc" or "desc")
        ? new() { ["pagination"] = ["query.invalid"] } : [];
}
public sealed class UpdateUserValidator : IValidator<UpdateUser>
{
    public Dictionary<string, string[]> Validate(UpdateUser command) => command.Id == Guid.Empty || command.Version == Guid.Empty || command.Roles is null || command.Roles.Length > 20 || command.Roles.Distinct().Count() != command.Roles.Length || command.Roles.Any(role => string.IsNullOrWhiteSpace(role) || role.Length > 80)
        ? new() { ["user"] = ["user.invalid"] } : [];
}
public sealed class CreateUserHandler(IUserDirectory directory) : IHandler<CreateUser, UserDto>
{ public Task<Result<UserDto>> Handle(CreateUser request, CancellationToken cancellationToken) => directory.Create(request, cancellationToken); }
public sealed class ListUsersHandler(IUserDirectory directory) : IHandler<ListUsers, UserDirectoryPage>
{ public async Task<Result<UserDirectoryPage>> Handle(ListUsers request, CancellationToken cancellationToken) => Result<UserDirectoryPage>.Success(await directory.List(request, cancellationToken)); }
public sealed class UpdateUserHandler(IUserDirectory directory) : IHandler<UpdateUser, UserDto>
{ public Task<Result<UserDto>> Handle(UpdateUser request, CancellationToken cancellationToken) => directory.Update(request, cancellationToken); }
public sealed record TriggerMaintenance(string? IdempotencyKey) : ICommand<Guid>, IAuthorizedRequest, IIdempotentRequest
{ public string Permission => Permissions.Jobs; }
public sealed class TriggerMaintenanceHandler(IEventOutbox outbox, IExecutionContext context) : IHandler<TriggerMaintenance, Guid>
{
    public Task<Result<Guid>> Handle(TriggerMaintenance request, CancellationToken cancellationToken)
    {
        var id = Guid.NewGuid(); outbox.Add(new JobRequested(id, context.Culture));
        return Task.FromResult(Result<Guid>.Success(id));
    }
}
