using TemplateV4.Application.Users;
using TemplateV4.Domain.Invoicing;

namespace TemplateV4.Application.Invoicing;

public interface ICommercialDocuments
{
    Task<Result<CommercialDocument[]>> ForOrigin(Guid actor, Guid organisation, CommercialOrigin origin, CancellationToken ct);
    Task<Result<CommercialDocument>> Issue(Guid actor, Guid organisation, IssueCommercialDocument request, CancellationToken ct);
    Task<Result<CommercialDetail>> Read(Guid actor, Guid organisation, Guid id, CancellationToken ct);
    Task<Result<CommercialDocument>> ByOrigin(Guid actor, Guid organisation, CommercialOrigin origin, CancellationToken ct);
}
public interface IInvoicing : ICommercialDocuments
{
    Task<Result<CommercialDocument>> InvoiceAccepted(Guid actor, Guid organisation, Guid quotation, Guid idempotencyKey, CancellationToken ct);
    Task<Result<CommercialTotals>> Preview(Guid actor, Guid organisation, PreviewCommercialDocument request, CancellationToken ct);
    Task<Result<Page<CommercialDocument>>> List(Guid actor, Guid organisation, int page, int size, string search, string sort, string direction, CancellationToken ct);
    Task<Result<IssuerSettings>> Settings(Guid actor, Guid organisation, CancellationToken ct);
    Task<Result<IssuerSettings>> Configure(Guid actor, Guid organisation, IssuerSettings request, CancellationToken ct);
    Task<Result<CommercialDocument>> Accept(Guid actor, Guid organisation, Guid id, AcceptQuotation request, CancellationToken ct);
    Task<Result<FinancialEntry>> Settle(Guid actor, Guid organisation, Guid id, CommercialAction request, CancellationToken ct);
    Task<Result<FinancialEntry>> Credit(Guid actor, Guid organisation, Guid id, CommercialAction request, CancellationToken ct);
    Task<Result<FinancialEntry>> Refund(Guid actor, Guid organisation, Guid id, CommercialAction request, CancellationToken ct);
}
