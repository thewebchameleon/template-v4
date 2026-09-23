using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using TemplateV4.Application.Crm;
using TemplateV4.Application.Customers;
using TemplateV4.Application.Invoicing;
using TemplateV4.Application.Modules;
using TemplateV4.Infrastructure.Persistence;

namespace TemplateV4.Infrastructure.Crm;

public sealed class CrmAttachmentRow
{
    public Guid RecordId { get; set; }
    public Guid FileId { get; set; }
}

public static class RecordAttachmentMappings
{
    public static void Configure(ModelBuilder model)
    {
        var crm = model.Entity<CrmAttachmentRow>(); crm.ToTable("attachments", "crm"); crm.HasKey(x => new { x.RecordId, x.FileId });
    }
}
