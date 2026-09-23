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

public static class CommercialBillingEndpoints
{
    private static Guid Actor(ClaimsPrincipal user) => Guid.Parse(user.FindFirstValue("sub")!);
    public static RouteGroupBuilder MapCommercialBillingEndpoints(this RouteGroupBuilder group)
    {
        var billing = group.MapGroup("/commercial-billing").RequireAuthorization(CommercialBillingPermissions.Read);
        billing.MapGet("", async (ClaimsPrincipal u, ICommercialBilling s, CancellationToken ct) => (await s.Summary(Actor(u), ct)).ToHttp()).ContinuesWhenDisabled(ModuleIds.CommercialBilling, "Read existing subscription obligations").WithName("GetCommercialBilling").Produces<CommercialBillingSummary>();
        billing.MapPost("/trial", async (ClaimsPrincipal u, StartCommercialTrial r, ICommercialBilling s, CancellationToken ct) => (await s.Trial(Actor(u), r, ct)).ToHttp()).RequireAuthorization(CommercialBillingPermissions.Manage).OwnedByModule(ModuleIds.CommercialBilling).RequireCapability(CapabilityIds.CommercialBilling).WithName("StartCommercialBillingTrial");
        billing.MapPost("/checkout", async (ClaimsPrincipal u, CommercialCheckoutRequest r, ICommercialBilling s, CancellationToken ct) =>
        {
            try { return (await s.Checkout(Actor(u), r, ct)).ToHttp(); }
            catch (Exception ex) when (ex is PaymentProviderException or HttpRequestException or TaskCanceledException) { return Results.Problem(statusCode: 503, title: ApiResults.Message("payments.provider_unavailable"), extensions: new Dictionary<string, object?> { ["code"] = "payments.provider_unavailable" }); }
        }).RequireAuthorization(CommercialBillingPermissions.Manage).OwnedByModule(ModuleIds.CommercialBilling).RequireCapability(CapabilityIds.CommercialBilling).WithName("CreateCommercialSubscriptionCheckout").Produces<PaymentCheckout>();
        billing.MapPost("/cancel", async (ClaimsPrincipal u, ICommercialBilling s, CancellationToken ct) => (await s.Cancel(Actor(u), ct)).ToHttp()).RequireAuthorization(CommercialBillingPermissions.Manage).ContinuesWhenDisabled(ModuleIds.CommercialBilling, "Cancel an existing subscription").WithName("CancelCommercialSubscription");
        var commercialSettings = group.MapGroup("/configuration/commercial-billing").RequireAuthorization(Permissions.Settings).RequireAuthorization(p => p.RequireRole("Administrator"));
        commercialSettings.MapGet("", async (ICommercialBilling s, CancellationToken ct) => Results.Ok(await s.Settings(ct))).ContinuesWhenDisabled(ModuleIds.CommercialBilling, "Inspect commercial billing policy").WithName("GetCommercialBillingSettings").Produces<CommercialBillingSettings>();
        commercialSettings.MapPost("", async (ClaimsPrincipal u, CommercialBillingSettings r, ICommercialBilling s, CancellationToken ct) => (await s.SaveSettings(Actor(u), r, ct)).ToHttp()).ContinuesWhenDisabled(ModuleIds.CommercialBilling, "Maintain accepted subscription policy").WithName("SaveCommercialBillingSettings");
        return group;
    }
    public static WebApplication MapCommercialBillingCallbacks(this WebApplication app)
    {
        app.MapPost("/api/v1/commercial-billing/callbacks/{provider}", async (string provider, HttpRequest request, CommercialBillingCallbacks callbacks, CancellationToken ct) =>
        {
            if (provider is not ("stripe" or "payfast")) return Results.NotFound();
            try
            {
                // StreamReader is bounded even for chunked requests. Never persist/log the raw notification.
                using var reader = new StreamReader(request.Body); var buffer = new char[65537]; var count = 0;
                while (count < buffer.Length) { var read = await reader.ReadAsync(buffer.AsMemory(count), ct); if (read == 0) break; count += read; }
                if (count > 65536) return Results.StatusCode(413);
                var body = new string(buffer, 0, count);
                var valid = await callbacks.Receive(provider, body, request.Headers["Stripe-Signature"].ToString(), ct);
                return valid ? Results.Ok() : Results.BadRequest();
            }
            catch (Exception ex) when (ex is JsonException or KeyNotFoundException or FormatException or InvalidOperationException) { return Results.BadRequest(); }
            catch (Exception ex) when (ex is PaymentProviderException or HttpRequestException or TaskCanceledException) { return Results.StatusCode(503); }
        }).AllowAnonymous().DisableAntiforgery().WithTags("Framework").ContinuesWhenDisabled(ModuleIds.CommercialBilling, "Reconcile accepted payments").WithName("ReceiveCommercialBillingPaymentCallback");
        return app;
    }
}
