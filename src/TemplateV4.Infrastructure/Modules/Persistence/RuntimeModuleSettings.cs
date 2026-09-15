namespace TemplateV4.Infrastructure.Persistence;

public sealed class RuntimeModuleSettings
{
    public string Id { get; set; } = "";
    public bool Enabled { get; set; } = true;
    public Guid Version { get; set; }
}
