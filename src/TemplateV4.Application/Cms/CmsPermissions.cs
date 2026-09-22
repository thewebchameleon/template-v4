namespace TemplateV4.Application.Users;

public static partial class Permissions
{
    public const string CmsEdit = "cms.edit";
    public const string CmsSchema = "cms.schema.manage";
    public const string CmsRead = "cms.content.read";
    public const string CmsWrite = "cms.content.edit";
    public const string CmsReview = "cms.content.review";
    public const string CmsPublish = "cms.content.publish";
    public static string[] CmsActions => [CmsSchema, CmsRead, CmsWrite, CmsReview, CmsPublish];
}
