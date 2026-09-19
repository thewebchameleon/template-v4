using System.Globalization;
using System.Net;
using System.Security.Cryptography;
using System.Text;
using Microsoft.Extensions.Configuration;
using TemplateV4.Application.Payments;
using TemplateV4.Infrastructure.Payments;
using Xunit;

namespace TemplateV4.Application.Tests;

public sealed class PaymentProviderTests
{
    private static IConfiguration Config() => new ConfigurationBuilder().AddInMemoryCollection(new Dictionary<string, string?>
    {
        ["Web:PublicUrl"] = "https://example.test",
        ["Payments:PublicApiUrl"] = "https://api.example.test",
        ["Payments:Stripe:SecretKey"] = "test-key",
        ["Payments:Stripe:WebhookSecret"] = "test-webhook",
        ["Payments:PayFast:MerchantId"] = "10000100",
        ["Payments:PayFast:MerchantKey"] = "test-key",
        ["Payments:PayFast:Passphrase"] = "test salt"
    }).Build();
    private sealed class Responses(Func<HttpRequestMessage, Task<HttpResponseMessage>> send) : HttpMessageHandler
    { protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken ct) => send(request); }
    [Fact]
    public async Task Stripe_checkout_uses_stable_idempotency_and_server_prices_and_signed_events_expire()
    {
        var order = new PaymentRequest(Guid.NewGuid(), Guid.NewGuid(), "commercial-subscription", "Team", "month", "ZAR", 4900, 3, DateTimeOffset.UtcNow,
            "/commercial-billing", "/api/v1/commercial-billing/callbacks/stripe");
        using var http = new HttpClient(new Responses(async request =>
        {
            Assert.Equal("https://api.stripe.com/v1/checkout/sessions", request.RequestUri!.ToString());
            Assert.Equal(order.Id.ToString(), Assert.Single(request.Headers.GetValues("Idempotency-Key")));
            var body = WebUtility.UrlDecode(await request.Content!.ReadAsStringAsync());
            Assert.Contains("line_items[0][price_data][unit_amount]=4900", body); Assert.Contains("line_items[0][quantity]=3", body);
            Assert.Contains("subscription_data[metadata][paymentId]=" + order.Id, body);
            return new(HttpStatusCode.OK) { Content = new StringContent("{\"url\":\"https://checkout.stripe.com/test\",\"id\":\"cs_test\"}") };
        }));
        var stripe = new StripePaymentProvider(http, Config(), TimeProvider.System);
        Assert.Equal("cs_test", (await stripe.Checkout(order, default)).Reference);
        var stamp = DateTimeOffset.UtcNow.ToUnixTimeSeconds(); const string payload = "{\"id\":\"evt_test\"}";
        string Header(long timestamp) => "t=" + timestamp + ",v1=" + Convert.ToHexStringLower(HMACSHA256.HashData(Encoding.UTF8.GetBytes("test-webhook"), Encoding.UTF8.GetBytes(timestamp.ToString(CultureInfo.InvariantCulture) + "." + payload)));
        Assert.True(stripe.ValidSignature(payload, Header(stamp))); Assert.False(stripe.ValidSignature(payload + " ", Header(stamp))); Assert.False(stripe.ValidSignature(payload, Header(stamp - 600)));
    }
    [Fact]
    public async Task PayFast_signs_ordered_fields_including_empty_itn_values_and_requires_server_confirmation()
    {
        using var http = new HttpClient(new Responses(async request =>
        {
            Assert.Equal("https://sandbox.payfast.co.za/eng/query/validate", request.RequestUri!.ToString());
            Assert.Equal("merchant_id=10000100&item_description=&amount_gross=49.00", await request.Content!.ReadAsStringAsync());
            return new(HttpStatusCode.OK) { Content = new StringContent("VALID") };
        }));
        var payfast = new PayFastPaymentProvider(http, Config(), TimeProvider.System);
        var fields = new Dictionary<string, string> { ["merchant_id"] = "10000100", ["item_description"] = "", ["amount_gross"] = "49.00" };
        const string signed = "merchant_id=10000100&item_description=&amount_gross=49.00&passphrase=test+salt";
        fields["signature"] = Convert.ToHexStringLower(MD5.HashData(Encoding.UTF8.GetBytes(signed)));
        Assert.True(await payfast.Valid(fields, default)); fields["amount_gross"] = "0.01"; Assert.False(await payfast.Valid(fields, default));
        var order = new PaymentRequest(Guid.NewGuid(), Guid.NewGuid(), "commercial-subscription", "Team", "year", "ZAR", 49000, 2,
            new DateTimeOffset(2026, 9, 12, 0, 0, 0, TimeSpan.Zero), "/commercial-billing", "/api/v1/commercial-billing/callbacks/payfast");
        var checkout = await payfast.Checkout(order, default);
        Assert.Equal("980.00", checkout.Fields!["amount"]); Assert.Equal("6", checkout.Fields["frequency"]); Assert.Equal("2027-09-12", checkout.Fields["billing_date"]);
        Assert.Equal("https://api.example.test/api/v1/commercial-billing/callbacks/payfast", checkout.Fields["notify_url"]);
        await Assert.ThrowsAsync<PaymentProviderException>(() => payfast.Checkout(order with { Currency = "USD" }, default));
    }
}
