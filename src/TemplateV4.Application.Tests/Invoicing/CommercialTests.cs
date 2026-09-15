using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using TemplateV4.Application.Crm;
using TemplateV4.Application.Customers;
using TemplateV4.Application.Invoicing;
using TemplateV4.Domain.Invoicing;
using TemplateV4.Infrastructure.Invoicing;
using TemplateV4.Infrastructure.Persistence;
using Xunit;

namespace TemplateV4.Application.Tests;

public sealed class CommercialRulesTests
{
    [Fact]
    public void Tax_rounds_each_line_away_from_zero_and_preserves_explicit_tax_treatment()
    {
        var totals = CommercialRules.Price([
            new("Government charge", ChargeCategory.Government, 1, 100m, TaxTreatment.OutsideScope, 0),
            new("Service", ChargeCategory.ServiceFee, 1, 0.10m, TaxTreatment.Standard, 15),
            new("Extra", ChargeCategory.Extra, 1, 0.10m, TaxTreatment.Standard, 15)]);
        Assert.Equal(100.20m, totals.Net); Assert.Equal(0.04m, totals.Tax); Assert.Equal(100.24m, totals.Total);
        Assert.Throws<ArgumentException>(() => CommercialRules.Price([new("Invalid", ChargeCategory.Extra, 1, 1, TaxTreatment.Exempt, 15)]));
        Assert.False(CommercialRules.CanSettle(100, 20, 0, 40));
        Assert.True(CommercialRules.CanSettle(100, 20, 0, 80));
        Assert.False(CommercialRules.CanSettle(100, 0, 100, 100));
        Assert.False(CommercialRules.CanRefund(100, 0, 100, 0, 1));
        Assert.True(CommercialRules.CanRefund(100, 30, 100, 10, 20));
        Assert.False(CommercialRules.CanRefund(100, 30, 100, 10, 20.01m));
    }
}

public sealed partial class SecurityAndMessagingTests
{
    private static CrmRecordInput Contact(string name, CrmRecordKind kind = CrmRecordKind.Contact) => new(kind, name, "customer@example.test", "0123456789", "1 Test Street", null, [], null, [], [], null, null, null, null, null, null, DealOutcome.Open);

    [Fact]
    public async Task Crm_scopes_relationships_archive_restore_and_retired_dropdown_values()
    {
        await using var scope = _services.CreateAsyncScope(); var sp = scope.ServiceProvider;
        var user = await User(sp); var outsider = await User(sp);
        var customers = sp.GetRequiredService<ICustomers>();
        var organisation = (await customers.Create(user.Id, new("CRM organisation"), default)).Value!.Id;
        var other = (await customers.Create(outsider.Id, new("Other organisation"), default)).Value!.Id;
        var crm = sp.GetRequiredService<ICrm>();
        var company1 = (await crm.Save(user.Id, organisation, new(null, null, Contact("Company one", CrmRecordKind.Company)), default)).Value!;
        var company2 = (await crm.Save(user.Id, organisation, new(null, null, Contact("Company two", CrmRecordKind.Company)), default)).Value!;
        var foreign = (await crm.Save(outsider.Id, other, new(null, null, Contact("Foreign", CrmRecordKind.Company)), default)).Value!;
        var settings = (await crm.Configuration(user.Id, organisation, default)).Value!;
        var field = Assert.Single(settings.ContactFields); var value = new CrmFieldValue(field.Id, field.Options[0].Id);
        var data = Contact("Person") with { Companies = [new(company1.Id, "Director"), new(company2.Id, "Contact")], CustomFields = [value] };
        var personResult = await crm.Save(user.Id, organisation, new(null, null, data), default);
        Assert.True(personResult.IsSuccess, personResult.Error?.Code); var person = personResult.Value!;
        Assert.Equal(2, (await crm.Detail(user.Id, organisation, person.Id, default)).Value!.Record.Data.Companies.Length);
        Assert.False((await crm.Detail(outsider.Id, organisation, person.Id, default)).IsSuccess);
        Assert.False((await crm.Save(user.Id, organisation, new(null, null, data with { Companies = [new(foreign.Id, "Foreign")] }), default)).IsSuccess);
        var retired = field with { Options = field.Options.Select(x => x.Id == value.OptionId ? x with { Retired = true } : x).ToArray() };
        Assert.True((await crm.Configure(user.Id, organisation, settings with { ContactFields = [retired] }, default)).IsSuccess);
        Assert.False((await crm.Save(user.Id, organisation, new(null, null, data), default)).IsSuccess);
        var edited = await crm.Save(user.Id, organisation, new(person.Id, person.Version, data with { Name = "Renamed" }), default);
        Assert.True(edited.IsSuccess, edited.Error?.Code);
        Assert.False((await crm.Save(user.Id, organisation, new(person.Id, person.Version, data), default)).IsSuccess);
        var archived = (await crm.Archive(user.Id, organisation, person.Id, new(edited.Value!.Version, true), default)).Value!;
        Assert.False((await crm.Resolve(user.Id, organisation, person.Id, false, default)).IsSuccess);
        Assert.True((await crm.Resolve(user.Id, organisation, person.Id, true, default)).IsSuccess);
        var restored = await crm.Archive(user.Id, organisation, person.Id, new(archived.Version, false), default);
        Assert.True(restored.IsSuccess); Assert.Equal(data.Companies, restored.Value!.Data.Companies);
    }

    [Fact]
    public async Task Commercial_documents_retain_snapshots_reject_duplicate_payments_and_bound_refunds()
    {
        await using var scope = _services.CreateAsyncScope(); var sp = scope.ServiceProvider; var actor = await User(sp);
        var organisation = (await sp.GetRequiredService<ICustomers>().Create(actor.Id, new("Commercial organisation"), default)).Value!.Id;
        var crm = sp.GetRequiredService<ICrm>(); var customer = (await crm.Save(actor.Id, organisation, new(null, null, Contact("Original customer")), default)).Value!;
        var store = sp.GetRequiredService<IInvoicing>();
        Assert.True((await store.Configure(actor.Id, organisation, new(Guid.Empty, "Issuer", "Issuer address", "Contact", "EFT", true, "4123456789", "TEST"), default)).IsSuccess);
        var lines = new CommercialLine[] { new("Service", ChargeCategory.ServiceFee, 1, 100m, TaxTreatment.Standard, 15m) };
        var quote = (await store.Issue(actor.Id, organisation, new(Guid.NewGuid(), customer.Id, CommercialDocumentKind.Quotation, lines, null, null, null, null), default)).Value!;
        var revision = (await store.Issue(actor.Id, organisation, new(Guid.NewGuid(), customer.Id, CommercialDocumentKind.Quotation, lines, null, null, quote.Id, null), default)).Value!;
        Assert.False((await store.Accept(actor.Id, organisation, quote.Id, new(quote.Version, "Superseded"), default)).IsSuccess);
        Assert.True((await store.Accept(actor.Id, organisation, revision.Id, new(revision.Version, "Accepted by phone"), default)).IsSuccess);
        var request = new IssueCommercialDocument(Guid.NewGuid(), customer.Id, CommercialDocumentKind.Invoice, lines, null, revision.Id, null, null);
        var invoice = (await store.Issue(actor.Id, organisation, request, default)).Value!;
        Assert.Equal(invoice.Id, (await store.Issue(actor.Id, organisation, request, default)).Value!.Id);
        Assert.True((await crm.Save(actor.Id, organisation, new(customer.Id, customer.Version, customer.Data with { Name = "Changed customer" }), default)).IsSuccess);
        Assert.Equal("Original customer", (await store.Read(actor.Id, organisation, invoice.Id, default)).Value!.Document.Snapshot.Customer.Name);
        var payment = new CommercialAction(Guid.NewGuid(), invoice.Version, 115m, "", ManualPaymentMethod.EFT, DateOnly.FromDateTime(_clock.GetUtcNow().UtcDateTime), "EFT-1");
        var paid = await store.Settle(actor.Id, organisation, invoice.Id, payment, default); Assert.True(paid.IsSuccess, paid.Error?.Code);
        Assert.Equal(paid.Value!.Id, (await store.Settle(actor.Id, organisation, invoice.Id, payment, default)).Value!.Id);
        invoice = (await store.Read(actor.Id, organisation, invoice.Id, default)).Value!.Document;
        Assert.False((await store.Settle(actor.Id, organisation, invoice.Id, payment with { IdempotencyKey = Guid.NewGuid(), Version = invoice.Version }, default)).IsSuccess);
        var credit = payment with { IdempotencyKey = Guid.NewGuid(), Version = invoice.Version, Amount = 30m, Reason = "Service adjustment" };
        Assert.True((await store.Credit(actor.Id, organisation, invoice.Id, credit, default)).IsSuccess);
        invoice = (await store.Read(actor.Id, organisation, invoice.Id, default)).Value!.Document;
        var refund = credit with { IdempotencyKey = Guid.NewGuid(), Version = invoice.Version, Amount = 20m };
        Assert.True((await store.Refund(actor.Id, organisation, invoice.Id, refund, default)).IsSuccess);
        invoice = (await store.Read(actor.Id, organisation, invoice.Id, default)).Value!.Document;
        Assert.False((await store.Refund(actor.Id, organisation, invoice.Id, refund with { IdempotencyKey = Guid.NewGuid(), Version = invoice.Version, Amount = 10.01m }, default)).IsSuccess);
        Assert.True((await store.Refund(actor.Id, organisation, invoice.Id, refund with { IdempotencyKey = Guid.NewGuid(), Version = invoice.Version, Amount = 10m }, default)).IsSuccess);
    }

    [Fact]
    public async Task Commercial_origins_are_unique_under_concurrent_independent_scopes()
    {
        Guid actor; Guid organisation; Guid customer;
        await using (var scope = _services.CreateAsyncScope())
        {
            var sp = scope.ServiceProvider; actor = (await User(sp)).Id;
            organisation = (await sp.GetRequiredService<ICustomers>().Create(actor, new("Concurrent organisation"), default)).Value!.Id;
            customer = (await sp.GetRequiredService<ICrm>().Save(actor, organisation, new(null, null, Contact("Customer")), default)).Value!.Id;
            Assert.True((await sp.GetRequiredService<IInvoicing>().Configure(actor, organisation, new(Guid.Empty, "Issuer", "Address", "", "", false, null, "TEST"), default)).IsSuccess);
        }
        var origin = new CommercialOrigin("example-business", "request", Guid.NewGuid());
        async Task<CommercialDocument> Issue()
        {
            await using var scope = _services.CreateAsyncScope();
            var result = await scope.ServiceProvider.GetRequiredService<IInvoicing>().Issue(actor, organisation,
                new(Guid.NewGuid(), customer, CommercialDocumentKind.Invoice, [new("Service", ChargeCategory.ServiceFee, 1, 100, TaxTreatment.OutsideScope, 0)], origin, null, null, null), default);
            Assert.True(result.IsSuccess, result.Error?.Code); return result.Value!;
        }
        var results = await Task.WhenAll(Issue(), Issue(), Issue()); Assert.Single(results.DistinctBy(x => x.Id));
        await using var check = _services.CreateAsyncScope();
        Assert.Equal(1, await check.ServiceProvider.GetRequiredService<FrameworkDb>().Set<CommercialDocumentRow>().CountAsync(x => x.OrganisationId == organisation && x.Kind == "Invoice"));
    }
}
