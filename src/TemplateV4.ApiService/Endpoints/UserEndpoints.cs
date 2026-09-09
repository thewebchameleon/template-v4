using TemplateV4.Application;
using TemplateV4.Application.Users;

namespace TemplateV4.ApiService.Endpoints;

public static class UserEndpoints
{
    public static RouteGroupBuilder MapUserEndpoints(this RouteGroupBuilder group)
    {
        group.MapGet("/users", async (Dispatcher<ListUsers, UserDirectoryPage> dispatcher, CancellationToken ct, int pageNumber = 1, int pageSize = 25, string? search = null, string status = "all", string? role = null, string sort = "displayName", string direction = "asc") =>
                (await dispatcher.Send(new(pageNumber, pageSize, search, status, role, sort, direction), ct)).ToHttp())
            .RequireAuthorization(Permissions.Read).WithName("ListUsers").Produces<UserDirectoryPage>();
        group.MapPost("/users", async (CreateUser request, Dispatcher<CreateUser, UserDto> dispatcher, HttpContext context, CancellationToken ct) =>
                (await dispatcher.Send(request with { IdempotencyKey = context.Request.Headers["Idempotency-Key"].FirstOrDefault() }, ct)).ToHttp())
            .RequireAuthorization(Permissions.Manage).WithName("CreateUser").Produces<UserDto>();
        group.MapPut("/users/{id:guid}", async (Guid id, UpdateUser request, Dispatcher<UpdateUser, UserDto> dispatcher, CancellationToken ct) =>
                (await dispatcher.Send(request with { Id = id }, ct)).ToHttp())
            .RequireAuthorization(Permissions.Manage).WithName("UpdateUser").Produces<UserDto>();

        return group;
    }
}
