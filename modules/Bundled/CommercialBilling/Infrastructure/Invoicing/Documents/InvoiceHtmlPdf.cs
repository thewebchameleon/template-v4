using System.Globalization;
using System.Net;
using System.Net.Http.Headers;
using System.Text;
using TemplateV4.Application.Invoicing;
using TemplateV4.Domain.Invoicing;

namespace TemplateV4.Infrastructure.Invoicing;

public sealed class InvoiceHtmlPdf(HttpClient http)
{
    private static readonly string Template = ReadResource("TemplateV4.Infrastructure.Invoicing.Documents.invoice.html");
    private static readonly string RegularFont = Convert.ToBase64String(ReadResourceBytes("TemplateV4.Infrastructure.Invoicing.Fonts.NotoSans-Regular.ttf"));
    private static readonly string BoldFont = Convert.ToBase64String(ReadResourceBytes("TemplateV4.Infrastructure.Invoicing.Fonts.NotoSans-Bold.ttf"));
    private static readonly CultureInfo Culture = CultureInfo.GetCultureInfo("en-ZA");

    private static byte[] ReadResourceBytes(string name)
    {
        using var stream = typeof(InvoiceHtmlPdf).Assembly.GetManifestResourceStream(name)
            ?? throw new InvalidOperationException($"Invoice PDF resource {name} is missing.");
        using var output = new MemoryStream();
        stream.CopyTo(output);
        return output.ToArray();
    }

    private static string ReadResource(string name) => Encoding.UTF8.GetString(ReadResourceBytes(name));
    private static string Html(string? value) => WebUtility.HtmlEncode(value ?? "").Replace("\r\n", "\n", StringComparison.Ordinal).Replace("\n", "<br>", StringComparison.Ordinal);
    private static string Money(decimal value) => value.ToString("N2", Culture);

    public async Task<byte[]> Render(CommercialDocument document, byte[]? logoPng, CancellationToken ct)
    {
        if (http.BaseAddress is null) throw new InvalidOperationException("Pdf:RendererUrl is required to issue invoices.");
        var snapshot = document.Snapshot;
        var rows = new StringBuilder();
        foreach (var line in snapshot.Totals.Lines)
        {
            var category = line.Source.Category switch { ChargeCategory.Government => "Government charge", ChargeCategory.ServiceFee => "Service fee", _ => "Extra" };
            var treatment = line.Source.TaxTreatment switch { TaxTreatment.Standard => "Standard rated", TaxTreatment.ZeroRated => "Zero rated", TaxTreatment.Exempt => "Exempt", _ => "Outside scope" };
            rows.Append("<tr><td class=\"description\">").Append(Html(line.Source.Description))
                .Append("<span class=\"line-detail\">").Append(category).Append(" · ").Append(treatment).Append("</span></td><td class=\"number\">")
                .Append(line.Source.Quantity.ToString("0.####", Culture)).Append("</td><td class=\"number\">R ")
                .Append(Money(line.Source.UnitPrice)).Append("</td><td class=\"number\">")
                .Append(line.Source.TaxRate.ToString("0.##", Culture)).Append("%</td><td class=\"number\">R ")
                .Append(Money(line.Total)).Append("</td></tr>");
        }
        var fields = new Dictionary<string, string>
        {
            ["REGULAR_FONT"] = RegularFont,
            ["BOLD_FONT"] = BoldFont,
            ["LOGO"] = logoPng is null ? "" : $"<img class=\"logo\" src=\"data:image/png;base64,{Convert.ToBase64String(logoPng)}\" alt=\"\">",
            ["DOCUMENT_NUMBER"] = Html(document.Number),
            ["TITLE"] = snapshot.Issuer.VatRegistered ? "Tax invoice" : "Digital invoice",
            ["ISSUED_AT"] = document.IssuedAt.ToString("dd MMM yyyy", Culture),
            ["ISSUER_NAME"] = Html(snapshot.Issuer.Name),
            ["ISSUER_ADDRESS"] = Html(snapshot.Issuer.Address),
            ["ISSUER_CONTACT"] = Html(snapshot.Issuer.Contact),
            ["ISSUER_VAT"] = snapshot.Issuer.VatRegistered ? $"<p>VAT registration: {Html(snapshot.Issuer.VatNumber)}</p>" : "",
            ["CUSTOMER_NAME"] = Html(snapshot.Customer.Name),
            ["CUSTOMER_ADDRESS"] = Html(snapshot.Customer.Address),
            ["CUSTOMER_EMAIL"] = Html(snapshot.Customer.Email),
            ["CUSTOMER_PHONE"] = Html(snapshot.Customer.Phone),
            ["CUSTOMER_VAT"] = string.IsNullOrWhiteSpace(snapshot.Customer.VatNumber) ? "" : $"<p>VAT registration: {Html(snapshot.Customer.VatNumber)}</p>",
            ["REFERENCE"] = string.IsNullOrWhiteSpace(snapshot.Reference) ? "" : $"<p><strong>Reference:</strong> {Html(snapshot.Reference)}</p>",
            ["LINES"] = rows.ToString(),
            ["NET"] = Money(snapshot.Totals.Net),
            ["TAX"] = Money(snapshot.Totals.Tax),
            ["TOTAL"] = Money(document.Amount),
            ["CREDITS"] = Money(document.Credits),
            ["PAID"] = Money(document.Paid),
            ["REFUNDED"] = Money(document.Refunded),
            ["BALANCE"] = Money(Math.Max(0, document.Amount - document.Credits - document.Paid)),
            ["PAYMENT_INSTRUCTIONS"] = Html(snapshot.Issuer.PaymentInstructions)
        };
        var html = Template;
        foreach (var (name, value) in fields) html = html.Replace("{{" + name + "}}", value, StringComparison.Ordinal);
        using var form = new MultipartFormDataContent();
        using var content = new ByteArrayContent(Encoding.UTF8.GetBytes(html));
        content.Headers.ContentType = new MediaTypeHeaderValue("text/html") { CharSet = "utf-8" };
        form.Add(content, "files", "index.html");
        form.Add(new StringContent("true"), "printBackground");
        form.Add(new StringContent("true"), "preferCssPageSize");
        using var response = await http.PostAsync("forms/chromium/convert/html", form, ct);
        response.EnsureSuccessStatusCode();
        var pdf = await response.Content.ReadAsByteArrayAsync(ct);
        if (pdf.Length < 5 || !pdf.AsSpan(0, 5).SequenceEqual("%PDF-"u8))
            throw new InvalidOperationException("The invoice renderer did not return a PDF.");
        return pdf;
    }
}
