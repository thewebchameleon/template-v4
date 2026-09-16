using System.Globalization;
using PdfSharp.Drawing;
using PdfSharp.Fonts;
using PdfSharp.Pdf;
using TemplateV4.Application.Invoicing;
using TemplateV4.Domain.Invoicing;

namespace TemplateV4.Infrastructure.Invoicing;

/// <summary>Portable rendering of retained snapshots; never reads live customer or issuer settings.</summary>
public static class CommercialPdf
{
    static CommercialPdf() { GlobalFontSettings.FontResolver ??= new Fonts(); }
    private sealed class Fonts : IFontResolver
    {
        public FontResolverInfo ResolveTypeface(string familyName, bool bold, bool italic) => new(bold ? "NotoSans-Bold" : "NotoSans-Regular");
        public byte[] GetFont(string faceName)
        {
            using var stream = typeof(CommercialPdf).Assembly.GetManifestResourceStream($"TemplateV4.Infrastructure.Invoicing.Fonts.{faceName}.ttf")
                ?? throw new InvalidOperationException("The packaged document font is missing.");
            using var buffer = new MemoryStream(); stream.CopyTo(buffer); return buffer.ToArray();
        }
    }
    public static byte[] Render(CommercialDetail detail, byte[]? logoPng = null)
    {
        using var pdf = new PdfDocument(); var document = detail.Document; var snapshot = document.Snapshot;
        using var logoStream = logoPng is null ? null : new MemoryStream(logoPng, writable: false);
        using var logo = logoStream is null ? null : XImage.FromStream(logoStream);
        pdf.Info.Title = document.Number; pdf.Info.Author = snapshot.Issuer.Name;
        var regular = new XFont("Noto Sans", 9, XFontStyleEx.Regular);
        var bold = new XFont("Noto Sans", 10, XFontStyleEx.Bold);
        var title = new XFont("Noto Sans", 20, XFontStyleEx.Bold);
        var muted = new XSolidBrush(XColor.FromArgb(80, 93, 110));
        XGraphics graphics = null!; double y = 0; bool table = false;
        string Money(decimal value) => value.ToString("N2", CultureInfo.GetCultureInfo("en-ZA"));
        string Type() => document.Kind == CommercialDocumentKind.Invoice && snapshot.Issuer.VatRegistered ? "Tax invoice" : document.Kind switch
        { CommercialDocumentKind.Quotation => "Quotation", CommercialDocumentKind.Invoice => "Invoice", CommercialDocumentKind.Receipt => "Receipt", _ => "Credit note" };
        void Header()
        {
            graphics.DrawRectangle(new XSolidBrush(XColor.FromArgb(238, 242, 246)), 40, y, 515, 24);
            graphics.DrawString("Description / category", bold, XBrushes.Black, 46, y + 16);
            graphics.DrawString("Qty", bold, XBrushes.Black, 292, y + 16);
            graphics.DrawString("Unit excl.", bold, XBrushes.Black, 330, y + 16);
            graphics.DrawString("VAT", bold, XBrushes.Black, 419, y + 16);
            graphics.DrawString("Total ZAR", bold, XBrushes.Black, 483, y + 16); y += 34;
        }
        void Page()
        {
            graphics?.Dispose(); var page = pdf.AddPage(); page.Size = PdfSharp.PageSize.A4; graphics = XGraphics.FromPdfPage(page);
            if (logo is not null)
            {
                var scale = Math.Min(64d / logo.PixelWidth, 48d / logo.PixelHeight);
                graphics.DrawImage(logo, 40, 28, logo.PixelWidth * scale, logo.PixelHeight * scale);
            }
            var brandX = logo is null ? 40 : 120;
            if (!string.IsNullOrWhiteSpace(snapshot.OrganisationName))
                graphics.DrawString(snapshot.OrganisationName, bold, muted, brandX, 34);
            graphics.DrawString(Type(), title, XBrushes.Black, brandX, 62);
            graphics.DrawString(document.Number, bold, muted, new XRect(280, 32, 275, 28), XStringFormats.CenterRight);
            graphics.DrawString(document.IssuedAt.ToString("dd MMM yyyy", CultureInfo.GetCultureInfo("en-ZA")), regular, muted, new XRect(280, 60, 275, 15), XStringFormats.CenterRight);
            graphics.DrawLine(new XPen(XColor.FromArgb(205, 213, 224)), 40, 88, 555, 88); y = 112;
            if (table) Header();
        }
        void Space(double height) { if (y + height > 765) Page(); }
        IEnumerable<string> Wrap(string text, XFont font, double width)
        {
            foreach (var paragraph in text.Replace("\r", "", StringComparison.Ordinal).Split('\n'))
            {
                var line = "";
                foreach (var word in paragraph.Split(' ', StringSplitOptions.RemoveEmptyEntries))
                {
                    var candidate = line.Length == 0 ? word : line + " " + word;
                    if (graphics.MeasureString(candidate, font).Width <= width) { line = candidate; continue; }
                    if (line.Length > 0) yield return line;
                    line = "";
                    foreach (var rune in word.EnumerateRunes())
                    {
                        if (graphics.MeasureString(line + rune, font).Width > width && line.Length > 0) { yield return line; line = ""; }
                        line += rune.ToString();
                    }
                }
                yield return line;
            }
        }
        void Paragraph(string text, bool heading = false)
        {
            var font = heading ? bold : regular;
            foreach (var line in Wrap(text, font, 510)) { Space(16); graphics.DrawString(line, font, heading ? XBrushes.Black : muted, 40, y); y += 15; }
            y += 5;
        }
        Page(); Paragraph(snapshot.Issuer.Name, true); Paragraph(snapshot.Issuer.Address); Paragraph(snapshot.Issuer.Contact);
        if (snapshot.Issuer.VatRegistered) Paragraph("Supplier VAT registration: " + snapshot.Issuer.VatNumber);
        Paragraph("Bill to", true); Paragraph(snapshot.Customer.Name); Paragraph(snapshot.Customer.Address ?? "");
        Paragraph(string.Join(" | ", new[] { snapshot.Customer.Email, snapshot.Customer.Phone }.Where(x => !string.IsNullOrWhiteSpace(x))));
        if (snapshot.Customer.VatNumber != null) Paragraph("Recipient VAT registration: " + snapshot.Customer.VatNumber);
        if (!string.IsNullOrWhiteSpace(snapshot.Reference)) Paragraph("Reference: " + snapshot.Reference);
        if (document.Kind == CommercialDocumentKind.Receipt) Paragraph("Underlying invoice items (receipt amount appears below)", true);
        table = true; Space(60); Header();
        foreach (var line in snapshot.Totals.Lines)
        {
            Space(55);
            var content = Wrap(line.Source.Description, regular, 238).ToArray();
            graphics.DrawString(line.Source.Quantity.ToString("0.####", CultureInfo.InvariantCulture), regular, XBrushes.Black, new XRect(284, y - 10, 35, 14), XStringFormats.TopRight);
            graphics.DrawString(Money(line.Source.UnitPrice), regular, XBrushes.Black, new XRect(325, y - 10, 70, 14), XStringFormats.TopRight);
            graphics.DrawString(Money(line.Tax), regular, XBrushes.Black, new XRect(402, y - 10, 64, 14), XStringFormats.TopRight);
            graphics.DrawString(Money(line.Total), regular, XBrushes.Black, new XRect(473, y - 10, 76, 14), XStringFormats.TopRight);
            foreach (var text in content) { Space(15); graphics.DrawString(text, regular, XBrushes.Black, 46, y); y += 14; }
            var category = line.Source.Category switch { ChargeCategory.Government => "Government charge", ChargeCategory.ServiceFee => "Service fee", _ => "Extra" };
            var treatment = line.Source.TaxTreatment switch { TaxTreatment.Standard => "Standard rated", TaxTreatment.ZeroRated => "Zero rated", TaxTreatment.Exempt => "Exempt", _ => "Outside scope" };
            foreach (var text in Wrap($"{category} | {treatment} ({line.Source.TaxRate:0.##}%)", regular, 238)) { Space(15); graphics.DrawString(text, regular, muted, 46, y); y += 14; }
            y += 9; graphics.DrawLine(new XPen(XColor.FromArgb(230, 234, 239)), 40, y - 5, 555, y - 5);
            y += 12;
        }
        table = false; y += 12; Space(90);
        Paragraph("Net ZAR " + Money(snapshot.Totals.Net)); Paragraph("VAT ZAR " + Money(snapshot.Totals.Tax));
        Paragraph((document.Kind == CommercialDocumentKind.Receipt ? "Receipt amount ZAR " : "Total ZAR ") + Money(document.Amount), true);
        if (document.Kind == CommercialDocumentKind.Invoice)
        { Paragraph("Credits ZAR " + Money(document.Credits)); Paragraph("Paid ZAR " + Money(document.Paid)); Paragraph("Outstanding ZAR " + Money(Math.Max(0, document.Amount - document.Credits - document.Paid)), true); }
        if (snapshot.Issuer.PaymentInstructions.Length > 0) { Paragraph("Payment instructions", true); Paragraph(snapshot.Issuer.PaymentInstructions); }
        foreach (var entry in detail.Entries)
        { Paragraph($"{entry.Kind}: ZAR {Money(entry.Amount)} | {entry.Date:yyyy-MM-dd} | {entry.Method}", true); Paragraph(string.Join(" - ", new[] { entry.Reference, entry.Reason }.Where(x => !string.IsNullOrWhiteSpace(x)))); }
        graphics.Dispose();
        for (var i = 0; i < pdf.PageCount; i++)
        {
            using var footer = XGraphics.FromPdfPage(pdf.Pages[i], XGraphicsPdfPageOptions.Append);
            footer.DrawString($"{document.Number} | Page {i + 1} of {pdf.PageCount}", regular, muted, new XRect(40, 790, 515, 18), XStringFormats.Center);
        }
        using var output = new MemoryStream(); pdf.Save(output, false); return output.ToArray();
    }
}
