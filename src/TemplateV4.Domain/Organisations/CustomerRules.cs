namespace TemplateV4.Domain.Customers;

public static class CustomerRules
{
    public static bool ValidName(string? name) => !string.IsNullOrWhiteSpace(name) && name.Length <= 120 && !name.Any(char.IsControl);
    public static bool ValidOptionalText(string? value, int maximum) =>
        string.IsNullOrWhiteSpace(value) || value.Trim().Length <= maximum && !value.Any(char.IsControl);
    public static bool ValidWebsite(string? value) => string.IsNullOrWhiteSpace(value) ||
        value.Trim().Length <= 2048 && Uri.TryCreate(value.Trim(), UriKind.Absolute, out var uri) &&
        uri.Scheme is "https" or "http" && string.IsNullOrEmpty(uri.UserInfo);
    public static bool ValidEmail(string? value) => string.IsNullOrWhiteSpace(value) ||
        value.Trim().Length <= 254 && System.Net.Mail.MailAddress.TryCreate(value.Trim(), out var address) &&
        string.Equals(address.Address, value.Trim(), StringComparison.OrdinalIgnoreCase);
    public static bool ValidTimeZone(string? value) => !string.IsNullOrWhiteSpace(value) && value.Length <= 100 &&
        (value == "UTC" || TimeZoneInfo.GetSystemTimeZones().Any(zone =>
            (zone.HasIanaId ? zone.Id : TimeZoneInfo.TryConvertWindowsIdToIanaId(zone.Id, out var id) ? id : null) == value));
    public static bool Role(string role) => role is "Owner" or "Admin" or "Member";
    public static bool Manage(string role) => role is "Owner" or "Admin";
    public static bool Paid(DateTimeOffset now, DateTimeOffset? paidUntil, DateTimeOffset? trialUntil, int graceDays, bool cancelled) =>
        trialUntil > now || paidUntil is { } end && now < end.AddDays(cancelled ? 0 : graceDays);
}
