using TemplateV4.Domain.Customers;
using TemplateV4.Infrastructure.Images;
using Xunit;

namespace TemplateV4.Application.Tests;

public sealed class OrganisationBrandingTests
{
    [Fact]
    public void Organisation_profile_values_are_bounded_and_safe()
    {
        Assert.True(CustomerRules.ValidName("Example Organisation"));
        Assert.True(CustomerRules.ValidWebsite("https://example.test"));
        Assert.False(CustomerRules.ValidWebsite("javascript:alert(1)"));
        Assert.False(CustomerRules.ValidWebsite("https://user:secret@example.test"));
        Assert.True(CustomerRules.ValidEmail("admin@example.test"));
        Assert.False(CustomerRules.ValidEmail("Example <admin@example.test>"));
        Assert.True(CustomerRules.ValidTimeZone("UTC"));
        Assert.False(CustomerRules.ValidOptionalText("South\0Africa", 100));
    }

    [Fact]
    public void Logo_normalization_accepts_a_small_png_and_rejects_invalid_content()
    {
        var source = Convert.FromBase64String("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=");
        Assert.True(PngImage.TryNormalize(source, 512, 1048576, out var normalized));
        Assert.NotNull(normalized);
        Assert.False(PngImage.TryNormalize("not an image"u8, 512, 1048576, out _));
    }
}
