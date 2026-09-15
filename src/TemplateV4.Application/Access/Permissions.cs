namespace TemplateV4.Application.Users;

public static partial class Permissions
{
    public const string Roles = "roles.manage";
    public static readonly string[] All = [Read, Manage, Roles, Jobs, Settings, SupportAgent, SupportAdmin, InvoiceIssue, InvoiceSettle, InvoiceCorrect, CmsEdit];
}
