using System.Net;
using System.Text.RegularExpressions;
using Microsoft.Extensions.Configuration;
using TemplateV4.Application;
using TemplateV4.Application.Customers;

namespace TemplateV4.Infrastructure;

internal sealed record HtmlEmail(string Subject, string Text, string Html);

internal static class EmailHtmlTemplateRenderer
{
    private const string ResourcePrefix = "TemplateV4.Infrastructure.EmailTemplates.";

    public static HtmlEmail Render(IConfiguration config, OrganisationBrand brand, string primaryColor,
        EmailRequest email, string? publicUrl, string? url, string? code)
    {
        var culture = email.Culture == "af-ZA" ? "af-ZA" : "en-ZA";
        var file = email.TemplateName is null ? email.Template.ToString() : "Generic";
        var template = Load($"{file}.{culture}.html");
        string? subject = null;
        string? body = null;
        if (email.TemplateName is not null)
        {
            var section = config.GetSection($"Email:Templates:{email.TemplateName}:{email.Culture}");
            subject = section["subject"] ?? throw new InvalidOperationException("Email template or culture missing.");
            body = section["body"] ?? throw new InvalidOperationException("Email template body missing.");
        }

        if (email.Template == EmailTemplate.RegistrationApproved) url = $"{publicUrl}/login";
        return Compose(brand, primaryColor, publicUrl, culture, template, subject, body, url, code);
    }

    public static HtmlEmail RenderAttachment(OrganisationBrand brand, string primaryColor, string? publicUrl,
        string subject, string body) => Compose(brand, primaryColor, publicUrl, "en-ZA",
        Load("Generic.en-ZA.html"), subject, body, null, null);

    private static HtmlEmail Compose(OrganisationBrand brand, string primaryColor, string? publicUrl, string culture,
        string template, string? subject, string? body, string? url, string? code)
    {
        var action = Regex.Match(template, @"\{\{ACTION:([^}]+)\}\}");
        if (action.Success)
        {
            var actionHtml = url is null ? "" : Load($"Action.{culture}.html")
                .Replace("{{ACTION_LABEL}}", WebUtility.HtmlEncode(action.Groups[1].Value))
                .Replace("{{ACTION_URL}}", WebUtility.HtmlEncode(url))
                .Replace("{{PRIMARY_COLOR}}", primaryColor)
                .Replace("{{BUTTON_TEXT_COLOR}}", ButtonText(primaryColor));
            template = template.Replace(action.Value, actionHtml);
        }
        var codeHtml = code is null ? "" : Load("Code.html").Replace("{{CODE}}", WebUtility.HtmlEncode(code));
        template = template.Replace("{{CODE}}", codeHtml)
            .Replace("{{SUBJECT}}", WebUtility.HtmlEncode(subject ?? ""))
            .Replace("{{BODY}}", WebUtility.HtmlEncode(body ?? "").Replace("\r\n", "\n").Replace('\r', '\n').Replace("\n", "<br>"));

        var heading = Regex.Match(template, @"<h1[^>]*>(.*?)</h1>", RegexOptions.IgnoreCase | RegexOptions.Singleline);
        if (!heading.Success) throw new InvalidOperationException("Email HTML template requires an h1 heading.");
        var title = WebUtility.HtmlDecode(heading.Groups[1].Value);
        var logo = brand.LogoUrl is null || string.IsNullOrEmpty(publicUrl) ? "" :
            Load("Logo.html").Replace("{{LOGO_URL}}", WebUtility.HtmlEncode(publicUrl + brand.LogoUrl));
        var html = Load($"Layout.{culture}.html")
            .Replace("{{LANG}}", culture == "af-ZA" ? "af" : "en")
            .Replace("{{PRIMARY_COLOR}}", primaryColor)
            .Replace("{{BRAND_NAME}}", WebUtility.HtmlEncode(brand.Name))
            .Replace("{{PREHEADER}}", WebUtility.HtmlEncode(title))
            .Replace("{{LOGO}}", logo)
            .Replace("{{EMAIL_CONTENT}}", template);
        return new(title, TextBody(brand.Name, template), html);
    }

    private static string TextBody(string brandName, string html)
    {
        var text = Regex.Replace(html, @"\s+", " ");
        text = Regex.Replace(text, @"<br\s*/?>", "\n", RegexOptions.IgnoreCase);
        text = Regex.Replace(text, @"</(?:h1|p|table|tr)>", "\n\n", RegexOptions.IgnoreCase);
        text = Regex.Replace(text, @"<[^>]+>", "");
        text = WebUtility.HtmlDecode(text);
        text = Regex.Replace(text, @"[ \t]*\n[ \t]*", "\n");
        text = Regex.Replace(text, @"\n{3,}", "\n\n");
        return $"{brandName}\n\n{text.Trim()}";
    }

    private static string Load(string file)
    {
        using var stream = typeof(EmailHtmlTemplateRenderer).Assembly.GetManifestResourceStream(ResourcePrefix + file)
            ?? throw new InvalidOperationException($"Email HTML template {file} is missing.");
        using var reader = new StreamReader(stream);
        return reader.ReadToEnd();
    }

    private static string ButtonText(string color)
    {
        static double Channel(int value)
        {
            var linear = value / 255.0;
            return linear <= 0.04045 ? linear / 12.92 : Math.Pow((linear + 0.055) / 1.055, 2.4);
        }

        var luminance = 0.2126 * Channel(Convert.ToInt32(color.Substring(1, 2), 16)) +
            0.7152 * Channel(Convert.ToInt32(color.Substring(3, 2), 16)) +
            0.0722 * Channel(Convert.ToInt32(color.Substring(5, 2), 16));
        return luminance >= 0.179 ? "#000000" : "#ffffff";
    }
}
