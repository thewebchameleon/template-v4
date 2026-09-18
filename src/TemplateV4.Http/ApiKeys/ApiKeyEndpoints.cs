using TemplateV4.Application.ApiKeys;
using TemplateV4.Application.Users;

namespace TemplateV4.ApiService.Endpoints;

public static class ApiKeyEndpoints
{
    public static RouteGroupBuilder MapApiKeyEndpoints(this RouteGroupBuilder group)
    {
        var keys = group.MapGroup("/administration/api-keys").RequireAuthorization(Permissions.ApiKeysManage);
        keys.MapGet("", async (IApiKeys store, CancellationToken ct) => (await store.List(ct)).ToHttp())
            .WithName("ListApiKeys").Produces<ApiKeyItem[]>();
        keys.MapPost("", async (CreateApiKey request, IApiKeys store, CancellationToken ct) => (await store.Create(request, ct)).ToHttp())
            .WithName("CreateApiKey").Produces<ApiKeyCreated>();
        keys.MapPost("/{id:guid}/revoke", async (Guid id, IApiKeys store, CancellationToken ct) => (await store.Revoke(id, ct)).ToHttp())
            .WithName("RevokeApiKey");
        return group;
    }
}
