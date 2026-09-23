namespace TemplateV4.Application.Privacy;

// Registered even while a module is disabled: retained personal data still belongs to its owner.
public interface IPrivacyContributor
{
    Task<IReadOnlyDictionary<string, object?>> Export(Guid actor, CancellationToken ct);
    Task Erase(Guid actor, CancellationToken ct);
}
