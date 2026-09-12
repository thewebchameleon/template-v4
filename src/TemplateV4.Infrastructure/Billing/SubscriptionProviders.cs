using System.Globalization;
using System.Net;
using System.Net.Http.Headers;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Configuration;
using TemplateV4.Application.Billing;

namespace TemplateV4.Infrastructure.Billing;

public sealed class PaymentProviderException : Exception
{
    public PaymentProviderException() : base("billing.provider_unavailable") { }
}
public static class PaymentHttp
{
    public static async Task<JsonElement> Json(HttpClient http, HttpRequestMessage request, CancellationToken ct)
    {
        using var response = await http.SendAsync(request, ct);
        if (!response.IsSuccessStatusCode) throw new PaymentProviderException();
        using var document = JsonDocument.Parse(await response.Content.ReadAsStringAsync(ct)); return document.RootElement.Clone();
    }
    public static string Required(IConfiguration config, string key) => config[key] is { Length: > 0 } value ? value : throw new PaymentProviderException();
    public static string PublicUrl(IConfiguration config, string key)
    {
        var value = Required(config, key).TrimEnd('/');
        if (!Uri.TryCreate(value, UriKind.Absolute, out var uri) || uri.Scheme != "https" || !string.IsNullOrEmpty(uri.UserInfo) || uri.Query != "" || uri.Fragment != "") throw new PaymentProviderException();
        return value;
    }
}
public sealed class StripeSubscriptions(HttpClient http, IConfiguration config, TimeProvider time) : ISubscriptionProvider
{
    public string Id => "stripe";
    public bool Configured => !string.IsNullOrEmpty(config["Billing:Stripe:SecretKey"]) && !string.IsNullOrEmpty(config["Billing:Stripe:WebhookSecret"]);
    private HttpRequestMessage Request(HttpMethod method, string path, Dictionary<string, string>? fields = null)
    {
        var request = new HttpRequestMessage(method, "https://api.stripe.com/v1/" + path);
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", PaymentHttp.Required(config, "Billing:Stripe:SecretKey"));
        request.Headers.Add("Stripe-Version", "2025-06-30.basil");
        if (fields != null) request.Content = new FormUrlEncodedContent(fields);
        return request;
    }
    public async Task<CheckoutResponse> Checkout(PaymentOrder order, CancellationToken ct)
    {
        var url = PaymentHttp.PublicUrl(config, "Web:PublicUrl") + "/organizations/" + order.CustomerId + "/billing";
        using var request = Request(HttpMethod.Post, "checkout/sessions", new()
        {
            ["mode"] = "subscription", ["client_reference_id"] = order.Id.ToString(), ["success_url"] = url, ["cancel_url"] = url,
            ["metadata[orderId]"] = order.Id.ToString(), ["subscription_data[metadata][orderId]"] = order.Id.ToString(),
            ["line_items[0][price_data][currency]"] = order.Currency.ToLowerInvariant(), ["line_items[0][price_data][unit_amount]"] = order.UnitMinor.ToString(CultureInfo.InvariantCulture),
            ["line_items[0][price_data][product_data][name]"] = order.Name, ["line_items[0][price_data][recurring][interval]"] = order.Interval,
            ["line_items[0][quantity]"] = order.Quantity.ToString(CultureInfo.InvariantCulture),
            ["expires_at"] = order.CreatedAt.AddHours(23).ToUnixTimeSeconds().ToString(CultureInfo.InvariantCulture)
        });
        request.Headers.Add("Idempotency-Key", order.Id.ToString());
        var session = await PaymentHttp.Json(http, request, ct);
        return new(order.Id, session.GetProperty("url").GetString()!, null, session.GetProperty("id").GetString());
    }
    public async Task<ProviderSubscription?> Fetch(PaymentOrder order, string? subscription, CancellationToken ct)
    {
        if (subscription is null && order.CheckoutReference is not null)
        {
            using var sessionRequest = Request(HttpMethod.Get, "checkout/sessions/" + Uri.EscapeDataString(order.CheckoutReference));
            var session = await PaymentHttp.Json(http, sessionRequest, ct);
            if (session.GetProperty("client_reference_id").GetString() != order.Id.ToString()) throw new PaymentProviderException();
            subscription = session.GetProperty("subscription").GetString();
        }
        if (subscription is null) return null;
        using var request = Request(HttpMethod.Get, "subscriptions/" + Uri.EscapeDataString(subscription) + "?expand[]=latest_invoice");
        var value = await PaymentHttp.Json(http, request, ct);
        if (value.GetProperty("metadata").GetProperty("orderId").GetString() != order.Id.ToString()) throw new PaymentProviderException();
        var items = value.GetProperty("items").GetProperty("data");
        if (items.GetArrayLength() != 1) throw new PaymentProviderException();
        var item = items[0]; var price = item.GetProperty("price");
        var amount = checked(price.GetProperty("unit_amount").GetInt64() * item.GetProperty("quantity").GetInt32());
        var currency = price.GetProperty("currency").GetString()!.ToUpperInvariant();
        if (amount != checked(order.UnitMinor * order.Quantity) || currency != order.Currency || price.GetProperty("recurring").GetProperty("interval").GetString() != order.Interval) throw new PaymentProviderException();
        DateTimeOffset? until = null;
        var invoice = value.GetProperty("latest_invoice");
        if (invoice.ValueKind == JsonValueKind.Object && invoice.GetProperty("status").GetString() == "paid" && invoice.GetProperty("amount_paid").GetInt64() == amount && invoice.GetProperty("currency").GetString()!.ToUpperInvariant() == currency)
            until = DateTimeOffset.FromUnixTimeSeconds(item.GetProperty("current_period_end").GetInt64());
        var state = value.GetProperty("status").GetString()!;
        if (value.GetProperty("cancel_at_period_end").GetBoolean()) state = "canceled";
        return new(subscription, state, until, amount, currency);
    }
    public async Task Cancel(string subscription, CancellationToken ct)
    {
        using var request = Request(HttpMethod.Post, "subscriptions/" + Uri.EscapeDataString(subscription), new() { ["cancel_at_period_end"] = "true" });
        request.Headers.Add("Idempotency-Key", "cancel-" + subscription);
        await PaymentHttp.Json(http, request, ct);
    }
    public async Task<bool> ExpireCheckout(PaymentOrder order, CancellationToken ct)
    {
        if (order.CheckoutReference is null) return order.CreatedAt.AddHours(24) < time.GetUtcNow();
        using var read = Request(HttpMethod.Get, "checkout/sessions/" + Uri.EscapeDataString(order.CheckoutReference));
        var session = await PaymentHttp.Json(http, read, ct); var state = session.GetProperty("status").GetString();
        if (state == "complete") return false;
        if (state == "open")
        {
            using var expire = Request(HttpMethod.Post, "checkout/sessions/" + Uri.EscapeDataString(order.CheckoutReference) + "/expire", []);
            await PaymentHttp.Json(http, expire, ct);
        }
        return true;
    }
    public bool Verify(string body, string header)
    {
        var parts = header.Split(',').Select(x => x.Split('=', 2)).Where(x => x.Length == 2).ToArray();
        if (!long.TryParse(parts.FirstOrDefault(x => x[0] == "t")?[1], out var stamp) || Math.Abs(time.GetUtcNow().ToUnixTimeSeconds() - stamp) > 300) return false;
        var secret = config["Billing:Stripe:WebhookSecret"]; if (string.IsNullOrEmpty(secret)) return false;
        var expected = HMACSHA256.HashData(Encoding.UTF8.GetBytes(secret), Encoding.UTF8.GetBytes(stamp.ToString(CultureInfo.InvariantCulture) + "." + body));
        return parts.Where(x => x[0] == "v1").Any(x => x[1].Length == 64 && x[1].All(Uri.IsHexDigit) && CryptographicOperations.FixedTimeEquals(expected, Convert.FromHexString(x[1])));
    }
    public async Task<(string Id, Guid Order, string Subscription)?> Event(string body, string header, CancellationToken ct)
    {
        if (!Verify(body, header)) return null;
        using var document = JsonDocument.Parse(body); var value = document.RootElement;
        if (value.TryGetProperty("account", out _)) return null; // Direct merchant account only; Connect is not enabled.
        if (value.GetProperty("livemode").GetBoolean() != config.GetValue("Billing:Stripe:Live", false)) return null;
        var data = value.GetProperty("data").GetProperty("object"); var kind = value.GetProperty("type").GetString();
        string? subscription = null; string? orderId = null;
        if (kind is "checkout.session.completed" or "checkout.session.async_payment_succeeded")
        { subscription = data.GetProperty("subscription").GetString(); orderId = data.GetProperty("client_reference_id").GetString(); }
        else if (kind is "customer.subscription.updated" or "customer.subscription.deleted")
        { subscription = data.GetProperty("id").GetString(); orderId = data.GetProperty("metadata").GetProperty("orderId").GetString(); }
        else if (kind is "invoice.paid" or "invoice.payment_failed")
        {
            subscription = data.GetProperty("parent").GetProperty("subscription_details").GetProperty("subscription").GetString();
            if (subscription is not null)
            {
                using var request = Request(HttpMethod.Get, "subscriptions/" + Uri.EscapeDataString(subscription));
                orderId = (await PaymentHttp.Json(http, request, ct)).GetProperty("metadata").GetProperty("orderId").GetString();
            }
        }
        return Guid.TryParse(orderId, out var order) && subscription is { Length: > 0 and <= 128 } ? (value.GetProperty("id").GetString()!, order, subscription) : null;
    }
}

public sealed class PayFastSubscriptions(HttpClient http, IConfiguration config, TimeProvider time) : ISubscriptionProvider
{
    public string Id => "payfast";
    public bool Configured => !string.IsNullOrEmpty(config["Billing:PayFast:MerchantId"]) && !string.IsNullOrEmpty(config["Billing:PayFast:MerchantKey"]) && !string.IsNullOrEmpty(config["Billing:PayFast:Passphrase"]);
    private string Host => config.GetValue("Billing:PayFast:Sandbox", true) ? "sandbox.payfast.co.za" : "www.payfast.co.za";
    public static string Encode(string value) => Uri.EscapeDataString(value.Trim()).Replace("%20", "+", StringComparison.Ordinal).Replace("~", "%7E", StringComparison.Ordinal);
    public static string Parameters(IEnumerable<KeyValuePair<string, string>> fields, bool includeEmpty = false) => string.Join('&', fields.Where(x => x.Key != "signature" && (includeEmpty || x.Value != "")).Select(x => x.Key + "=" + Encode(x.Value)));
    public static string Signature(IEnumerable<KeyValuePair<string, string>> fields, string passphrase, bool includeEmpty = false) => Convert.ToHexStringLower(MD5.HashData(Encoding.UTF8.GetBytes(Parameters(fields, includeEmpty) + "&passphrase=" + Encode(passphrase))));
    public Task<CheckoutResponse> Checkout(PaymentOrder order, CancellationToken ct)
    {
        if (order.Currency != "ZAR" || order.UnitMinor * order.Quantity < 500) throw new PaymentProviderException();
        var url = PaymentHttp.PublicUrl(config, "Web:PublicUrl") + "/organizations/" + order.CustomerId + "/billing";
        var amount = (order.UnitMinor * order.Quantity / 100m).ToString("F2", CultureInfo.InvariantCulture);
        var fields = new Dictionary<string, string>
        {
            ["merchant_id"] = PaymentHttp.Required(config, "Billing:PayFast:MerchantId"), ["merchant_key"] = PaymentHttp.Required(config, "Billing:PayFast:MerchantKey"),
            ["return_url"] = url, ["cancel_url"] = url, ["notify_url"] = PaymentHttp.PublicUrl(config, "Billing:PublicApiUrl") + "/api/v1/billing/callbacks/payfast",
            ["m_payment_id"] = order.Id.ToString(), ["amount"] = amount, ["item_name"] = order.Name,
            ["subscription_type"] = "1", ["billing_date"] = (order.Interval == "month" ? order.CreatedAt.AddMonths(1) : order.CreatedAt.AddYears(1)).ToOffset(TimeSpan.FromHours(2)).ToString("yyyy-MM-dd", CultureInfo.InvariantCulture), ["recurring_amount"] = amount, ["frequency"] = order.Interval == "month" ? "3" : "6", ["cycles"] = "0"
        };
        fields["signature"] = Signature(fields, PaymentHttp.Required(config, "Billing:PayFast:Passphrase"));
        return Task.FromResult(new CheckoutResponse(order.Id, "https://" + Host + "/eng/process", fields));
    }
    private HttpRequestMessage Request(string token, string action, HttpMethod method)
    {
        if (!Guid.TryParse(token, out _)) throw new PaymentProviderException();
        var fields = new SortedDictionary<string, string>(StringComparer.Ordinal)
        {
            ["merchant-id"] = PaymentHttp.Required(config, "Billing:PayFast:MerchantId"), ["version"] = "v1", ["timestamp"] = time.GetUtcNow().ToString("yyyy-MM-ddTHH:mm:sszzz", CultureInfo.InvariantCulture),
            ["passphrase"] = PaymentHttp.Required(config, "Billing:PayFast:Passphrase")
        };
        var signature = Convert.ToHexStringLower(MD5.HashData(Encoding.UTF8.GetBytes(Parameters(fields))));
        var request = new HttpRequestMessage(method, "https://api.payfast.co.za/subscriptions/" + Uri.EscapeDataString(token) + "/" + action + (config.GetValue("Billing:PayFast:Sandbox", true) ? "?testing=true" : ""));
        foreach (var field in fields.Where(x => x.Key != "passphrase")) request.Headers.Add(field.Key, field.Value);
        request.Headers.Add("signature", signature); return request;
    }
    public async Task<ProviderSubscription?> Fetch(PaymentOrder order, string? subscription, CancellationToken ct)
    {
        if (subscription is null) return null;
        using var request = Request(subscription, "fetch", HttpMethod.Get); var root = await PaymentHttp.Json(http, request, ct);
        if (root.GetProperty("status").GetString() != "success") throw new PaymentProviderException();
        var value = root.GetProperty("data").GetProperty("response");
        var amount = value.GetProperty("amount").GetInt64();
        if (amount != order.UnitMinor * order.Quantity || value.GetProperty("frequency").GetInt32() != (order.Interval == "month" ? 3 : 6)) throw new PaymentProviderException();
        return new(subscription, value.GetProperty("status_text").GetString() == "ACTIVE" ? "active" : "canceled", null, amount, "ZAR");
    }
    public async Task<DateTimeOffset> NextPayment(PaymentOrder order, string subscription, CancellationToken ct)
    {
        using var request = Request(subscription, "fetch", HttpMethod.Get); var root = await PaymentHttp.Json(http, request, ct);
        var value = root.GetProperty("data").GetProperty("response");
        if (root.GetProperty("status").GetString() != "success" || value.GetProperty("amount").GetInt64() != order.UnitMinor * order.Quantity || value.GetProperty("frequency").GetInt32() != (order.Interval == "month" ? 3 : 6)) throw new PaymentProviderException();
        return DateTimeOffset.Parse(value.GetProperty("run_date").GetString()!, CultureInfo.InvariantCulture);
    }
    public async Task Cancel(string subscription, CancellationToken ct)
    {
        using var request = Request(subscription, "cancel", HttpMethod.Put); var root = await PaymentHttp.Json(http, request, ct);
        if (root.GetProperty("status").GetString() != "success" || !root.GetProperty("data").GetProperty("response").GetBoolean()) throw new PaymentProviderException();
    }
    public async Task<bool> Verify(Dictionary<string, string> fields, CancellationToken ct)
    {
        if (!Configured || fields.GetValueOrDefault("merchant_id") != config["Billing:PayFast:MerchantId"] || fields.GetValueOrDefault("signature") is not { Length: 32 } signature || !signature.All(Uri.IsHexDigit)) return false;
        if (!CryptographicOperations.FixedTimeEquals(Convert.FromHexString(signature), Convert.FromHexString(Signature(fields, config["Billing:PayFast:Passphrase"]!, true)))) return false;
        using var request = new HttpRequestMessage(HttpMethod.Post, "https://" + Host + "/eng/query/validate") { Content = new StringContent(Parameters(fields, true), Encoding.UTF8, "application/x-www-form-urlencoded") };
        using var response = await http.SendAsync(request, ct);
        if (!response.IsSuccessStatusCode) throw new PaymentProviderException();
        return (await response.Content.ReadAsStringAsync(ct)).Trim() == "VALID";
    }
}
