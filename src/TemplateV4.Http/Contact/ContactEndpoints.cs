using TemplateV4.Application.Contact;
using TemplateV4.Application.Modules;
using TemplateV4.Application.Users;

namespace TemplateV4.ApiService.Endpoints;

public static class ContactEndpoints
{
    public static RouteGroupBuilder MapContactAdministration(this RouteGroupBuilder group)
    {
        var inbox = group.MapGroup("/contact").RequireAuthorization(Permissions.ContactManage);
        inbox.MapGet("", async (IContact store, CancellationToken ct, string search = "", int pageNumber = 1, int pageSize = 10, string sort = "createdAt", string direction = "desc") =>
            (await store.List(search, pageNumber, pageSize, sort, direction, ct)).ToHttp()).WithName("ListContactEnquiries").Produces<Page<ContactEnquiry>>()
            .ContinuesWhenDisabled(ModuleIds.Contact, "Retained enquiries remain accessible after submissions stop.");
        inbox.MapPost("/{id:guid}/read", async (Guid id, IContact store, CancellationToken ct) => (await store.MarkRead(id, ct)).ToHttp()).WithName("MarkContactEnquiryRead")
            .ContinuesWhenDisabled(ModuleIds.Contact, "Accepted enquiries can still be reviewed.");
        return group;
    }

    public static RouteGroupBuilder MapPublicContact(this RouteGroupBuilder site)
    {
        site.MapPost("/contact", async (ContactSubmission request, IContact store, CancellationToken ct) => (await store.Submit(request, ct)).ToHttp())
            .OwnedByModule(ModuleIds.Contact).RequireCapability(CapabilityIds.Contact).RequireRateLimiting("contact")
            .WithName("SubmitContactEnquiry").Produces<Guid>();
        return site;
    }
}
