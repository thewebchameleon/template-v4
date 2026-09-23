namespace TemplateV4.Application.Crm;

public sealed record CrmOverview(int OpenDeals, decimal OpenValue, CrmRecord[] Recent);
