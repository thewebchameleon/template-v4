using TemplateV4.Application.Users;

namespace TemplateV4.Application.Platform;

public sealed record SavePlatformAppearance(string PrimaryColor, Guid Version, CustomBrandColor[]? CustomColors = null, Guid? SelectedCustomColorId = null, string? LoginBackground = null) : ICommand<PlatformAppearance>, IAuthorizedRequest
{ public string Permission => Permissions.Settings; }
public sealed class SavePlatformAppearanceValidator : IValidator<SavePlatformAppearance>
{
    private static bool ValidColor(string? value) => value is { Length: 7 } && value[0] == '#' && value.Skip(1).All(char.IsAsciiHexDigit);
    public Dictionary<string, string[]> Validate(SavePlatformAppearance request)
    {
        Dictionary<string, string[]> errors = [];
        if (!ValidColor(request.PrimaryColor) || request.Version == Guid.Empty) errors["primaryColor"] = ["appearance.invalid"];
        if (request.LoginBackground is { } background && !LoginBackgrounds.Valid(background))
            errors["loginBackground"] = ["appearance.background_invalid"];
        if (request.CustomColors is { } colors &&
            (colors.Length > 24 || colors.Any(x => x is null || x.Id == Guid.Empty || !ValidColor(x.Color) ||
                string.IsNullOrWhiteSpace(x.Name) || x.Name.Trim().Length > 40 || x.Name.Any(char.IsControl)) ||
             colors.Select(x => x.Id).Distinct().Count() != colors.Length ||
             colors.Select(x => x.Name.Trim()).Distinct(StringComparer.OrdinalIgnoreCase).Count() != colors.Length))
            errors["customColors"] = ["appearance.custom_colors_invalid"];
        return errors;
    }
}
public sealed class SavePlatformAppearanceHandler(IPlatformAppearance appearance) : IHandler<SavePlatformAppearance, PlatformAppearance>
{
    public Task<Result<PlatformAppearance>> Handle(SavePlatformAppearance request, CancellationToken cancellationToken) => appearance.Save(request, cancellationToken);
}
