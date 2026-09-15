namespace TemplateV4.Application.Users;

public sealed record UserDto(Guid Id, string Email, string DisplayName, string Culture, bool Disabled, string[] Roles, Guid Version, string Status = "Active", string Username = "");
public interface IUserDirectory
{
    Task<Result<UserDto>> Create(CreateUser command, CancellationToken cancellationToken);
    Task<UserDirectoryPage> List(ListUsers query, CancellationToken cancellationToken);
    Task<Result<UserDto>> Update(UpdateUser command, CancellationToken cancellationToken);
}
