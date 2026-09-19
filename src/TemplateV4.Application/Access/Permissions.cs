namespace TemplateV4.Application.Users;

public static partial class Permissions
{
    public const string Roles = "roles.manage";
    public static readonly string[] All = [Read, Manage, Roles, ApiKeysManage, Jobs, Settings, SupportAgent, SupportAdmin, InvoiceIssue, InvoiceSettle, InvoiceCorrect, CmsEdit, ContactManage, CrmManage, SharedFilesManage, FileStoragePurge, TemplateV4.Application.CommercialBilling.CommercialBillingPermissions.Read, TemplateV4.Application.CommercialBilling.CommercialBillingPermissions.Manage];
}
