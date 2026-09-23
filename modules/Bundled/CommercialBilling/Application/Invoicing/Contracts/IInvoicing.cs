using TemplateV4.Application.Users;
using TemplateV4.Domain.Invoicing;

namespace TemplateV4.Application.Invoicing;

public interface ICommercialDocuments
{
    Task<Result<CommercialDocument[]>> ForOrigin(Guid actor, CommercialOrigin origin, CancellationToken ct);
    Task<Result<CommercialDocument>> Issue(Guid actor, IssueCommercialDocument request, CancellationToken ct);
    Task<Result<CommercialDetail>> Read(Guid actor, Guid id, CancellationToken ct);
    Task<Result<CommercialDocument>> ByOrigin(Guid actor, CommercialOrigin origin, CancellationToken ct);
}
public interface IInvoicing : ICommercialDocuments
{
    Task<Result<CommercialDocument>> InvoiceAccepted(Guid actor, Guid quotation, Guid idempotencyKey, CancellationToken ct);
    Task<Result<CommercialTotals>> Preview(Guid actor, PreviewCommercialDocument request, CancellationToken ct);
    Task<Result<Page<CommercialDocument>>> List(Guid actor, int page, int size, string search, string sort, string direction, string group, CancellationToken ct);
    Task<Result<IssuerSettings>> Settings(Guid actor, CancellationToken ct);
    Task<Result<IssuerSettings>> Configure(Guid actor, IssuerSettings request, CancellationToken ct);
    Task<Result<CommercialDocument>> Accept(Guid actor, Guid id, AcceptQuotation request, CancellationToken ct);
    Task<Result<FinancialEntry>> Settle(Guid actor, Guid id, CommercialAction request, CancellationToken ct);
    Task<Result<FinancialEntry>> Credit(Guid actor, Guid id, CommercialAction request, CancellationToken ct);
    Task<Result<FinancialEntry>> Refund(Guid actor, Guid id, CommercialAction request, CancellationToken ct);
}
