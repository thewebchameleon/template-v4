namespace TemplateV4.Application.ApiKeys;

public interface IApiKeyCollections
{
    Task<bool> Exist(string[] collections, CancellationToken ct);
}
