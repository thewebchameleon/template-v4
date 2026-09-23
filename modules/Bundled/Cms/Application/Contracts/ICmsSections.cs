namespace TemplateV4.Application.Cms;

public sealed record LandingSection(string Key, string Heading, string Text, string ImageUrl, string ImageAlt);
public sealed record CmsSections(Guid Version, LandingSection[] Draft, LandingSection[] Published);
public sealed record SaveCmsSections(Guid Version, LandingSection[] Sections);
public sealed record PublishCmsSections(Guid Version);
public interface ICmsSections
{
    Task<Result<CmsSections>> Read(CancellationToken ct);
    Task<Result<CmsSections>> Save(SaveCmsSections request, CancellationToken ct);
    Task<Result<CmsSections>> Publish(PublishCmsSections request, CancellationToken ct);
    Task<Result<LandingSection[]>> Public(CancellationToken ct);
}
