namespace TemplateV4.Application.Support;

public interface ISupportCategories
{
    Task<Result<SupportOptions>> Options(string search, CancellationToken ct);
    Task<Result<Unit>> Category(SaveSupportCategory command, CancellationToken ct);
}
