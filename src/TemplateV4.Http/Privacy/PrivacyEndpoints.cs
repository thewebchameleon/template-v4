using System.Security.Claims;
using TemplateV4.Application.Users;
using TemplateV4.Infrastructure.Security;

namespace TemplateV4.ApiService.Endpoints;

public static class PrivacyEndpoints
{
    public static RouteGroupBuilder MapPrivacyEndpoints(this RouteGroupBuilder group)
    {
        group.MapGet("/privacy", async (ClaimsPrincipal principal, PrivacyService service, CancellationToken ct) => Results.Ok(await service.Status(EndpointSecurity.Actor(principal), ct)))
            .RequireAuthorization().WithName("GetPrivacyStatus").Produces<PrivacyStatus>();
        group.MapGet("/privacy/export", async (ClaimsPrincipal principal, PrivacyService service, CancellationToken ct) => Results.File(await service.Export(EndpointSecurity.Actor(principal), ct), "application/json", "account-data.json"))
            .RequireAuthorization().WithName("ExportAccountData").Produces(200, contentType: "application/json");
        group.MapPost("/privacy/email", async (ChangeEmailRequest request, ClaimsPrincipal principal, PrivacyService service, CancellationToken ct) => (await service.ChangeEmail(EndpointSecurity.Actor(principal), EndpointSecurity.SessionId(principal), request, ct)).ToHttp())
            .RequireAuthorization().WithName("RequestEmailChange");
        group.MapPost("/privacy/confirm-email", async (ConfirmEmailChangeRequest request, PrivacyService service, CancellationToken ct) => (await service.ConfirmEmail(request, ct)).ToHttp())
            .AllowAnonymous().WithName("ConfirmEmailChange");
        group.MapPost("/privacy/deletion", async (ClaimsPrincipal principal, PrivacyService service, CancellationToken ct) => (await service.RequestDeletion(EndpointSecurity.Actor(principal), ct)).ToHttp())
            .RequireAuthorization().WithName("RequestAccountDeletion");
        group.MapPost("/privacy/withdraw", async (ClaimsPrincipal principal, PrivacyService service, CancellationToken ct) => (await service.Withdraw(EndpointSecurity.Actor(principal), ct)).ToHttp())
            .RequireAuthorization().WithName("WithdrawAccountDeletion");
        group.MapGet("/privacy/requests", async (PrivacyService service, CancellationToken ct, int pageNumber = 1, int pageSize = 25, string sort = "requestedAt", string direction = "asc") => (await service.Requests(pageNumber, pageSize, sort, direction, ct)).ToHttp())
            .RequireAuthorization(Permissions.Settings).RequireAuthorization(policy => policy.RequireRole("Administrator")).WithName("ListDeletionRequests").Produces<Page<DeletionItem>>();
        group.MapPost("/privacy/review", async (ReviewDeletionRequest request, ClaimsPrincipal principal, PrivacyService service, CancellationToken ct) => (await service.Review(EndpointSecurity.Actor(principal), request, ct)).ToHttp())
            .RequireAuthorization(Permissions.Settings).RequireAuthorization(policy => policy.RequireRole("Administrator")).WithName("ReviewAccountDeletion");
        return group;
    }
}
