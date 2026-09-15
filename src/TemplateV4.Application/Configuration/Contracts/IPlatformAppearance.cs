namespace TemplateV4.Application.Platform;

public sealed record CustomBrandColor(Guid Id, string Name, string Color);
public sealed record PlatformAppearance(string PrimaryColor, Guid Version, CustomBrandColor[] CustomColors, Guid? SelectedCustomColorId, string LoginBackground = LoginBackgrounds.Default);
public sealed record PublicAppearance(string PrimaryColor, string LoginBackground = LoginBackgrounds.Default);
public static class LoginBackgrounds
{
    public const string Default = "blue-sky";
    public static bool Valid(string value) => LoginBackgroundCatalog.Ids.Contains(value);
}
public interface IPlatformAppearance
{
    Task<PlatformAppearance> Read(CancellationToken ct);
    Task<Result<PlatformAppearance>> Save(SavePlatformAppearance request, CancellationToken ct);
}
