using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using TemplateV4.Application.Crm;
using TemplateV4.Application.Customers;
using TemplateV4.Application.Invoicing;
using TemplateV4.Application.Modules;
using TemplateV4.Domain.Invoicing;
using TemplateV4.Infrastructure.Invoicing;

namespace TemplateV4.Infrastructure.Persistence;

public sealed class CommercialBillingDemoData(CommercialBillingDb billing, InvoicingDb invoicing) : IDemoDataContributor
{
    public string ModuleId => "commercial-billing";
    public int Order => 103;

    public async Task Seed(CancellationToken ct)
    {
        var now = DateTimeOffset.UtcNow;
        var orderId = new Guid("8ad94c4a-58c0-4a86-852f-499bf6329e0a");
        if (!await billing.Set<PaymentOrderRow>().AnyAsync(x => x.Id == orderId, ct) &&
            !await billing.Set<CommercialBillingInvoiceRow>().AnyAsync(x => x.Number == "DEMO-BILL-0001", ct) &&
            !await billing.Set<PaymentReceiptRow>().AnyAsync(x => x.Provider == "demo" && x.Id == "demo-standard-payment", ct) &&
            await billing.Set<CommercialPlanPriceRow>().AnyAsync(x => x.Id == new Guid("22222222-2222-4222-8222-222222222222"), ct))
        {
            billing.Set<PaymentOrderRow>().Add(new()
            {
                Id = orderId, CustomerId = Organisation.Id, PlanId = "standard",
                PlanPriceId = new Guid("22222222-2222-4222-8222-222222222222"),
                Purpose = "commercial-subscription", Description = "Demo Standard plan payment",
                Provider = "demo", Interval = "month", Currency = "ZAR",
                UnitMinor = 9900, Quantity = 1, CreatedAt = now.AddDays(-7)
            });
            billing.Set<PaymentReceiptRow>().Add(new()
            {
                Provider = "demo", Id = "demo-standard-payment", PaymentOrderId = orderId,
                AmountMinor = 9900, Currency = "ZAR", SettledAt = now.AddDays(-7)
            });
            billing.Set<CommercialBillingInvoiceRow>().Add(new()
            {
                Id = new Guid("8ad94c4a-58c0-4a86-852f-499bf6329e0b"),
                CustomerId = Organisation.Id, PaymentOrderId = orderId,
                Number = "DEMO-BILL-0001", State = "Paid", Currency = "ZAR",
                TotalMinor = 9900, IssuedAt = now.AddDays(-7), PaidAt = now.AddDays(-7)
            });
            await billing.SaveChangesAsync(ct);
        }
        var invoiceExists = await invoicing.Set<CommercialDocumentRow>()
            .AnyAsync(x => x.Id == DemoDataIds.Invoice || x.Number == "DEMO-I-0001", ct);
        var quotationExists = await invoicing.Set<CommercialDocumentRow>()
            .AnyAsync(x => x.Id == DemoDataIds.Quotation || x.Number == "DEMO-Q-0001", ct);
        if (invoiceExists && quotationExists) return;
        var customer = new CrmRecordInput(CrmRecordKind.Company, "Harbour & Pine Studio",
            "hello@harbour-pine.example.invalid", "+27 21 555 0101", "Cape Town, South Africa",
            null, [], null, [], [], null, null, null, null, null, null, DealOutcome.Open);
        var issuer = new IssuerSettings(Guid.Empty, "Demo Organisation", "Cape Town, South Africa",
            "accounts@example.invalid", "Demo document — no payment required", false, null, "DEMO");
        var json = new JsonSerializerOptions(JsonSerializerDefaults.Web);
        if (!quotationExists)
        {
            var totals = CommercialRules.Price([new CommercialLine("Workspace rollout", ChargeCategory.ServiceFee,
                1, 18500m, TaxTreatment.OutsideScope, 0)]);
            invoicing.Set<CommercialDocumentRow>().Add(new()
            {
                Id = DemoDataIds.Quotation, Number = "DEMO-Q-0001", Kind = "Quotation",
                CustomerId = DemoDataIds.Customer, CustomerName = customer.Name,
                Snapshot = JsonSerializer.Serialize(new CommercialSnapshot(issuer, customer, totals,
                    "Illustrative quotation for the CRM opportunity", null, "Demo Organisation"), json),
                Total = totals.Total, IssuedAt = now.AddDays(-2), ActorId = DemoDataIds.Participant
            });
        }
        if (!invoiceExists)
        {
            var totals = CommercialRules.Price([new CommercialLine("Workspace setup consultation", ChargeCategory.ServiceFee,
                1, 1250m, TaxTreatment.OutsideScope, 0)]);
            invoicing.Set<CommercialDocumentRow>().Add(new()
            {
                Id = DemoDataIds.Invoice, Number = "DEMO-I-0001", Kind = "Invoice",
                CustomerId = DemoDataIds.Customer, CustomerName = customer.Name,
                Snapshot = JsonSerializer.Serialize(new CommercialSnapshot(issuer, customer, totals,
                    "Illustrative invoice — no payment required", null, "Demo Organisation"), json),
                Total = totals.Total, IssuedAt = now.AddDays(-4), ActorId = DemoDataIds.Participant
            });
        }
        await invoicing.SaveChangesAsync(ct);
    }
}
