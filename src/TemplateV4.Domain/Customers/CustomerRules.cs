namespace TemplateV4.Domain.Customers;

public static class CustomerRules
{
    public static bool ValidName(string? name) => !string.IsNullOrWhiteSpace(name) && name.Length <= 120 && !name.Any(char.IsControl);
    public static bool Role(string role) => role is "Owner" or "Admin" or "Member";
    public static bool Manage(string role) => role is "Owner" or "Admin";
    public static bool Paid(DateTimeOffset now, DateTimeOffset? paidUntil, DateTimeOffset? trialUntil, int graceDays, bool cancelled) =>
        trialUntil > now || paidUntil is { } end && now < end.AddDays(cancelled ? 0 : graceDays);
}
