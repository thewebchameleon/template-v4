namespace TemplateV4.Application.Support;

public sealed record SupportCategory(Guid Id, string Name, bool Active, Guid Version);
public sealed record SupportAgent(Guid Id, string Name);
public sealed record SupportOptions(SupportCategory[] Categories, SupportAgent[] Agents, bool Agent, bool Administrator);
