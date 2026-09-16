
namespace TemplateV4.Application;

public enum EmailTemplate { Verification, PasswordReset, SecurityNotification, Notification, MfaCode, SupportTicket, RegistrationApproved = 7, RegistrationRejected = 8, ContactEnquiry = 9 }
public sealed record EmailRequest(Guid UserId, EmailTemplate Template, string Culture, string? ActionUrl = null, string? TemplateName = null, string? ProtectedContent = null, string? ProtectedRecipient = null) : IIntegrationEvent;
public interface IEmailSender { Task Send(string recipient, EmailRequest email, Guid messageId, CancellationToken cancellationToken); }
