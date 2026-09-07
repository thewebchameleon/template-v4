using TemplateV4.Application.Users;
using TemplateV4.Infrastructure.Security;

namespace TemplateV4.ApiService.Endpoints;

public static class AccessEndpoints
{
    public static RouteGroupBuilder MapAccessEndpoints(this RouteGroupBuilder group)
    {
        group.MapGet("/roles", async (AccessManagementService service, CancellationToken ct) => Results.Ok(await service.Catalog(ct)))
            .RequireAuthorization(policy => policy.RequireAssertion(c => c.User.HasClaim("permission", Permissions.Read) || c.User.HasClaim("permission", Permissions.Roles)))
            .WithName("GetAccessCatalog").Produces<AccessCatalog>();
        group.MapPost("/roles", async (SaveRoleRequest request, AccessManagementService service, CancellationToken ct) => (await service.Save(null, request, ct)).ToHttp())
            .RequireAuthorization(Permissions.Roles).WithName("CreateRole").Produces<RoleItem>();
        group.MapPut("/roles/{id:guid}", async (Guid id, SaveRoleRequest request, AccessManagementService service, CancellationToken ct) => (await service.Save(id, request, ct)).ToHttp())
            .RequireAuthorization(Permissions.Roles).WithName("UpdateRole").Produces<RoleItem>();
        group.MapGet("/users/{id:guid}", async (Guid id, AccessManagementService service, CancellationToken ct) => (await service.User(id, ct)).ToHttp())
            .RequireAuthorization(Permissions.Read).WithName("GetUserAccess").Produces<UserAccessDetail>();
        return group;
    }
}
