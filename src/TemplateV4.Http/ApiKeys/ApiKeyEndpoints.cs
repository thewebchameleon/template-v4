using TemplateV4.Application.ApiKeys;
using TemplateV4.Application.Users;

namespace TemplateV4.ApiService.Endpoints;

public static class ApiKeyEndpoints
{
    public static RouteGroupBuilder MapApiKeyEndpoints(this RouteGroupBuilder group)
    {
        var keys = group.MapGroup("/administration/api-keys").RequireAuthorization(Permissions.ApiKeysManage);
        keys.MapGet("", async ([AsParameters] ApiKeyQuery query, IApiKeys store, CancellationToken ct) => (await store.List(query, ct)).ToHttp())
            .WithName("ListApiKeys").Produces<ApiKeyPage>();
        keys.MapPost("", async (CreateApiKey request, IApiKeys store, CancellationToken ct) => (await store.Create(request, ct)).ToHttp())
            .WithName("CreateApiKey").Produces<ApiKeyCreated>();
        keys.MapPost("/{id:guid}/rotate", async (Guid id, IApiKeys store, CancellationToken ct) => (await store.Rotate(id, ct)).ToHttp())
            .WithName("RotateApiKey").Produces<ApiKeyCreated>();
        keys.MapPost("/{id:guid}/revoke", async (Guid id, IApiKeys store, CancellationToken ct) => (await store.Revoke(id, ct)).ToHttp())
            .WithName("RevokeApiKey");
        keys.MapDelete("/{id:guid}", async (Guid id, IApiKeys store, CancellationToken ct) => (await store.Delete(id, ct)).ToHttp())
            .WithName("DeleteApiKey");
        return group;
    }
}
