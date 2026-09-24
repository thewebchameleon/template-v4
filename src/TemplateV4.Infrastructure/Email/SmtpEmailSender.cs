using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;
using MimeKit;
using TemplateV4.Application;
using TemplateV4.Application.Customers;
using TemplateV4.Application.Platform;

namespace TemplateV4.Infrastructure;

public sealed class SmtpEmailSender(IConfiguration config, IHostEnvironment environment, IDataProtectionProvider protection,
    ICustomers organisations, IPlatformAppearance appearance) : IEmailSender, IEmailAttachmentSender
{
    private readonly IDataProtector _mfaCodeProtector = protection.CreateProtector("TemplateV4.email.mfa-code.v1");

    public async Task Send(string recipient, EmailRequest email, Guid messageId, CancellationToken ct)
    {
        var brand = await organisations.Branding(ct);
        var primaryColor = (await appearance.Read(ct)).PrimaryColor;
        if (email.ProtectedRecipient is not null) recipient = protection.CreateProtector("TemplateV4.email.recipient.v1").Unprotect(email.ProtectedRecipient);
        var url = email.ActionUrl is null ? null : protection.CreateProtector("TemplateV4.email.action.v1").Unprotect(email.ActionUrl);
        var code = email.Template == EmailTemplate.MfaCode && email.ProtectedContent is not null ? _mfaCodeProtector.Unprotect(email.ProtectedContent) : null;
        var publicUrl = config["Web:PublicUrl"]?.TrimEnd('/');
        var rendered = EmailHtmlTemplateRenderer.Render(config, brand, primaryColor, email, publicUrl, url, code);
        var message = new MimeMessage { Subject = $"{brand.Name}: {rendered.Subject}", MessageId = $"{messageId:N}@templatev4" };
        var sender = MailboxAddress.Parse(config["Email:From"] ?? "no-reply@localhost");
        message.From.Add(new MailboxAddress(brand.Name, sender.Address)); message.To.Add(MailboxAddress.Parse(recipient));
        message.Body = new BodyBuilder { TextBody = rendered.Text, HtmlBody = rendered.Html }.ToMessageBody();
        using var smtp = new SmtpClient(); smtp.Timeout = 30000;
        await smtp.ConnectAsync(config["Email:Host"] ?? "localhost", config.GetValue("Email:Port", 1025), environment.IsDevelopment() || environment.IsEnvironment("Testing") ? SecureSocketOptions.None : SecureSocketOptions.StartTls, ct);
        if (config["Email:Username"] is { Length: > 0 } user) await smtp.AuthenticateAsync(user, config["Email:Password"] ?? throw new InvalidOperationException("Email:Password is required for authenticated SMTP."), ct);
        await smtp.SendAsync(message, ct); await smtp.DisconnectAsync(true, ct);
    }

    public async Task SendAttachment(string recipient, string subject, string body, string fileName, byte[] content, Guid messageId, CancellationToken ct)
    {
        var brand = await organisations.Branding(ct);
        var primaryColor = (await appearance.Read(ct)).PrimaryColor;
        var publicUrl = config["Web:PublicUrl"]?.TrimEnd('/');
        var rendered = EmailHtmlTemplateRenderer.RenderAttachment(brand, primaryColor, publicUrl, subject, body);
        var sender = MailboxAddress.Parse(config["Email:From"] ?? "no-reply@localhost");
        var message = new MimeMessage { Subject = $"{brand.Name}: {rendered.Subject}", MessageId = $"{messageId:N}@templatev4" };
        message.From.Add(new MailboxAddress(brand.Name, sender.Address));
        message.To.Add(MailboxAddress.Parse(recipient));
        var builder = new BodyBuilder { TextBody = rendered.Text, HtmlBody = rendered.Html };
        builder.Attachments.Add(fileName, content, ContentType.Parse("application/pdf"));
        message.Body = builder.ToMessageBody();
        using var smtp = new SmtpClient(); smtp.Timeout = 30000;
        await smtp.ConnectAsync(config["Email:Host"] ?? "localhost", config.GetValue("Email:Port", 1025),
            environment.IsDevelopment() || environment.IsEnvironment("Testing") ? SecureSocketOptions.None : SecureSocketOptions.StartTls, ct);
        if (config["Email:Username"] is { Length: > 0 } user)
            await smtp.AuthenticateAsync(user, config["Email:Password"] ?? throw new InvalidOperationException("Email:Password is required for authenticated SMTP."), ct);
        await smtp.SendAsync(message, ct); await smtp.DisconnectAsync(true, ct);
    }
}
