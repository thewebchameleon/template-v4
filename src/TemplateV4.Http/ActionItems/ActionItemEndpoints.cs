using System.Security.Claims;
using TemplateV4.Application.Platform;
using TemplateV4.Application.Users;
using TemplateV4.Infrastructure.Security;

namespace TemplateV4.ApiService.Endpoints;

public static class ActionItemEndpoints
{
    public static RouteGroupBuilder MapActionItemEndpoints(this RouteGroupBuilder group)
    {
        var items = group.MapGroup("/action-items").RequireAuthorization();
        items.MapGet("", async ([AsParameters] ActionItemsQuery query, IActionItems service, ClaimsPrincipal principal, CancellationToken ct) => (await service.List(EndpointSecurity.Actor(principal), query, ct)).ToHttp()).WithName("ListActionItems").Produces<Page<ActionItemDto>>();
        items.MapGet("/assignees", async (IActionItems service, CancellationToken ct, string search = "") => await service.Assignees(search, ct)).WithName("FindActionAssignees");
        items.MapGet("/queues", () => ActionQueues.All).WithName("GetActionItemQueues").Produces<IReadOnlyList<ActionQueue>>();
        items.MapPost("", async (CreateActionItem request, IActionItems service, ClaimsPrincipal principal, CancellationToken ct) => (await service.Create(EndpointSecurity.Actor(principal), request, ct)).ToHttp()).WithName("CreateActionItem").Produces<Guid>();
        items.MapPost("/{id:guid}/complete", async (Guid id, IActionItems service, ClaimsPrincipal principal, CancellationToken ct) => (await service.Complete(EndpointSecurity.Actor(principal), id, ct)).ToHttp()).WithName("CompleteActionItem");
        var reviews = group.MapGroup("/registration-requests").RequireAuthorization(Permissions.Settings).RequireAuthorization(policy => policy.RequireRole("Administrator"));
        reviews.MapGet("", async (RegistrationReviewService service, CancellationToken ct, int pageNumber = 1, int pageSize = 10, string sort = "displayName", string direction = "asc") => (await service.List(pageNumber, pageSize, sort, direction, ct)).ToHttp()).WithName("ListRegistrationRequests").Produces<Page<RegistrationReviewItem>>();
        reviews.MapPost("/review", async (ReviewRegistration request, RegistrationReviewService service, ClaimsPrincipal principal, CancellationToken ct) => (await service.Review(EndpointSecurity.Actor(principal), request, ct)).ToHttp()).WithName("ReviewRegistration");
        return group;
    }
}
