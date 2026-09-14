namespace TemplateV4.Domain.Invoicing;

public enum CommercialDocumentKind { Quotation, Invoice, Receipt, CreditNote }
public enum ChargeCategory { Government, ServiceFee, Extra }
public enum TaxTreatment { Standard, ZeroRated, Exempt, OutsideScope }
public enum ManualPaymentMethod { Cash, EFT, Card }

public sealed record CommercialLine(string Description, ChargeCategory Category, decimal Quantity,
    decimal UnitPrice, TaxTreatment TaxTreatment, decimal TaxRate);
public sealed record PricedLine(CommercialLine Source, decimal Net, decimal Tax, decimal Total);
public sealed record CommercialTotals(IReadOnlyList<PricedLine> Lines, decimal Net, decimal Tax, decimal Total);

/// <summary>ZAR amounts round per line, to cents, with midpoint values away from zero.</summary>
public static class CommercialRules
{
    public static decimal Round(decimal value) => decimal.Round(value, 2, MidpointRounding.AwayFromZero);

    public static CommercialTotals Price(IReadOnlyList<CommercialLine> lines)
    {
        ArgumentNullException.ThrowIfNull(lines);
        if (lines.Count is < 1 or > 500) throw new ArgumentException("Supply between 1 and 500 lines.", nameof(lines));
        var priced = new List<PricedLine>(lines.Count);
        foreach (var line in lines)
        {
            if (line is null || string.IsNullOrWhiteSpace(line.Description) || line.Description.Length > 1000 ||
                line.Quantity is <= 0 or > 1000000 || line.UnitPrice is < 0 or > 1000000000 ||
                line.TaxRate is < 0 or > 100 || !Enum.IsDefined(line.Category) || !Enum.IsDefined(line.TaxTreatment) ||
                line.TaxTreatment != TaxTreatment.Standard && line.TaxRate != 0 ||
                line.UnitPrice != Round(line.UnitPrice) || decimal.Round(line.Quantity, 4) != line.Quantity)
                throw new ArgumentException("Invalid commercial line.", nameof(lines));
            var net = Round(line.Quantity * line.UnitPrice);
            var tax = Round(net * line.TaxRate / 100m);
            priced.Add(new(line, net, tax, net + tax));
        }
        return new(priced.AsReadOnly(), priced.Sum(x => x.Net), priced.Sum(x => x.Tax), priced.Sum(x => x.Total));
    }

    public static bool ValidAmount(decimal amount) => amount > 0 && amount == Round(amount);

    /// <summary>Allocate amount credits in original line order; the final portion reverses the exact remaining tax.</summary>
    public static CommercialTotals Credit(CommercialTotals original, decimal previouslyCredited, decimal amount)
    {
        if (!CanCredit(original.Total, previouslyCredited, amount)) throw new ArgumentException("Invalid credit amount.", nameof(amount));
        var lines = new List<PricedLine>(); decimal position = 0;
        foreach (var line in original.Lines)
        {
            var before = Math.Clamp(previouslyCredited - position, 0, line.Total);
            var after = Math.Clamp(previouslyCredited + amount - position, 0, line.Total);
            position += line.Total;
            if (after == before) continue;
            decimal Net(decimal gross) => gross == line.Total ? line.Net : Round(gross / (1 + line.Source.TaxRate / 100));
            var net = Net(after) - Net(before); var gross = after - before;
            lines.Add(new(line.Source with { Quantity = line.Source.Quantity * gross / line.Total }, net, gross - net, gross));
        }
        return new(lines.AsReadOnly(), lines.Sum(x => x.Net), lines.Sum(x => x.Tax), amount);
    }
    public static bool CanSettle(decimal total, decimal credits, decimal paid, decimal amount)
        => ValidAmount(amount) && credits >= 0 && paid == 0 && amount == total - credits;
    public static bool CanCredit(decimal total, decimal credits, decimal amount)
        => ValidAmount(amount) && credits >= 0 && credits + amount <= total;
    public static bool CanRefund(decimal total, decimal credits, decimal paid, decimal refunded, decimal amount)
        => ValidAmount(amount) && refunded >= 0 && amount + refunded <= Math.Max(0, paid - (total - credits));
}
