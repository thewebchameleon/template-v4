using Microsoft.EntityFrameworkCore;
using TemplateV4.Application.Invoicing;
using TemplateV4.Infrastructure.Persistence;

namespace TemplateV4.Infrastructure.Invoicing;

public sealed class InvoiceAttachmentRow
{
    public Guid RecordId { get; set; }
    public Guid FileId { get; set; }
}

public sealed class InvoiceAttachments(InvoicingDb db) : IInvoiceAttachments
{
    public Task<Guid[]> Files(Guid document, CancellationToken ct) => db.Set<InvoiceAttachmentRow>()
        .Where(x => x.RecordId == document).OrderBy(x => x.FileId).Select(x => x.FileId).ToArrayAsync(ct);

    public async Task Change(Guid document, Guid file, bool attached, CancellationToken ct)
    {
        var row = await db.Set<InvoiceAttachmentRow>().FindAsync([document, file], ct);
        if (attached && row is null) db.Add(new InvoiceAttachmentRow { RecordId = document, FileId = file });
        else if (!attached && row is not null) db.Remove(row);
    }
}
