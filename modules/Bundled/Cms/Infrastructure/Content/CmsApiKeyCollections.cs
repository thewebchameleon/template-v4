using Microsoft.EntityFrameworkCore;
using TemplateV4.Application.ApiKeys;
using TemplateV4.Infrastructure.Persistence;

namespace TemplateV4.Infrastructure.Cms;

public sealed class CmsApiKeyCollections(CmsDb db) : IApiKeyCollections
{
    public async Task<bool> Exist(string[] collections, CancellationToken ct)
        => await db.Set<ContentCollectionRow>().CountAsync(x => collections.Contains(x.Key), ct) == collections.Length;
}
