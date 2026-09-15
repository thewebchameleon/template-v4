namespace TemplateV4.Application.Users;

public sealed record UpdateUser(Guid Id, Guid Version, bool Disabled, string[] Roles) : ICommand<UserDto>, IAuthorizedRequest
{ public string Permission => Permissions.Manage; }
public sealed class UpdateUserValidator : IValidator<UpdateUser>
{
    public Dictionary<string, string[]> Validate(UpdateUser command) => command.Id == Guid.Empty || command.Version == Guid.Empty || command.Roles is null || command.Roles.Length > 20 || command.Roles.Distinct().Count() != command.Roles.Length || command.Roles.Any(role => string.IsNullOrWhiteSpace(role) || role.Length > 80)
        ? new() { ["user"] = ["user.invalid"] } : [];
}
public sealed class UpdateUserHandler(IUserDirectory directory) : IHandler<UpdateUser, UserDto>
{ public Task<Result<UserDto>> Handle(UpdateUser request, CancellationToken cancellationToken) => directory.Update(request, cancellationToken); }
