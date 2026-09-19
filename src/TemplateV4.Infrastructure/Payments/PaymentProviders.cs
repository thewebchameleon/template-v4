using System.Globalization;
using System.Net.Http.Headers;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Configuration;
using TemplateV4.Application.Payments;

namespace TemplateV4.Infrastructure.Payments;

public static class PaymentHttp
{
    public static async Task<JsonElement> Json(HttpClient http, HttpRequestMessage request, CancellationToken ct)
    {
        using var response = await http.SendAsync(request, ct);
        if (!response.IsSuccessStatusCode) throw new PaymentProviderException();
        using var document = JsonDocument.Parse(await response.Content.ReadAsStringAsync(ct));
        return document.RootElement.Clone();
    }

    public static string Required(IConfiguration config, string key) =>
        config[key] is { Length: > 0 } value ? value : throw new PaymentProviderException();

    public static string PublicUrl(IConfiguration config, string key)
    {
        var value = Required(config, key).TrimEnd('/');
        if (!Uri.TryCreate(value, UriKind.Absolute, out var uri) || uri.Scheme != "https" ||
            !string.IsNullOrEmpty(uri.UserInfo) || uri.Query != "" || uri.Fragment != "")
            throw new PaymentProviderException();
        return value;
    }
}

public sealed class StripePaymentProvider(HttpClient http, IConfiguration config, TimeProvider time) : IPaymentProvider, IPaymentCallbackVerifier
{
    public string Id => PaymentProviders.Stripe;
    string IPaymentCallbackVerifier.Provider => Id;
    public bool Ready => !string.IsNullOrEmpty(config["Payments:Stripe:SecretKey"]) && !string.IsNullOrEmpty(config["Payments:Stripe:WebhookSecret"]);
    public PaymentProviderCapabilities Capabilities { get; } = new(["ZAR", "USD", "EUR", "GBP"], ["month", "year"], true);

    private HttpRequestMessage Request(HttpMethod method, string path, Dictionary<string, string>? fields = null)
    {
        var request = new HttpRequestMessage(method, "https://api.stripe.com/v1/" + path);
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", PaymentHttp.Required(config, "Payments:Stripe:SecretKey"));
        request.Headers.Add("Stripe-Version", "2025-06-30.basil");
        if (fields != null) request.Content = new FormUrlEncodedContent(fields);
        return request;
    }

    public async Task<PaymentCheckout> Checkout(PaymentRequest payment, CancellationToken ct)
    {
        var url = PaymentHttp.PublicUrl(config, "Web:PublicUrl") + payment.ReturnPath;
        var fields = new Dictionary<string, string>
        {
            ["mode"] = payment.Interval == "one-time" ? "payment" : "subscription",
            ["client_reference_id"] = payment.Id.ToString(),
            ["success_url"] = url,
            ["cancel_url"] = url,
            ["metadata[paymentId]"] = payment.Id.ToString(),
            ["line_items[0][price_data][currency]"] = payment.Currency.ToLowerInvariant(),
            ["line_items[0][price_data][unit_amount]"] = payment.UnitMinor.ToString(CultureInfo.InvariantCulture),
            ["line_items[0][price_data][product_data][name]"] = payment.Description,
            ["line_items[0][quantity]"] = payment.Quantity.ToString(CultureInfo.InvariantCulture),
            ["expires_at"] = payment.CreatedAt.AddHours(23).ToUnixTimeSeconds().ToString(CultureInfo.InvariantCulture)
        };
        if (payment.Interval == "one-time") fields["payment_intent_data[metadata][paymentId]"] = payment.Id.ToString();
        else
        {
            fields["subscription_data[metadata][paymentId]"] = payment.Id.ToString();
            fields["line_items[0][price_data][recurring][interval]"] = payment.Interval;
        }
        using var request = Request(HttpMethod.Post, "checkout/sessions", fields);
        request.Headers.Add("Idempotency-Key", payment.Id.ToString());
        var session = await PaymentHttp.Json(http, request, ct);
        return new(payment.Id, session.GetProperty("url").GetString()!, null, session.GetProperty("id").GetString());
    }

    public async Task<ProviderPaymentSnapshot?> Fetch(PaymentRequest payment, string? reference, CancellationToken ct)
    {
        if (reference is null && payment.CheckoutReference is not null)
        {
            using var sessionRequest = Request(HttpMethod.Get, "checkout/sessions/" + Uri.EscapeDataString(payment.CheckoutReference));
            var session = await PaymentHttp.Json(http, sessionRequest, ct);
            if (session.GetProperty("client_reference_id").GetString() != payment.Id.ToString()) throw new PaymentProviderException();
            reference = payment.Interval == "one-time" ? session.GetProperty("payment_intent").GetString() : session.GetProperty("subscription").GetString();
        }
        if (reference is null) return null;
        if (payment.Interval == "one-time")
        {
            using var intentRequest = Request(HttpMethod.Get, "payment_intents/" + Uri.EscapeDataString(reference));
            var intent = await PaymentHttp.Json(http, intentRequest, ct);
            if (intent.GetProperty("metadata").GetProperty("paymentId").GetString() != payment.Id.ToString()) throw new PaymentProviderException();
            return new(reference, intent.GetProperty("status").GetString() == "succeeded" ? "paid" : "pending", null,
                intent.GetProperty("amount_received").GetInt64(), intent.GetProperty("currency").GetString()!.ToUpperInvariant());
        }
        using var request = Request(HttpMethod.Get, "subscriptions/" + Uri.EscapeDataString(reference) + "?expand[]=latest_invoice");
        var value = await PaymentHttp.Json(http, request, ct);
        if (value.GetProperty("metadata").GetProperty("paymentId").GetString() != payment.Id.ToString()) throw new PaymentProviderException();
        var items = value.GetProperty("items").GetProperty("data");
        if (items.GetArrayLength() != 1) throw new PaymentProviderException();
        var item = items[0]; var price = item.GetProperty("price");
        var amount = checked(price.GetProperty("unit_amount").GetInt64() * item.GetProperty("quantity").GetInt32());
        var currency = price.GetProperty("currency").GetString()!.ToUpperInvariant();
        if (amount != checked(payment.UnitMinor * payment.Quantity) || currency != payment.Currency ||
            price.GetProperty("recurring").GetProperty("interval").GetString() != payment.Interval) throw new PaymentProviderException();
        DateTimeOffset? until = null;
        var invoice = value.GetProperty("latest_invoice");
        if (invoice.ValueKind == JsonValueKind.Object && invoice.GetProperty("status").GetString() == "paid" &&
            invoice.GetProperty("amount_paid").GetInt64() == amount && invoice.GetProperty("currency").GetString()!.ToUpperInvariant() == currency)
            until = DateTimeOffset.FromUnixTimeSeconds(item.GetProperty("current_period_end").GetInt64());
        var state = value.GetProperty("status").GetString()!;
        if (value.GetProperty("cancel_at_period_end").GetBoolean()) state = "canceled";
        return new(reference, state, until, amount, currency);
    }

    public async Task Cancel(string subscription, CancellationToken ct)
    {
        using var request = Request(HttpMethod.Post, "subscriptions/" + Uri.EscapeDataString(subscription), new() { ["cancel_at_period_end"] = "true" });
        request.Headers.Add("Idempotency-Key", "cancel-" + subscription);
        await PaymentHttp.Json(http, request, ct);
    }

    public async Task<bool> ExpireCheckout(PaymentRequest payment, CancellationToken ct)
    {
        if (payment.CheckoutReference is null) return payment.CreatedAt.AddHours(24) < time.GetUtcNow();
        using var read = Request(HttpMethod.Get, "checkout/sessions/" + Uri.EscapeDataString(payment.CheckoutReference));
        var session = await PaymentHttp.Json(http, read, ct); var state = session.GetProperty("status").GetString();
        if (state == "complete") return false;
        if (state == "open")
        {
            using var expire = Request(HttpMethod.Post, "checkout/sessions/" + Uri.EscapeDataString(payment.CheckoutReference) + "/expire", []);
            await PaymentHttp.Json(http, expire, ct);
        }
        return true;
    }

    public bool ValidSignature(string body, string header)
    {
        var parts = header.Split(',').Select(x => x.Split('=', 2)).Where(x => x.Length == 2).ToArray();
        if (!long.TryParse(parts.FirstOrDefault(x => x[0] == "t")?[1], out var stamp) || Math.Abs(time.GetUtcNow().ToUnixTimeSeconds() - stamp) > 300) return false;
        var secret = config["Payments:Stripe:WebhookSecret"]; if (string.IsNullOrEmpty(secret)) return false;
        var expected = HMACSHA256.HashData(Encoding.UTF8.GetBytes(secret), Encoding.UTF8.GetBytes(stamp.ToString(CultureInfo.InvariantCulture) + "." + body));
        return parts.Where(x => x[0] == "v1").Any(x => x[1].Length == 64 && x[1].All(Uri.IsHexDigit) && CryptographicOperations.FixedTimeEquals(expected, Convert.FromHexString(x[1])));
    }

    public async Task<VerifiedPaymentNotification?> Verify(string body, string signature, CancellationToken ct)
    {
        if (!ValidSignature(body, signature)) return null;
        using var document = JsonDocument.Parse(body); var value = document.RootElement;
        if (value.TryGetProperty("account", out _) || value.GetProperty("livemode").GetBoolean() != config.GetValue("Payments:Stripe:Live", false)) return null;
        var data = value.GetProperty("data").GetProperty("object"); var kind = value.GetProperty("type").GetString();
        string? reference = null; string? paymentId = null; string? settlementId = null; var settlement = false; ProviderPaymentSnapshot? snapshot = null;
        if (kind is "checkout.session.completed" or "checkout.session.async_payment_succeeded")
        {
            paymentId = data.GetProperty("client_reference_id").GetString();
            reference = data.GetProperty("mode").GetString() == "payment" ? data.GetProperty("payment_intent").GetString() : data.GetProperty("subscription").GetString();
            if (data.GetProperty("mode").GetString() == "payment" && reference is not null &&
                data.TryGetProperty("amount_total", out var amount) && amount.ValueKind == JsonValueKind.Number)
            {
                snapshot = new(reference, data.GetProperty("payment_status").GetString() == "paid" ? "paid" : "pending", null,
                    amount.GetInt64(), data.GetProperty("currency").GetString()!.ToUpperInvariant());
                settlement = snapshot.State == "paid"; settlementId = settlement ? reference : null;
            }
        }
        else if (kind is "customer.subscription.updated" or "customer.subscription.deleted")
        { reference = data.GetProperty("id").GetString(); paymentId = data.GetProperty("metadata").GetProperty("paymentId").GetString(); }
        else if (kind is "invoice.paid" or "invoice.payment_failed")
        {
            reference = data.GetProperty("parent").GetProperty("subscription_details").GetProperty("subscription").GetString();
            if (reference is not null)
            {
                using var request = Request(HttpMethod.Get, "subscriptions/" + Uri.EscapeDataString(reference));
                paymentId = (await PaymentHttp.Json(http, request, ct)).GetProperty("metadata").GetProperty("paymentId").GetString();
            }
            settlement = kind == "invoice.paid"; settlementId = settlement ? data.GetProperty("id").GetString() : null;
        }
        return Guid.TryParse(paymentId, out var id) && reference is { Length: > 0 and <= 128 }
            ? new(Id, value.GetProperty("id").GetString()!, id, reference, snapshot, settlement, settlementId) : null;
    }
}

public sealed class PayFastPaymentProvider(HttpClient http, IConfiguration config, TimeProvider time) : IPaymentProvider, IPaymentCallbackVerifier
{
    public string Id => PaymentProviders.PayFast;
    string IPaymentCallbackVerifier.Provider => Id;
    public bool Ready => !string.IsNullOrEmpty(config["Payments:PayFast:MerchantId"]) && !string.IsNullOrEmpty(config["Payments:PayFast:MerchantKey"]) && !string.IsNullOrEmpty(config["Payments:PayFast:Passphrase"]);
    public PaymentProviderCapabilities Capabilities { get; } = new(["ZAR"], ["month", "year"], true);
    private string Host => config.GetValue("Payments:PayFast:Sandbox", true) ? "sandbox.payfast.co.za" : "www.payfast.co.za";
    public static string Encode(string value) => Uri.EscapeDataString(value.Trim()).Replace("%20", "+", StringComparison.Ordinal).Replace("~", "%7E", StringComparison.Ordinal);
    public static string Parameters(IEnumerable<KeyValuePair<string, string>> fields, bool includeEmpty = false) => string.Join('&', fields.Where(x => x.Key != "signature" && (includeEmpty || x.Value != "")).Select(x => x.Key + "=" + Encode(x.Value)));
    public static string Signature(IEnumerable<KeyValuePair<string, string>> fields, string passphrase, bool includeEmpty = false) => Convert.ToHexStringLower(MD5.HashData(Encoding.UTF8.GetBytes(Parameters(fields, includeEmpty) + "&passphrase=" + Encode(passphrase))));

    public Task<PaymentCheckout> Checkout(PaymentRequest payment, CancellationToken ct)
    {
        if (payment.Currency != "ZAR" || payment.UnitMinor * payment.Quantity < 500) throw new PaymentProviderException();
        var url = PaymentHttp.PublicUrl(config, "Web:PublicUrl") + payment.ReturnPath;
        var amount = (payment.UnitMinor * payment.Quantity / 100m).ToString("F2", CultureInfo.InvariantCulture);
        var fields = new Dictionary<string, string>
        {
            ["merchant_id"] = PaymentHttp.Required(config, "Payments:PayFast:MerchantId"),
            ["merchant_key"] = PaymentHttp.Required(config, "Payments:PayFast:MerchantKey"),
            ["return_url"] = url,
            ["cancel_url"] = url,
            ["notify_url"] = PaymentHttp.PublicUrl(config, "Payments:PublicApiUrl") + payment.CallbackPath,
            ["m_payment_id"] = payment.Id.ToString(),
            ["amount"] = amount,
            ["item_name"] = payment.Description
        };
        if (payment.Interval != "one-time")
        {
            fields["subscription_type"] = "1";
            fields["billing_date"] = (payment.Interval == "month" ? payment.CreatedAt.AddMonths(1) : payment.CreatedAt.AddYears(1)).ToOffset(TimeSpan.FromHours(2)).ToString("yyyy-MM-dd", CultureInfo.InvariantCulture);
            fields["recurring_amount"] = amount;
            fields["frequency"] = payment.Interval == "month" ? "3" : "6";
            fields["cycles"] = "0";
        }
        fields["signature"] = Signature(fields, PaymentHttp.Required(config, "Payments:PayFast:Passphrase"));
        return Task.FromResult(new PaymentCheckout(payment.Id, "https://" + Host + "/eng/process", fields));
    }

    private HttpRequestMessage Request(string token, string action, HttpMethod method)
    {
        if (!Guid.TryParse(token, out _)) throw new PaymentProviderException();
        var fields = new SortedDictionary<string, string>(StringComparer.Ordinal)
        {
            ["merchant-id"] = PaymentHttp.Required(config, "Payments:PayFast:MerchantId"), ["version"] = "v1",
            ["timestamp"] = time.GetUtcNow().ToString("yyyy-MM-ddTHH:mm:sszzz", CultureInfo.InvariantCulture),
            ["passphrase"] = PaymentHttp.Required(config, "Payments:PayFast:Passphrase")
        };
        var signature = Convert.ToHexStringLower(MD5.HashData(Encoding.UTF8.GetBytes(Parameters(fields))));
        var request = new HttpRequestMessage(method, "https://api.payfast.co.za/subscriptions/" + Uri.EscapeDataString(token) + "/" + action + (config.GetValue("Payments:PayFast:Sandbox", true) ? "?testing=true" : ""));
        foreach (var field in fields.Where(x => x.Key != "passphrase")) request.Headers.Add(field.Key, field.Value);
        request.Headers.Add("signature", signature); return request;
    }

    public async Task<ProviderPaymentSnapshot?> Fetch(PaymentRequest payment, string? reference, CancellationToken ct)
    {
        if (reference is null) return null;
        if (payment.Interval == "one-time") return null;
        using var request = Request(reference, "fetch", HttpMethod.Get); var root = await PaymentHttp.Json(http, request, ct);
        if (root.GetProperty("status").GetString() != "success") throw new PaymentProviderException();
        var value = root.GetProperty("data").GetProperty("response");
        var amount = value.GetProperty("amount").GetInt64();
        if (amount != payment.UnitMinor * payment.Quantity || value.GetProperty("frequency").GetInt32() != (payment.Interval == "month" ? 3 : 6)) throw new PaymentProviderException();
        return new(reference, value.GetProperty("status_text").GetString() == "ACTIVE" ? "active" : "canceled",
            null, amount, "ZAR");
    }

    public async Task<DateTimeOffset> NextPayment(PaymentRequest payment, string subscription, CancellationToken ct)
    {
        using var request = Request(subscription, "fetch", HttpMethod.Get); var root = await PaymentHttp.Json(http, request, ct);
        var value = root.GetProperty("data").GetProperty("response");
        if (root.GetProperty("status").GetString() != "success" || value.GetProperty("amount").GetInt64() != payment.UnitMinor * payment.Quantity || value.GetProperty("frequency").GetInt32() != (payment.Interval == "month" ? 3 : 6)) throw new PaymentProviderException();
        return DateTimeOffset.Parse(value.GetProperty("run_date").GetString()!, CultureInfo.InvariantCulture);
    }

    public async Task Cancel(string subscription, CancellationToken ct)
    {
        using var request = Request(subscription, "cancel", HttpMethod.Put); var root = await PaymentHttp.Json(http, request, ct);
        if (root.GetProperty("status").GetString() != "success" || !root.GetProperty("data").GetProperty("response").GetBoolean()) throw new PaymentProviderException();
    }

    public async Task<bool> Valid(Dictionary<string, string> fields, CancellationToken ct)
    {
        if (!Ready || fields.GetValueOrDefault("merchant_id") != config["Payments:PayFast:MerchantId"] || fields.GetValueOrDefault("signature") is not { Length: 32 } signature || !signature.All(Uri.IsHexDigit)) return false;
        if (!CryptographicOperations.FixedTimeEquals(Convert.FromHexString(signature), Convert.FromHexString(Signature(fields, config["Payments:PayFast:Passphrase"]!, true)))) return false;
        using var request = new HttpRequestMessage(HttpMethod.Post, "https://" + Host + "/eng/query/validate") { Content = new StringContent(Parameters(fields, true), Encoding.UTF8, "application/x-www-form-urlencoded") };
        using var response = await http.SendAsync(request, ct);
        if (!response.IsSuccessStatusCode) throw new PaymentProviderException();
        return (await response.Content.ReadAsStringAsync(ct)).Trim() == "VALID";
    }

    public async Task<VerifiedPaymentNotification?> Verify(string body, string signature, CancellationToken ct)
    {
        var fields = new Dictionary<string, string>();
        foreach (var pair in body.Split('&'))
        {
            var parts = pair.Split('=', 2);
            if (parts.Length != 2 || !fields.TryAdd(System.Net.WebUtility.UrlDecode(parts[0]), System.Net.WebUtility.UrlDecode(parts[1]))) return null;
        }
        if (!await Valid(fields, ct) || fields.GetValueOrDefault("payment_status") != "COMPLETE" ||
            !Guid.TryParse(fields.GetValueOrDefault("m_payment_id"), out var id) ||
            fields.GetValueOrDefault("pf_payment_id") is not { Length: > 0 and <= 100 } eventId ||
            !decimal.TryParse(fields.GetValueOrDefault("amount_gross"), NumberStyles.AllowDecimalPoint, CultureInfo.InvariantCulture, out var gross)) return null;
        var reference = fields.GetValueOrDefault("token") is { Length: > 0 and <= 128 } token ? token : eventId;
        return new(Id, eventId, id, reference, new(reference, "paid", null, checked((long)(gross * 100)), "ZAR"), true, eventId);
    }
}

public sealed class PaymentProviderRegistry(IEnumerable<IPaymentProvider> providers, IEnumerable<IPaymentCallbackVerifier> callbacks) : IPaymentProviderRegistry
{
    private readonly Dictionary<string, IPaymentProvider> _providers = providers.ToDictionary(x => x.Id, StringComparer.Ordinal);
    private readonly Dictionary<string, IPaymentCallbackVerifier> _callbacks = callbacks.ToDictionary(x => x.Provider, StringComparer.Ordinal);
    public IReadOnlyCollection<IPaymentProvider> All => _providers.Values;
    public IPaymentProvider Get(string provider) => _providers.GetValueOrDefault(provider) ?? throw new PaymentProviderException();
    public IPaymentCallbackVerifier Callback(string provider) => _callbacks.GetValueOrDefault(provider) ?? throw new PaymentProviderException();
}
