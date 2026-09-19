using Microsoft.Extensions.DependencyInjection;
using TemplateV4.Application;
using TemplateV4.Application.FileStorage;
using TemplateV4.Application.Users;
using TemplateV4.Infrastructure.Security;
using TemplateV4.Infrastructure.Users;

namespace TemplateV4.Infrastructure;

public static partial class Registration
{
    private static void AddUsers(IServiceCollection services)
    {
        services.AddScoped<IUserDirectory, UserDirectory>();
        services.AddScoped<IStorageUsageSource, AvatarStorageUsage>();
        services.AddScoped<IDomainEventHandler, UserProvisionedHandler>();
        services.AddScoped<IHandler<CreateUser, UserDto>, CreateUserHandler>();
        services.AddScoped<IHandler<ListUsers, UserDirectoryPage>, ListUsersHandler>();
        services.AddScoped<IHandler<UpdateUser, UserDto>, UpdateUserHandler>();
        services.AddSingleton<IValidator<CreateUser>, CreateUserValidator>();
        services.AddSingleton<IValidator<ListUsers>, ListUsersValidator>();
        services.AddSingleton<IValidator<UpdateUser>, UpdateUserValidator>();
    }
}
