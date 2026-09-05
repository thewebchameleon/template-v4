using System.Net;
using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;
using MimeKit;
using templatev4.Application;

namespace templatev4.Infrastructure;

public sealed class SmtpEmailSender(IConfiguration config, IHostEnvironment environment, IDataProtectionProvider protection) : IEmailSender
{
    public async Task Send(string recipient, EmailRequest email, Guid messageId, CancellationToken ct)
    {
        var af = email.Culture == "af-ZA";
        var subject = email.Template switch
        {
            EmailTemplate.Verification => af ? "Bevestig jou rekening" : "Verify your account",
            EmailTemplate.PasswordReset => af ? "Stel jou wagwoord" : "Set your password",
            EmailTemplate.SecurityNotification => af ? "Rekeningsekuriteit verander" : "Account security changed",
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
        var url = email.ActionUrl is null ? null : protection.CreateProtector("templatev4.email.action.v1").Unprotect(email.ActionUrl);
        var text = url is null ? customBody ?? subject : $"{customBody ?? subject}: {url}";
        message.Body = new BodyBuilder { TextBody = text, HtmlBody = $"<p>{WebUtility.HtmlEncode(customBody ?? subject)}</p>" + (url is null ? "" : $"<p><a href=\"{WebUtility.HtmlEncode(url)}\">{WebUtility.HtmlEncode(subject)}</a></p>") }.ToMessageBody();
        using var smtp = new SmtpClient(); smtp.Timeout = 30000;
        await smtp.ConnectAsync(config["Email:Host"] ?? "localhost", config.GetValue("Email:Port", 1025), environment.IsDevelopment() || environment.IsEnvironment("Testing") ? SecureSocketOptions.None : SecureSocketOptions.StartTls, ct);
        if (config["Email:Username"] is { Length: > 0 } user) await smtp.AuthenticateAsync(user, config["Email:Password"] ?? throw new InvalidOperationException("Email:Password is required for authenticated SMTP."), ct);
        await smtp.SendAsync(message, ct); await smtp.DisconnectAsync(true, ct);
    }
}
