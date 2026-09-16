using TemplateV4.Application.Modules;
using TemplateV4.Application.Support;
using TemplateV4.Application.Users;

namespace TemplateV4.ApiService.Endpoints;

public static class CategoriesEndpoints
{
    public static void MapSupportCategories(this RouteGroupBuilder support)
    {
        support.MapPost("/categories", async (SaveSupportCategory request, Dispatcher<SaveSupportCategory, Unit> dispatcher, CancellationToken ct) => (await dispatcher.Send(request, ct)).ToHttp())
            .RequireAuthorization(Permissions.SupportAdmin).WithName("SaveSupportCategory");
    }
}
