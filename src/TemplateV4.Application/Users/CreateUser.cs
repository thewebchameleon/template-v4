using System.Net.Mail;

namespace TemplateV4.Application.Users;

public sealed record CreateUser(string Email, string DisplayName, string Culture, string[] Roles, string? IdempotencyKey = null)
    : ICommand<UserDto>, IAuthorizedRequest, IIdempotentRequest
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
public sealed class CreateUserHandler(IUserDirectory directory) : IHandler<CreateUser, UserDto>
{ public Task<Result<UserDto>> Handle(CreateUser request, CancellationToken cancellationToken) => directory.Create(request, cancellationToken); }
