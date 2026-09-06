using System.Net.Mail;

namespace TemplateV4.Application.Users;

public static class Permissions
{
    public const string Read = "users.read";
    public const string Manage = "users.manage";
    public const string Jobs = "jobs.trigger";
    public const string Settings = "settings.manage";
    public static readonly string[] All = [Read, Manage, Jobs, Settings];
}
public sealed record UserDto(Guid Id, string Email, string DisplayName, string Culture, bool Disabled, string[] Roles, Guid Version, string Status = "Active");
public sealed record Page<T>(IReadOnlyList<T> Items, int Total, int PageNumber, int PageSize);
public interface IUserDirectory
{
    Task<Result<UserDto>> Create(CreateUser command, CancellationToken cancellationToken);
    Task<Page<UserDto>> List(ListUsers query, CancellationToken cancellationToken);
    Task<Result<UserDto>> Update(UpdateUser command, CancellationToken cancellationToken);
}
public sealed record CreateUser(string Email, string DisplayName, string Culture, string[] Roles, string? IdempotencyKey = null)
    : ICommand<UserDto>, IAuthorizedRequest, IIdempotentRequest
{ public string Permission => Permissions.Manage; }
public sealed record ListUsers(int PageNumber = 1, int PageSize = 25, string? Search = null, string Sort = "name") : IQuery<Page<UserDto>>, IAuthorizedRequest
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
        if (command.Roles is null || command.Roles.Length > 2 || command.Roles.Distinct().Count() != command.Roles.Length || command.Roles.Any(role => role is not ("Administrator" or "Reader"))) errors["role"] = ["role.invalid"];
        if (command.IdempotencyKey is { Length: > 100 } or "") errors["idempotencyKey"] = ["idempotency.invalid"];
        return errors;
    }
}
public sealed class ListUsersValidator : IValidator<ListUsers>
{
    public Dictionary<string, string[]> Validate(ListUsers query) => query.PageNumber < 1 || query.PageNumber > 10000 || query.PageSize is < 1 or > 100 || query.Search is { Length: > 120 } || query.Sort is not ("name" or "email")
        ? new() { ["pagination"] = ["query.invalid"] } : [];
}
public sealed class UpdateUserValidator : IValidator<UpdateUser>
{
    public Dictionary<string, string[]> Validate(UpdateUser command) => command.Id == Guid.Empty || command.Version == Guid.Empty || command.Roles is null || command.Roles.Length > 2 || command.Roles.Distinct().Count() != command.Roles.Length || command.Roles.Any(role => role is not ("Administrator" or "Reader"))
        ? new() { ["user"] = ["user.invalid"] } : [];
}
public sealed class CreateUserHandler(IUserDirectory directory) : IHandler<CreateUser, UserDto>
{ public Task<Result<UserDto>> Handle(CreateUser request, CancellationToken cancellationToken) => directory.Create(request, cancellationToken); }
public sealed class ListUsersHandler(IUserDirectory directory) : IHandler<ListUsers, Page<UserDto>>
{ public async Task<Result<Page<UserDto>>> Handle(ListUsers request, CancellationToken cancellationToken) => Result<Page<UserDto>>.Success(await directory.List(request, cancellationToken)); }
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
