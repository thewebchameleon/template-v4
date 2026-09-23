using System.Security.Claims;
using System.Text.Json;
using TemplateV4.Application.CommercialBilling;
using TemplateV4.Application.Customers;
using TemplateV4.Application.Modules;
using TemplateV4.Application.Payments;
using TemplateV4.Application.Users;
using TemplateV4.Infrastructure.CommercialBilling;
using TemplateV4.Infrastructure.Storage;

namespace TemplateV4.ApiService.Endpoints;

public static class OrganisationEndpoints
{
    private static Guid Actor(ClaimsPrincipal user) => Guid.Parse(user.FindFirstValue("sub")!);
    public static RouteGroupBuilder MapOrganisationEndpoints(this RouteGroupBuilder group)
    {
        var accounts = group.MapGroup("/organisation").RequireAuthorization();
        accounts.MapGet("/", async (ClaimsPrincipal u, ICustomers store, CancellationToken ct) => (await store.Home(Actor(u), ct)).ToHttp()).WithName("GetOrganisation").Produces<CustomerInfo>();
        accounts.MapGet("/users", async (ClaimsPrincipal u, ICustomers store, CancellationToken ct, int pageNumber = 1, int pageSize = 10) => (await store.Users(Actor(u), pageNumber, pageSize, ct)).ToHttp()).WithName("GetOrganisationUsers").Produces<Page<OrganisationUser>>();
        accounts.MapPost("/rename", async (ClaimsPrincipal u, RenameOrganisation r, ICustomers s, CancellationToken ct) => (await s.Rename(Actor(u), r, ct)).ToHttp()).RequireAuthorization(policy => policy.RequireRole("Administrator")).WithName("RenameOrganisation");
        accounts.MapPost("/settings", async (ClaimsPrincipal u, UpdateOrganisation r, ICustomers s, CancellationToken ct) =>
            (await s.Update(Actor(u), r, ct)).ToHttp()).RequireAuthorization(policy => policy.RequireRole("Administrator")).WithName("UpdateOrganisation").Produces<CustomerInfo>();
        accounts.MapPost("/logo", async (Guid version, ClaimsPrincipal u, HttpContext context, ICustomers s, CancellationToken ct) =>
        {
            if (context.Request.ContentLength is > 1048576) return Results.StatusCode(413);
            using var content = new MemoryStream();
            var buffer = new byte[81920];
            while (true)
            {
                var read = await context.Request.Body.ReadAsync(buffer, ct);
                if (read == 0) break;
                if (content.Length + read > 1048576) return Results.StatusCode(413);
                await content.WriteAsync(buffer.AsMemory(0, read), ct);
            }
            return (await s.UpdateLogo(Actor(u), version, content.ToArray(), ct)).ToHttp();
        }).RequireAuthorization(policy => policy.RequireRole("Administrator")).WithName("UploadOrganisationLogo").Produces<CustomerInfo>();
        accounts.MapDelete("/logo", async (Guid version, ClaimsPrincipal u, ICustomers s, CancellationToken ct) =>
            (await s.UpdateLogo(Actor(u), version, null, ct)).ToHttp()).RequireAuthorization(policy => policy.RequireRole("Administrator")).WithName("RemoveOrganisationLogo").Produces<CustomerInfo>();
        var files = accounts.MapGroup("/files");
        files.MapGet("", async (ClaimsPrincipal u, OrganisationFiles s, CancellationToken ct, int pageNumber = 1, int pageSize = 10, string sort = "name", string direction = "asc") => (await s.List(Actor(u), pageNumber, pageSize, sort, direction, ct)).ToHttp()).WithName("GetOrganisationFiles").Produces<OrganisationFilePage>();
        files.MapPost("/upload", async (string name, ClaimsPrincipal u, HttpContext context, OrganisationFiles s, FileStorageService settings, CancellationToken ct) =>
        {
            var maxUploadBytes = (await settings.Settings(ct)).MaxUploadBytes;
            var limit = context.Features.Get<Microsoft.AspNetCore.Http.Features.IHttpMaxRequestBodySizeFeature>();
            if (limit is { IsReadOnly: false }) limit.MaxRequestBodySize = maxUploadBytes == 0 ? null : maxUploadBytes;
            if (maxUploadBytes > 0 && context.Request.ContentLength > maxUploadBytes) return Results.StatusCode(413);
            return (await s.Upload(Actor(u), name, context.Request.Body, ct)).ToHttp();
        }).WithName("UploadOrganisationFile");
        files.MapPost("/{id:guid}/delete", async (Guid id, ClaimsPrincipal u, OrganisationFiles s, CancellationToken ct) => (await s.Delete(Actor(u), id, ct)).ToHttp()).WithName("DeleteOrganisationFile");
        files.MapGet("/{id:guid}", async (Guid id, ClaimsPrincipal u, OrganisationFiles s, HttpResponse response, CancellationToken ct) =>
        {
            response.Headers.CacheControl = "no-store"; response.Headers.XContentTypeOptions = "nosniff";
            var result = await s.Download(Actor(u), id, ct); return result.IsSuccess ? Results.File(result.Value!.Content, "application/octet-stream", result.Value.Name) : result.ToHttp();
        }).WithName("DownloadOrganisationFile").Produces(200, contentType: "application/octet-stream");
        var paymentSettings = group.MapGroup("/configuration/payment-methods").RequireAuthorization(Permissions.Settings).RequireAuthorization(p => p.RequireRole("Administrator"));
        paymentSettings.MapGet("", async (IPaymentMethodConfiguration s, CancellationToken ct) => Results.Ok(await s.Status(ct))).WithName("GetPaymentMethods").Produces<PaymentMethodStatus>();
        paymentSettings.MapPost("", async (ClaimsPrincipal u, PaymentMethodSettings r, IPaymentMethodConfiguration s, CancellationToken ct) => (await s.Save(Actor(u), r, ct)).ToHttp()).WithName("SavePaymentMethods");
        return group;
    }
}
