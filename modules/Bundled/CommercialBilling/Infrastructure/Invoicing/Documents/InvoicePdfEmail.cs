using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using TemplateV4.Application;
using TemplateV4.Application.Invoicing;
using TemplateV4.Infrastructure.Persistence;

namespace TemplateV4.Infrastructure.Invoicing;

public sealed class InvoicePdfIntegrationContracts : IIntegrationContractContributor
{
    public void Register(IntegrationContracts contracts) => contracts.Register<InvoicePdfEmailRequested>("invoicing.pdf-email-requested.v1");
}

public sealed class InvoicePdfEmailConsumer(InvoicingDb db, IEmailAttachmentSender email) : IIntegrationConsumer
{
    public string Contract => "invoicing.pdf-email-requested.v1";

    public async Task Handle(MessageEnvelope message, CancellationToken ct)
    {
        var request = JsonSerializer.Deserialize<InvoicePdfEmailRequested>(message.Payload)!;
        var pdf = await db.Set<InvoicePdfRow>().AsNoTracking().SingleAsync(x => x.Id == request.PdfId, ct);
        var document = await db.Set<CommercialDocumentRow>().AsNoTracking().SingleAsync(x => x.Id == pdf.DocumentId, ct);
        var snapshot = JsonSerializer.Deserialize<CommercialSnapshot>(document.Snapshot, new JsonSerializerOptions(JsonSerializerDefaults.Web))!;
        await email.SendAttachment(snapshot.Customer.Email!, $"Invoice {document.Number}",
            $"Please find invoice {document.Number} attached.", document.Number + ".pdf", pdf.Content, message.Id, ct);
    }
}
