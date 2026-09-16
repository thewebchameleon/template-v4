using System.Security.Claims;
using System.Text.Json;
using TemplateV4.Application.Billing;
using TemplateV4.Application.Customers;
using TemplateV4.Application.Modules;
using TemplateV4.Application.Users;
using TemplateV4.Infrastructure.Billing;
using TemplateV4.Infrastructure.Storage;

namespace TemplateV4.ApiService.Endpoints;

public static class CustomerBillingEndpoints
{
    private static Guid Actor(ClaimsPrincipal user) => Guid.Parse(user.FindFirstValue("sub")!);
    public static RouteGroupBuilder MapCustomerBillingEndpoints(this RouteGroupBuilder group)
    {
        var accounts = group.MapGroup("/organisation").OwnedByModule(ModuleIds.Organisations).RequireAuthorization();
        var organisationEntries = accounts.MapGroup("").RequireCapability(CapabilityIds.Organisations);
        accounts.MapGet("/", async (ClaimsPrincipal u, ICustomers store, CancellationToken ct) => (await store.Home(Actor(u), ct)).ToHttp()).ContinuesWhenDisabled(ModuleIds.Organisations, "Read organisation settings and retained obligations").WithName("GetOrganisation").Produces<CustomerInfo>();
        organisationEntries.MapGet("/users", async (ClaimsPrincipal u, ICustomers store, CancellationToken ct, int pageNumber = 1, int pageSize = 10) => (await store.Users(Actor(u), pageNumber, pageSize, ct)).ToHttp()).WithName("GetOrganisationUsers").Produces<Page<OrganisationUser>>();
        organisationEntries.MapPost("/rename", async (ClaimsPrincipal u, RenameOrganisation r, ICustomers s, CancellationToken ct) => (await s.Rename(Actor(u), r, ct)).ToHttp()).RequireAuthorization(policy => policy.RequireRole("Administrator")).WithName("RenameOrganisation");
        accounts.MapPost("/settings", async (ClaimsPrincipal u, UpdateOrganisation r, ICustomers s, CancellationToken ct) =>
            (await s.Update(Actor(u), r, ct)).ToHttp()).RequireAuthorization(policy => policy.RequireRole("Administrator")).ContinuesWhenDisabled(ModuleIds.Organisations, "Maintain platform branding").WithName("UpdateOrganisation").Produces<CustomerInfo>();
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
        }).RequireAuthorization(policy => policy.RequireRole("Administrator")).ContinuesWhenDisabled(ModuleIds.Organisations, "Maintain platform branding").WithName("UploadOrganisationLogo").Produces<CustomerInfo>();
        accounts.MapDelete("/logo", async (Guid version, ClaimsPrincipal u, ICustomers s, CancellationToken ct) =>
            (await s.UpdateLogo(Actor(u), version, null, ct)).ToHttp()).RequireAuthorization(policy => policy.RequireRole("Administrator")).ContinuesWhenDisabled(ModuleIds.Organisations, "Maintain platform branding").WithName("RemoveOrganisationLogo").Produces<CustomerInfo>();
        // Existing customers can always inspect and cancel payment obligations when checkout is disabled.
        var billing = group.MapGroup("/billing").RequireAuthorization();
        var files = accounts.MapGroup("/files").OwnedByModule(ModuleIds.Organisations).RequireCapability(CapabilityIds.OrganisationFiles);
        files.MapGet("", async (ClaimsPrincipal u, OrganisationFiles s, CancellationToken ct, int pageNumber = 1, int pageSize = 10, string sort = "name", string direction = "asc") => (await s.List(Actor(u), pageNumber, pageSize, sort, direction, ct)).ToHttp()).WithName("GetOrganisationFiles").Produces<OrganisationFilePage>();
        files.MapPost("/upload", async (string name, ClaimsPrincipal u, HttpContext context, OrganisationFiles s, MyFilesService settings, CancellationToken ct) =>
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
        billing.MapGet("", async (ClaimsPrincipal u, IBilling s, CancellationToken ct) => (await s.Summary(Actor(u), ct)).ToHttp()).ContinuesWhenDisabled(ModuleIds.Billing, "Read existing subscription obligations").WithName("GetCustomerBilling").Produces<BillingSummary>();
        billing.MapPost("/trial", async (ClaimsPrincipal u, StartTrial r, IBilling s, CancellationToken ct) => (await s.Trial(Actor(u), r, ct)).ToHttp()).OwnedByModule(ModuleIds.Billing).RequireCapability(CapabilityIds.Billing).WithName("StartBillingTrial");
        billing.MapPost("/checkout", async (ClaimsPrincipal u, CheckoutRequest r, IBilling s, CancellationToken ct) =>
        {
            try { return (await s.Checkout(Actor(u), r, ct)).ToHttp(); }
            catch (Exception ex) when (ex is PaymentProviderException or HttpRequestException or TaskCanceledException) { return Results.Problem(statusCode: 503, title: ApiResults.Message("billing.provider_unavailable"), extensions: new Dictionary<string, object?> { ["code"] = "billing.provider_unavailable" }); }
        }).OwnedByModule(ModuleIds.Billing).RequireCapability(CapabilityIds.Billing).WithName("CreateSubscriptionCheckout").Produces<CheckoutResponse>();
        billing.MapPost("/cancel", async (ClaimsPrincipal u, IBilling s, CancellationToken ct) => (await s.Cancel(Actor(u), ct)).ToHttp()).ContinuesWhenDisabled(ModuleIds.Billing, "Cancel an existing subscription").WithName("CancelCustomerSubscription");
        var settings = group.MapGroup("/configuration/billing").RequireAuthorization(Permissions.Settings).RequireAuthorization(p => p.RequireRole("Administrator"));
        settings.MapGet("", async (IBilling s, CancellationToken ct) => Results.Ok(await s.Settings(ct))).ContinuesWhenDisabled(ModuleIds.Billing, "Inspect provider configuration").WithName("GetBillingSettings").Produces<BillingSettings>();
        settings.MapPost("", async (ClaimsPrincipal u, BillingSettings r, IBilling s, CancellationToken ct) => (await s.SaveSettings(Actor(u), r, ct)).ToHttp()).ContinuesWhenDisabled(ModuleIds.Billing, "Maintain providers for accepted obligations").WithName("SaveBillingSettings");
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
        }).AllowAnonymous().DisableAntiforgery().WithTags("Framework").ContinuesWhenDisabled(ModuleIds.Billing, "Reconcile accepted payments").WithName("ReceivePaymentCallback");
        return app;
    }
}
