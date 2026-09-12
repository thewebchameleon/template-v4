namespace TemplateV4.Infrastructure.Persistence;

public sealed class PlatformAppearanceSettings
{
    public int Id { get; set; } = 1;
    public string PrimaryColor { get; set; } = "#2563EB";
    public Guid Version { get; set; }
    public string CustomColorsJson { get; set; } = "[]";
    public Guid? SelectedCustomColorId { get; set; }
}
