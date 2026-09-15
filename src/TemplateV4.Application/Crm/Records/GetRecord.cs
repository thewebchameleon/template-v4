namespace TemplateV4.Application.Crm;

public sealed record CrmNote(Guid Id, Guid RecordId, Guid ActorId, string Text, DateTimeOffset At);
public sealed record CrmDetail(CrmRecord Record, CrmNote[] Notes);
