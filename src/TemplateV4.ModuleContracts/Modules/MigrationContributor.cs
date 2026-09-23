namespace TemplateV4.Application.Modules;

/// <summary>Explicitly registered migration participants, run after foundation migrations.</summary>
public interface IMigrationContributor
{
    string ModuleId { get; }
    int Order { get; }
    Task Migrate(CancellationToken cancellationToken);
}
