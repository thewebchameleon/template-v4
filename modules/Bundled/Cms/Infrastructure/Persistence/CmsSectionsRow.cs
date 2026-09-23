namespace TemplateV4.Infrastructure.Cms;

public sealed class CmsSectionsRow
{
    public int Id { get; set; } = 1;
    public Guid Version { get; set; }
    public string Draft { get; set; } = "[]";
    public string Published { get; set; } = "[]";
}
