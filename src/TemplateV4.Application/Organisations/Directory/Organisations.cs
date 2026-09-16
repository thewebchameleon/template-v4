namespace TemplateV4.Application.Customers;

public static class Organisation
{
    // Stable identity for retained payment references and shared storage keys.
    public static readonly Guid Id = new("00000000-0000-0000-0000-000000000001");
}
public sealed record CustomerInfo(Guid Id, string Name, bool CanManage, int Users, Guid Version);
