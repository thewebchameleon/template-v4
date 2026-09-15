
namespace TemplateV4.Application;

public sealed record JobRequested(Guid RequestId, string Culture) : IIntegrationEvent;
