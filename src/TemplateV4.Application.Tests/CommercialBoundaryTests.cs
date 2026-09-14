using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using TemplateV4.Application.Crm;
using TemplateV4.Application.Customers;
using TemplateV4.Application.Invoicing;
using TemplateV4.Domain.Invoicing;
using TemplateV4.Infrastructure.Customers;
using TemplateV4.Infrastructure.Persistence;
using Xunit;

namespace TemplateV4.Application.Tests;

public sealed partial class SecurityAndMessagingTests
{
    [Fact]
    public async Task Commercial_accepted_obligation_survives_archive_and_disabled_modules_but_not_revoked_membership()
    {
        await using var scope = _services.CreateAsyncScope(); var sp = scope.ServiceProvider; var actor = (await User(sp)).Id;
        var customers = sp.GetRequiredService<ICustomers>(); var organisation = (await customers.Create(actor, new("Retained obligations"), default)).Value!;
        var crm = sp.GetRequiredService<ICrm>(); var customer = (await crm.Save(actor, organisation.Id, new(null, null, Contact("Retained customer")), default)).Value!;
        var invoices = sp.GetRequiredService<IInvoicing>();
        await invoices.Configure(actor, organisation.Id, new(Guid.Empty, "Issuer", "Address", "", "", false, null, "RET"), default);
        var quote = (await invoices.Issue(actor, organisation.Id, new(Guid.NewGuid(), customer.Id, CommercialDocumentKind.Quotation,
            [new("Service", ChargeCategory.ServiceFee, 1, 100, TaxTreatment.OutsideScope, 0)], null, null, null, null), default)).Value!;
        Assert.True((await invoices.Accept(actor, organisation.Id, quote.Id, new(quote.Version, "Accepted"), default)).IsSuccess);
        await crm.Archive(actor, organisation.Id, customer.Id, new(customer.Version, true), default);
        var db = sp.GetRequiredService<FrameworkDb>();
        await db.RuntimeModules.Where(x => x.Id == "crm" || x.Id == "invoicing").ExecuteUpdateAsync(s => s.SetProperty(x => x.Enabled, false));
        var key = Guid.NewGuid(); var issued = await invoices.InvoiceAccepted(actor, organisation.Id, quote.Id, key, default);
        Assert.True(issued.IsSuccess, issued.Error?.Code); Assert.Equal("Retained customer", issued.Value!.Snapshot.Customer.Name);
        Assert.Equal(issued.Value.Id, (await invoices.InvoiceAccepted(actor, organisation.Id, quote.Id, key, default)).Value!.Id);
        Assert.Equal("customers.deletion_obligations", (await customers.Close(actor, organisation.Id, organisation.Version, default)).Error!.Code);
        await db.Set<MembershipRow>().Where(x => x.CustomerId == organisation.Id && x.UserId == actor).ExecuteDeleteAsync();
        Assert.False((await invoices.Read(actor, organisation.Id, issued.Value.Id, default)).IsSuccess);
        Assert.False((await invoices.InvoiceAccepted(actor, organisation.Id, quote.Id, Guid.NewGuid(), default)).IsSuccess);
        Assert.False((await crm.Detail(actor, organisation.Id, customer.Id, default)).IsSuccess);
    }

    [Fact]
    public async Task Commercial_attachment_membership_and_cross_organisation_boundaries_are_enforced()
    {
        await using var scope = _services.CreateAsyncScope(); var sp = scope.ServiceProvider; var actor = (await User(sp)).Id;
        sp.GetRequiredService<IConfiguration>()["Features:my-files:Enabled"] = "true";
        var customers = sp.GetRequiredService<ICustomers>(); var organisation = (await customers.Create(actor, new("Files one"), default)).Value!.Id;
        var other = (await customers.Create(actor, new("Files two"), default)).Value!.Id;
        var crm = sp.GetRequiredService<ICrm>(); var record = (await crm.Save(actor, organisation, new(null, null, Contact("Contact")), default)).Value!;
        var files = sp.GetRequiredService<IOrganisationAttachments>();
        using var content = new MemoryStream("Organisation document"u8.ToArray()); var file = await files.Upload(actor, other, "example.txt", content, default);
        Assert.True(file.IsSuccess, file.Error?.Code);
        var links = sp.GetRequiredService<IRecordAttachments>();
        Assert.False((await links.Change(actor, organisation, AttachmentRecordKind.Crm, record.Id, new(file.Value!.Id, true), default)).IsSuccess);
        using var own = new MemoryStream("Own document"u8.ToArray()); var ownFile = (await files.Upload(actor, organisation, "own.txt", own, default)).Value!;
        Assert.True((await links.Change(actor, organisation, AttachmentRecordKind.Crm, record.Id, new(ownFile.Id, true), default)).IsSuccess);
        Assert.Single((await links.List(actor, organisation, AttachmentRecordKind.Crm, record.Id, default)).Value!);
        var db = sp.GetRequiredService<FrameworkDb>();
        await db.RuntimeModules.Where(x => x.Id == "my-files").ExecuteUpdateAsync(s => s.SetProperty(x => x.Enabled, false));
        Assert.False((await links.List(actor, organisation, AttachmentRecordKind.Crm, record.Id, default)).IsSuccess);
        await db.RuntimeModules.Where(x => x.Id == "my-files").ExecuteUpdateAsync(s => s.SetProperty(x => x.Enabled, true));
        Assert.Single((await links.List(actor, organisation, AttachmentRecordKind.Crm, record.Id, default)).Value!);
    }

    [Fact]
    public async Task Commercial_foundation_migrations_preserve_retained_business_schema_after_removal()
    {
        await using var scope = _services.CreateAsyncScope(); var db = scope.ServiceProvider.GetRequiredService<FrameworkDb>();
        await db.Database.ExecuteSqlRawAsync("CREATE SCHEMA retained_business; CREATE TABLE retained_business.retained_probe (id integer primary key); INSERT INTO retained_business.retained_probe VALUES (42)");
        Assert.DoesNotContain(db.Model.GetEntityTypes(), x => x.GetSchema() == "retained_business");
        // Re-run only foundation migrations with business code absent from its model and catalog.
        await db.Database.MigrateAsync();
        Assert.Equal(42, await db.Database.SqlQueryRaw<int>("SELECT id AS \"Value\" FROM retained_business.retained_probe").SingleAsync());
        Assert.Empty(await db.Database.GetPendingMigrationsAsync());
    }
}