namespace TemplateV4.Application.Support;

public interface ISupportAttachments
{
    Task<Result<Unit>> Attach(AttachTicket command, CancellationToken ct);
    Task<Result<TicketDownload>> Download(Guid id, Guid attachmentId, CancellationToken ct);
}
