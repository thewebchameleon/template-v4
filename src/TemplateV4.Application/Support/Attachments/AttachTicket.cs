namespace TemplateV4.Application.Support;

public sealed record TicketDownload(string Name, byte[] Content);
public sealed record AttachTicket(Guid Id, string Name, byte[] Content, Guid Version) : ICommand<Unit>;
public sealed class AttachTicketValidator : IValidator<AttachTicket>
{
    public Dictionary<string, string[]> Validate(AttachTicket q) => string.IsNullOrWhiteSpace(q.Name) || q.Name.Length > 180 || q.Name.Any(c => char.IsControl(c) || c is '/' or '\\') ||
        q.Content is null or { Length: 0 } or { Length: > 5242880 } || q.Version == Guid.Empty
        ? new() { ["attachment"] = ["validation.failed"] } : [];
}
public sealed class AttachTicketHandler(ISupportAttachments store) : IHandler<AttachTicket, Unit>
{ public Task<Result<Unit>> Handle(AttachTicket q, CancellationToken ct) => store.Attach(q, ct); }
