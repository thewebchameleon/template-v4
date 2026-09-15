namespace TemplateV4.Application.Crm;

public sealed record CrmOption(Guid Id, string Label, bool Retired = false);
public sealed record CrmField(Guid Id, string Label, CrmOption[] Options, bool Retired = false);
public sealed record CrmStage(Guid Id, string Label, bool Retired = false);
public sealed record CrmPipeline(Guid Id, string Label, CrmStage[] Stages, bool Retired = false);
public sealed record CrmConfiguration(Guid Version, CrmOption[] LifecycleStatuses, CrmOption[] Tags,
    CrmPipeline[] Pipelines, CrmField[] ContactFields);
