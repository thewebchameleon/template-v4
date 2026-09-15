using TemplateV4.Application.Users;
using TemplateV4.Infrastructure.Security;

namespace TemplateV4.ApiService.Endpoints;

public static class InvitationEndpoints
{
    public static RouteGroupBuilder MapInvitationEndpoints(this RouteGroupBuilder group)
    {
        group.MapGet("/invitations", async (AccountService service, CancellationToken ct, int pageNumber = 1, int pageSize = 25, string? search = null, string state = "all", string sort = "sentAt", string direction = "desc") => (await service.Invitations(pageNumber, pageSize, search, state, sort, direction, ct)).ToHttp())
            .RequireAuthorization(Permissions.Manage).WithName("ListInvitations").Produces<InvitationPage>();
        return group;
    }
}
