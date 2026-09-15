namespace TemplateV4.Application.Users;

public sealed record TriggerMaintenance(string? IdempotencyKey) : ICommand<Guid>, IAuthorizedRequest, IIdempotentRequest
{ public string Permission => Permissions.Jobs; }
public sealed class TriggerMaintenanceHandler(IEventOutbox outbox, IExecutionContext context) : IHandler<TriggerMaintenance, Guid>
{
    public Task<Result<Guid>> Handle(TriggerMaintenance request, CancellationToken cancellationToken)
    {
        var id = Guid.NewGuid(); outbox.Add(new JobRequested(id, context.Culture));
        return Task.FromResult(Result<Guid>.Success(id));
    }
}
