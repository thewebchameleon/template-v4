using Microsoft.EntityFrameworkCore;
using TemplateV4.Application.Crm;
using TemplateV4.Application.Dashboards;
using TemplateV4.Application.Modules;
using TemplateV4.Infrastructure.Persistence;

namespace TemplateV4.Infrastructure.Invoicing;

public sealed class InvoicingDashboardCards(FrameworkDb db, IOrganisationOperations access, ICapabilities capabilities) : IDashboardCardProvider
{
    public IReadOnlyList<DashboardCardDefinition> Definitions { get; } = [
        new("invoicing.invoices", "dashInvoices", "invoicing", ["compact", "small", "large"], ["metric", "chart", "list"], ["count", "value"], ["all", "outstanding", "paid"], true),
        new("invoicing.outstanding", "dashOutstanding", "invoicing", ["compact", "small", "large"], ["metric", "chart", "list"], ["count", "value"], ["all"], true),
        new("invoicing.quotations", "dashQuotations", "invoicing", ["compact", "small", "large"], ["metric", "list"], ["count", "value"], ["all"], true)];
    public async Task<bool> Available(Guid actor, string id, CancellationToken ct) => await capabilities.Enabled(CapabilityIds.Invoicing, ct) && await access.Allowed(actor, OrganisationOperation.Read, ct);
    public async Task<DashboardCardData> Read(Guid actor, DashboardCardQuery q, DateTimeOffset? since, CancellationToken ct)
    {
        var quotes = q.DefinitionId == "invoicing.quotations";
        var source = db.Set<CommercialDocumentRow>().AsNoTracking().Where(x => x.Kind == (quotes ? "Quotation" : "Invoice"));
        if (quotes) source = source.Where(x => !x.Accepted && !db.Set<CommercialDocumentRow>().Any(next => next.PreviousRevisionId == x.Id));
        if (q.DefinitionId == "invoicing.outstanding" || q.Filter == "outstanding") source = source.Where(x => x.Total - x.Credits - x.Paid > 0);
        if (q.Filter == "paid") source = source.Where(x => x.Total - x.Credits - x.Paid <= 0);
        if (since != null) source = source.Where(x => x.IssuedAt >= since);
        var balances = q.DefinitionId == "invoicing.outstanding";
        var value = q.Metric == "value" ? await source.SumAsync(x => balances ? x.Total - x.Credits - x.Paid : x.Total, ct) : await source.CountAsync(ct);
        return new(value, q.Metric == "value" ? "ZAR" : "count",
            await source.GroupBy(x => quotes ? "dashAwaitingAcceptance" : x.Total - x.Credits - x.Paid > 0 ? "dashOutstanding" : "dashPaid")
                .Select(g => new DashboardPoint(g.Key, q.Metric == "value" ? g.Sum(x => balances ? x.Total - x.Credits - x.Paid : x.Total) : g.Count())).ToArrayAsync(ct),
            await source.OrderByDescending(x => x.IssuedAt).ThenBy(x => x.Id).Take(q.Limit).Select(x => new DashboardItem(x.Number, x.CustomerName, "/organisation/invoicing/" + x.Id)).ToArrayAsync(ct));
    }
}
