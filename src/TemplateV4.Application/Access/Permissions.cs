namespace TemplateV4.Application.Users;

public static partial class Permissions
{
    public const string Roles = "roles.manage";
    public const string CommercialBillingRead = CommercialBilling.CommercialBillingPermissions.Read;
    public const string CommercialBillingManage = CommercialBilling.CommercialBillingPermissions.Manage;
    public static readonly string[] All = [Read, Manage, Roles, ApiKeysManage, Jobs, Settings, SupportAgent, SupportAdmin, InvoiceIssue, InvoiceSettle, InvoiceCorrect, CmsEdit, .. CmsActions, ContactManage, CrmManage, SharedFilesManage, FileStoragePurge, CommercialBillingRead, CommercialBillingManage];
}
