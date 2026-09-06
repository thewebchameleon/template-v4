using System.Net;
using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;
using MimeKit;
using TemplateV4.Application;

namespace TemplateV4.Infrastructure;

public sealed class SmtpEmailSender(IConfiguration config, IHostEnvironment environment, IDataProtectionProvider protection) : IEmailSender
{
    private readonly IDataProtector _mfaCodeProtector = protection.CreateProtector("TemplateV4.email.mfa-code.v1");

    public async Task Send(string recipient, EmailRequest email, Guid messageId, CancellationToken ct)
    {
        if (email.ProtectedRecipient is not null) recipient = protection.CreateProtector("TemplateV4.email.recipient.v1").Unprotect(email.ProtectedRecipient);
        var af = email.Culture == "af-ZA";
        var subject = email.Template switch
        {
            EmailTemplate.Verification => af ? "Bevestig jou rekening" : "Verify your account",
            EmailTemplate.PasswordReset => af ? "Stel jou wagwoord" : "Set your password",
            EmailTemplate.SecurityNotification => af ? "Rekeningsekuriteit verander" : "Account security changed",
            EmailTemplate.MfaCode => af ? "Jou aanmeldkode" : "Your sign-in code",
            _ => af ? "Kennisgewing" : "Notification"
        };
        string? customBody = null;
        if (email.TemplateName is not null)
        {
            var section = config.GetSection($"Email:Templates:{email.TemplateName}:{email.Culture}");
            subject = section["subject"] ?? throw new InvalidOperationException("Email template or culture missing.");
            customBody = section["body"] ?? throw new InvalidOperationException("Email template body missing.");
        }
        var message = new MimeMessage { Subject = subject, MessageId = $"{messageId:N}@templatev4" };
        message.From.Add(MailboxAddress.Parse(config["Email:From"] ?? "no-reply@localhost")); message.To.Add(MailboxAddress.Parse(recipient));
        var url = email.ActionUrl is null ? null : protection.CreateProtector("TemplateV4.email.action.v1").Unprotect(email.ActionUrl);
        var code = email.Template == EmailTemplate.MfaCode && email.ProtectedContent is not null ? _mfaCodeProtector.Unprotect(email.ProtectedContent) : null;
        var introduction = customBody ?? (code is null ? subject : af ? "Gebruik hierdie kode om aan te meld. Dit verval oor 10 minute." : "Use this code to sign in. It expires in 10 minutes.");
        var text = url is not null ? $"{introduction}: {url}" : code is not null ? $"{introduction}\n\n{code}" : introduction;
        var html = $"<p>{WebUtility.HtmlEncode(introduction)}</p>" +
                   (url is not null ? $"<p><a href=\"{WebUtility.HtmlEncode(url)}\">{WebUtility.HtmlEncode(subject)}</a></p>" : "") +
                   (code is not null ? $"<p><strong>{WebUtility.HtmlEncode(code)}</strong></p>" : "");
        message.Body = new BodyBuilder { TextBody = text, HtmlBody = html }.ToMessageBody();
        using var smtp = new SmtpClient(); smtp.Timeout = 30000;
        await smtp.ConnectAsync(config["Email:Host"] ?? "localhost", config.GetValue("Email:Port", 1025), environment.IsDevelopment() || environment.IsEnvironment("Testing") ? SecureSocketOptions.None : SecureSocketOptions.StartTls, ct);
        if (config["Email:Username"] is { Length: > 0 } user) await smtp.AuthenticateAsync(user, config["Email:Password"] ?? throw new InvalidOperationException("Email:Password is required for authenticated SMTP."), ct);
        await smtp.SendAsync(message, ct); await smtp.DisconnectAsync(true, ct);
    }
}
