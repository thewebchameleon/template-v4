using Microsoft.EntityFrameworkCore;
using System.Net.Mail;
using TemplateV4.Application.Crm;
using TemplateV4.Application.Invoicing;
using TemplateV4.Domain.Invoicing;

namespace TemplateV4.Infrastructure.Invoicing;

public sealed partial class InvoicingStore
{
    private async Task<InvoicePdfRow> RetainPdf(CommercialDocumentRow row, string reason, CancellationToken ct)
    {
        var document = Read(row);
        var logo = document.Snapshot.LogoPng;
        if (logo is null && document.Snapshot.OrganisationLogoId is { } logoId)
            logo = (await organisations.Logo(logoId, ct))?.Png;
        var content = await pdfRenderer.Render(document, logo, ct);
        var last = await db.Set<InvoicePdfRow>().Where(x => x.DocumentId == row.Id)
            .MaxAsync(x => (int?)x.Version, ct) ?? 0;
        var pdf = new InvoicePdfRow
        {
            DocumentId = row.Id,
            Version = last + 1,
            CreatedAt = time.GetUtcNow(),
            Reason = reason,
            Content = content
        };
        db.Set<InvoicePdfRow>().Add(pdf);
        return pdf;
    }

    public async Task<Result<InvoicePdfFile>> Pdf(Guid actor, Guid id, int? version, CancellationToken ct)
    {
        if (!await access.Allowed(actor, OrganisationOperation.Read, ct)) return Result<InvoicePdfFile>.Fail("customers.not_found", ErrorKind.NotFound);
        if (!await Documents().AnyAsync(x => x.Id == id && x.Kind == "Invoice", ct)) return Result<InvoicePdfFile>.Fail("resource.not_found", ErrorKind.NotFound);
        var query = db.Set<InvoicePdfRow>().AsNoTracking().Where(x => x.DocumentId == id);
        var pdf = version is { } number ? await query.SingleOrDefaultAsync(x => x.Version == number, ct)
            : await query.OrderByDescending(x => x.Version).FirstOrDefaultAsync(ct);
        return pdf is null ? Result<InvoicePdfFile>.Fail("resource.not_found", ErrorKind.NotFound)
            : Result<InvoicePdfFile>.Success(new(pdf.Version, pdf.Content));
    }

    public async Task<Result<InvoicePdfVersion[]>> PdfVersions(Guid actor, Guid id, CancellationToken ct)
    {
        if (!await access.Allowed(actor, OrganisationOperation.Read, ct)) return Result<InvoicePdfVersion[]>.Fail("customers.not_found", ErrorKind.NotFound);
        if (!await Documents().AnyAsync(x => x.Id == id && x.Kind == "Invoice", ct)) return Result<InvoicePdfVersion[]>.Fail("resource.not_found", ErrorKind.NotFound);
        var versions = await db.Set<InvoicePdfRow>().AsNoTracking().Where(x => x.DocumentId == id)
            .OrderByDescending(x => x.Version).Select(x => new InvoicePdfVersion(x.Version, x.CreatedAt, x.Reason)).ToArrayAsync(ct);
        return Result<InvoicePdfVersion[]>.Success(versions);
    }

    public async Task<Result<Unit>> EmailPdf(Guid actor, Guid id, EmailInvoicePdf request, CancellationToken ct)
    {
        if (request.IdempotencyKey == Guid.Empty || request.Version < 0) return Result.Fail("validation.failed", ErrorKind.Validation);
        await using var tx = await db.Session.BeginTransactionAsync(ct); await Lock(ct);
        if (!await access.Allowed(actor, OrganisationOperation.Issue, ct)) return Result.Fail("customers.not_found", ErrorKind.NotFound);
        var hash = Fingerprint(new { Operation = "email-pdf", Document = id, Request = request });
        var retry = await db.Set<CommercialOperationRow>().SingleOrDefaultAsync(x => x.Key == request.IdempotencyKey, ct);
        if (retry is not null) return retry.Fingerprint == hash ? Result.Success() : Result.Fail("idempotency.conflict", ErrorKind.Conflict);
        var row = await Documents().SingleOrDefaultAsync(x => x.Id == id && x.Kind == "Invoice", ct);
        if (row is null) return Result.Fail("resource.not_found", ErrorKind.NotFound);
        var recipient = Read(row).Snapshot.Customer.Email;
        if (!MailAddress.TryCreate(recipient, out _)) return Result.Fail("invoicing.customer_email_required", ErrorKind.Validation);
        var pdf = await db.Set<InvoicePdfRow>().Where(x => x.DocumentId == id)
            .OrderByDescending(x => x.Version).FirstOrDefaultAsync(ct);
        if (pdf is null && request.Version == 0) pdf = await RetainPdf(row, "legacy", ct);
        if (pdf is null || request.Version > 0 && pdf.Version != request.Version)
            return Result.Fail("concurrency.conflict", ErrorKind.Conflict);
        Remember(request.IdempotencyKey, hash, pdf.Id);
        outbox.Add(new InvoicePdfEmailRequested(pdf.Id));
        Audit(actor, id, "invoicing.email_queued");
        await db.SaveChangesAsync(ct); await tx.CommitAsync(ct);
        return Result.Success();
    }
}
