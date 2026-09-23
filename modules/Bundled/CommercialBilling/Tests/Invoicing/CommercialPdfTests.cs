using TemplateV4.Application.Crm;
using TemplateV4.Application.Invoicing;
using TemplateV4.Domain.Invoicing;
using TemplateV4.Infrastructure.Invoicing;
using Xunit;

namespace TemplateV4.Application.Tests;

public sealed class CommercialPdfTests
{
    [Fact]
    public void Long_documents_embed_fonts_and_render_multiple_pages_from_snapshots()
    {
        var lines = Enumerable.Range(1, 120).Select(i => new CommercialLine($"Line {i}: Registrasie en lisensie — a deliberately long description for a fleet vehicle with supporting documentation and administration charges", ChargeCategory.ServiceFee, 2, 1234.56m, TaxTreatment.Standard, 15)).ToArray();
        var totals = CommercialRules.Price(lines);
        var snapshot = new CommercialSnapshot(new(Guid.NewGuid(), "Voorbeeld (Pty) Ltd", "123 Example Street\nCape Town\n8001", "accounts@example.test", "EFT payments\nUse the invoice number as reference.", true, "4123456789", "TEST"),
            new(CrmRecordKind.Company, "Long customer name — Voorbeeld-vloot", "customer@example.test", "0210000000", "1 Customer Road\nJohannesburg", null, [], null, [], [], null, null, null, null, null, null, DealOutcome.Open), totals, "Fleet processing");
        var document = new CommercialDocument(Guid.NewGuid(), Guid.NewGuid(), "TEST-I-00000001", CommercialDocumentKind.Invoice, Guid.NewGuid(), snapshot,
            new DateTimeOffset(2026, 9, 13, 10, 0, 0, TimeSpan.Zero), Guid.NewGuid(), null, null, null, null, false, null, null, 0, 0, 0, totals.Total);
        var pdf = CommercialPdf.Render(new(document, [], []));
        Assert.True(pdf.Length > 10000); Assert.Equal("%PDF", System.Text.Encoding.ASCII.GetString(pdf, 0, 4));
        using var stream = new MemoryStream(pdf); using var read = PdfSharp.Pdf.IO.PdfReader.Open(stream);
        Assert.True(read.PageCount >= 4);
        if (Environment.GetEnvironmentVariable("TEMPLATEV4_PDF_TEST_OUTPUT") is { Length: > 0 } output)
        { Directory.CreateDirectory(output); File.WriteAllBytes(Path.Combine(output, "commercial-multipage.pdf"), pdf); }
    }
    [Fact]
    public void Sequential_partial_credits_reverse_exact_original_tax_without_rounding_drift()
    {
        var original = CommercialRules.Price([new("Taxed", ChargeCategory.ServiceFee, 1, 0.10m, TaxTreatment.Standard, 15), new("Exempt", ChargeCategory.Extra, 1, 1, TaxTreatment.Exempt, 0)]);
        var first = CommercialRules.Credit(original, 0, 0.05m);
        var rest = CommercialRules.Credit(original, 0.05m, original.Total - 0.05m);
        Assert.Equal(original.Total, first.Total + rest.Total); Assert.Equal(original.Net, first.Net + rest.Net); Assert.Equal(original.Tax, first.Tax + rest.Tax);
    }

    [Fact]
    public void Organisation_logo_is_rendered_from_the_issued_brand_snapshot()
    {
        var totals = CommercialRules.Price([new("Service", ChargeCategory.ServiceFee, 1, 100, TaxTreatment.Exempt, 0)]);
        var snapshot = new CommercialSnapshot(new(Guid.NewGuid(), "Issuer", "Address", "contact@example.test", "", false, null, "ORG"),
            new(CrmRecordKind.Company, "Customer", "customer@example.test", null, null, null, [], null, [], [], null, null, null, null, null, null, DealOutcome.Open),
            totals, null, Guid.NewGuid(), "Example Organisation");
        var document = new CommercialDocument(Guid.NewGuid(), Guid.NewGuid(), "ORG-I-00000001", CommercialDocumentKind.Invoice,
            Guid.NewGuid(), snapshot, DateTimeOffset.UtcNow, Guid.NewGuid(), null, null, null, null, false, null, null, 0, 0, 0, totals.Total);
        var logo = Convert.FromBase64String("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=");

        var pdf = CommercialPdf.Render(new(document, [], []), logo);

        Assert.Equal("%PDF", System.Text.Encoding.ASCII.GetString(pdf, 0, 4));
        Assert.True(pdf.Length > 5000);
    }
}
