namespace TemplateV4.Application.FileStorage;

public sealed record PurgeAllFileStorageData(string Confirmation, string Password) : ICommand<Unit>, IAuthorizedRequest
{
    public const string RequiredConfirmation = "PURGE ALL DATA";
    public string Permission => Users.Permissions.FileStoragePurge;
    public override string ToString() => $"PurgeAllFileStorageData {{ Confirmation = {Confirmation} }}";
}

public sealed class PurgeAllFileStorageDataValidator : IValidator<PurgeAllFileStorageData>
{
    public Dictionary<string, string[]> Validate(PurgeAllFileStorageData request)
        => request.Confirmation != PurgeAllFileStorageData.RequiredConfirmation || string.IsNullOrEmpty(request.Password) || request.Password.Length > 1024
            ? new() { ["confirmation"] = ["validation.failed"] }
            : [];
}
