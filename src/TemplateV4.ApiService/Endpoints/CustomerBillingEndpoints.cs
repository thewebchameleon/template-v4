using System.Security.Claims;
using System.Text.Json;
using TemplateV4.Application.Billing;
using TemplateV4.Application.Customers;
using TemplateV4.Application.Users;
using TemplateV4.Infrastructure.Billing;
using TemplateV4.Infrastructure.Storage;

namespace TemplateV4.ApiService.Endpoints;

public sealed record CloseOrganization(Guid Version);
public sealed record MemberAction(Guid UserId, Guid Version);
public static class CustomerBillingEndpoints
{
    private static Guid Actor(ClaimsPrincipal user) => Guid.Parse(user.FindFirstValue("sub")!);
    public static RouteGroupBuilder MapCustomerBillingEndpoints(this RouteGroupBuilder group)
    {
        var accounts = group.MapGroup("/customers").RequireAuthorization();
        accounts.MapGet("/", async (ClaimsPrincipal u, ICustomers store, CancellationToken ct) => (await store.Home(Actor(u), ct)).ToHttp()).RequireModule("organizations").WithName("GetCustomers").Produces<CustomerHome>();
        accounts.MapPost("/", async (ClaimsPrincipal u, CreateOrganization r, ICustomers s, CancellationToken ct) => (await s.Create(Actor(u), r, ct)).ToHttp()).RequireModule("organizations").WithName("CreateOrganization").Produces<CustomerInfo>();
        accounts.MapPost("/{customer:guid}/rename", async (Guid customer, ClaimsPrincipal u, RenameOrganization r, ICustomers s, CancellationToken ct) => (await s.Rename(Actor(u), customer, r, ct)).ToHttp()).RequireModule("organizations").WithName("RenameOrganization");
        accounts.MapGet("/{customer:guid}/members", async (Guid customer, ClaimsPrincipal u, ICustomers s, CancellationToken ct, int pageNumber = 1, int pageSize = 10, string sort = "name", string direction = "asc") => (await s.Members(Actor(u), customer, pageNumber, pageSize, sort, direction, ct)).ToHttp()).RequireModule("organizations").WithName("GetOrganizationMembers").Produces<Page<CustomerMember>>();
        accounts.MapPost("/{customer:guid}/invite", async (Guid customer, ClaimsPrincipal u, InviteMember r, ICustomers s, CancellationToken ct) => (await s.Invite(Actor(u), customer, r, ct)).ToHttp()).RequireModule("organizations").WithName("InviteOrganizationMember");
        accounts.MapPost("/invitations/{invitation:guid}/accept", async (Guid invitation, ClaimsPrincipal u, ICustomers s, CancellationToken ct) => (await s.Accept(Actor(u), invitation, ct)).ToHttp()).RequireModule("organizations").WithName("AcceptOrganizationInvitation");
        accounts.MapPost("/{customer:guid}/invitations/{invitation:guid}/revoke", async (Guid customer, Guid invitation, ClaimsPrincipal u, ICustomers s, CancellationToken ct) => (await s.RevokeInvitation(Actor(u), customer, invitation, ct)).ToHttp()).RequireModule("organizations").WithName("RevokeOrganizationInvitation");
        accounts.MapPost("/{customer:guid}/members/role", async (Guid customer, ClaimsPrincipal u, ChangeMember r, ICustomers s, CancellationToken ct) => (await s.Member(Actor(u), customer, r, ct)).ToHttp()).RequireModule("organizations").WithName("ChangeOrganizationRole");
        accounts.MapPost("/{customer:guid}/members/remove", async (Guid customer, ClaimsPrincipal u, MemberAction r, ICustomers s, CancellationToken ct) => (await s.Remove(Actor(u), customer, r.UserId, r.Version, ct)).ToHttp()).RequireModule("organizations").WithName("RemoveOrganizationMember");
        accounts.MapPost("/{customer:guid}/transfer", async (Guid customer, ClaimsPrincipal u, MemberAction r, ICustomers s, CancellationToken ct) => (await s.Transfer(Actor(u), customer, r.UserId, r.Version, ct)).ToHttp()).RequireModule("organizations").WithName("TransferOrganizationOwnership");
        accounts.MapPost("/{customer:guid}/close", async (Guid customer, ClaimsPrincipal u, CloseOrganization r, ICustomers s, CancellationToken ct) => (await s.Close(Actor(u), customer, r.Version, ct)).ToHttp()).WithName("CloseOrganization");
        // Existing customers can always inspect and cancel payment obligations when checkout is disabled.
        var billing = group.MapGroup("/customers/{customer:guid}/billing").RequireAuthorization();
        var files = group.MapGroup("/customers/{customer:guid}/files").RequireAuthorization().AddEndpointFilter(async (invocation, next) =>
        {
            var flags = invocation.HttpContext.RequestServices.GetRequiredService<IFeatureFlags>();
            var actor = invocation.HttpContext.RequestServices.GetRequiredService<IExecutionContext>();
            return flags.Enabled("files", actor) ? await next(invocation) : Results.NotFound();
        });
        files.MapGet("", async (Guid customer, ClaimsPrincipal u, OrganizationFiles s, CancellationToken ct, int pageNumber = 1, int pageSize = 10, string sort = "name", string direction = "asc") => (await s.List(Actor(u), customer, pageNumber, pageSize, sort, direction, ct)).ToHttp()).RequireModule("organizations").RequireModule("files").WithName("GetOrganizationFiles").Produces<OrganizationFilePage>();
        files.MapPost("/upload", async (Guid customer, string name, ClaimsPrincipal u, HttpRequest r, OrganizationFiles s, CancellationToken ct) => (await s.Upload(Actor(u), customer, name, r.Body, ct)).ToHttp()).WithMetadata(new Microsoft.AspNetCore.Mvc.RequestSizeLimitAttribute(FileService.MaxUploadBytes + 1)).RequireModule("organizations").RequireModule("files").WithName("UploadOrganizationFile");
        files.MapPost("/{id:guid}/delete", async (Guid customer, Guid id, ClaimsPrincipal u, OrganizationFiles s, CancellationToken ct) => (await s.Delete(Actor(u), customer, id, ct)).ToHttp()).RequireModule("organizations").RequireModule("files").WithName("DeleteOrganizationFile");
        files.MapGet("/{id:guid}", async (Guid customer, Guid id, ClaimsPrincipal u, OrganizationFiles s, HttpResponse response, CancellationToken ct) =>
        {
            response.Headers.CacheControl = "no-store"; response.Headers.XContentTypeOptions = "nosniff";
            var result = await s.Download(Actor(u), customer, id, ct); return result.IsSuccess ? Results.File(result.Value!.Content, "application/octet-stream", result.Value.Name) : result.ToHttp();
        }).RequireModule("organizations").RequireModule("files").WithName("DownloadOrganizationFile").Produces(200, contentType: "application/octet-stream");
        billing.MapGet("", async (Guid customer, ClaimsPrincipal u, IBilling s, CancellationToken ct) => (await s.Summary(Actor(u), customer, ct)).ToHttp()).WithName("GetCustomerBilling").Produces<BillingSummary>();
        billing.MapPost("/trial", async (Guid customer, ClaimsPrincipal u, StartTrial r, IBilling s, CancellationToken ct) => (await s.Trial(Actor(u), customer, r, ct)).ToHttp()).RequireModule("billing").WithName("StartBillingTrial");
        billing.MapPost("/checkout", async (Guid customer, ClaimsPrincipal u, CheckoutRequest r, IBilling s, CancellationToken ct) =>
        {
            try { return (await s.Checkout(Actor(u), customer, r, ct)).ToHttp(); }
            catch (Exception ex) when (ex is PaymentProviderException or HttpRequestException or TaskCanceledException) { return Results.Problem(statusCode: 503, title: ApiResults.Message("billing.provider_unavailable"), extensions: new Dictionary<string, object?> { ["code"] = "billing.provider_unavailable" }); }
        }).RequireModule("billing").WithName("CreateSubscriptionCheckout").Produces<CheckoutResponse>();
        billing.MapPost("/cancel", async (Guid customer, ClaimsPrincipal u, IBilling s, CancellationToken ct) => (await s.Cancel(Actor(u), customer, ct)).ToHttp()).WithName("CancelCustomerSubscription");
        var settings = group.MapGroup("/configuration/billing").RequireAuthorization(Permissions.Settings).RequireAuthorization(p => p.RequireRole("Administrator"));
        settings.MapGet("", async (IBilling s, CancellationToken ct) => Results.Ok(await s.Settings(ct))).WithName("GetBillingSettings").Produces<BillingSettings>();
        settings.MapPost("", async (ClaimsPrincipal u, BillingSettings r, IBilling s, CancellationToken ct) => (await s.SaveSettings(Actor(u), r, ct)).ToHttp()).WithName("SaveBillingSettings");
        return group;
    }
    public static WebApplication MapPaymentCallbacks(this WebApplication app)
    {
        app.MapPost("/api/v1/billing/callbacks/{provider}", async (string provider, HttpRequest request, PaymentCallbacks callbacks, CancellationToken ct) =>
        {
            if (provider is not ("stripe" or "payfast")) return Results.NotFound();
            try
            {
                // StreamReader is bounded even for chunked requests. Never persist/log the raw notification.
                using var reader = new StreamReader(request.Body); var buffer = new char[65537]; var count = 0;
                while (count < buffer.Length) { var read = await reader.ReadAsync(buffer.AsMemory(count), ct); if (read == 0) break; count += read; }
                if (count > 65536) return Results.StatusCode(413);
                var body = new string(buffer, 0, count);
                bool valid;
                if (provider == "stripe") valid = await callbacks.Stripe(body, request.Headers["Stripe-Signature"].ToString(), ct);
                else
                {
                    var fields = new Dictionary<string, string>();
                    foreach (var pair in body.Split('&'))
                    {
                        var parts = pair.Split('=', 2); if (parts.Length != 2 || !fields.TryAdd(System.Net.WebUtility.UrlDecode(parts[0]), System.Net.WebUtility.UrlDecode(parts[1]))) return Results.BadRequest();
                    }
                    valid = await callbacks.PayFast(fields, ct);
                }
                return valid ? Results.Ok() : Results.BadRequest();
            }
            catch (Exception ex) when (ex is JsonException or KeyNotFoundException or FormatException or InvalidOperationException) { return Results.BadRequest(); }
            catch (Exception ex) when (ex is PaymentProviderException or HttpRequestException or TaskCanceledException) { return Results.StatusCode(503); }
        }).AllowAnonymous().DisableAntiforgery().WithTags("Framework").WithName("ReceivePaymentCallback");
        return app;
    }
}

