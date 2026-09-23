namespace TemplateV4.Application.Cms;

public sealed record CmsArticleSummary(Guid Id, string Title, bool Published, bool PendingChanges, DateTimeOffset UpdatedAt);
public sealed record CmsList(string Search = "", string Status = "all", int PageNumber = 1, int PageSize = 10, string Sort = "updatedAt", string Direction = "desc");
