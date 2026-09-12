using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using TemplateV4.Application.Platform;
using TemplateV4.Infrastructure.Persistence;

namespace TemplateV4.Infrastructure;

public sealed class PlatformAppearanceStore(FrameworkDb db, IExecutionContext context, TimeProvider time) : IPlatformAppearance
{
    public async Task<PlatformAppearance> Read(CancellationToken ct)
    {
        var row = await db.PlatformAppearanceSettings.AsNoTracking().SingleAsync(x => x.Id == 1, ct);
        return new(row.PrimaryColor, row.Version, JsonSerializer.Deserialize<CustomBrandColor[]>(row.CustomColorsJson)!, row.SelectedCustomColorId);
    }

    // The dispatcher owns the transaction, including this update and its audit entry.
    public async Task<Result<PlatformAppearance>> Save(SavePlatformAppearance request, CancellationToken ct)
    {
        var administrator = await (from membership in db.UserRoles
                                   join role in db.Roles on membership.RoleId equals role.Id
                                   where membership.UserId == context.ActorId && role.Name == "Administrator"
                                   select membership).AnyAsync(ct);
        if (!administrator) return Result<PlatformAppearance>.Fail("authorization.denied", ErrorKind.Forbidden);
        var previous = await Read(ct);
        var colors = (request.CustomColors ?? previous.CustomColors)
            .Select(x => new CustomBrandColor(x.Id, x.Name.Trim(), x.Color.ToUpperInvariant())).ToArray();
        var selected = request.SelectedCustomColorId;
        var primary = request.PrimaryColor.ToUpperInvariant();
        if (selected is { } id)
        {
            var custom = colors.SingleOrDefault(x => x.Id == id);
            if (custom is null) { selected = null; primary = "#2563EB"; }
            else primary = custom.Color;
        }
        else if (previous.SelectedCustomColorId is { } oldId && colors.All(x => x.Id != oldId) && primary == previous.PrimaryColor)
            primary = "#2563EB";
        var value = new PlatformAppearance(primary, Guid.NewGuid(), colors, selected);
        var json = JsonSerializer.Serialize(colors);
        var changed = await db.PlatformAppearanceSettings.Where(x => x.Id == 1 && x.Version == request.Version)
            .ExecuteUpdateAsync(x => x.SetProperty(s => s.PrimaryColor, value.PrimaryColor).SetProperty(s => s.Version, value.Version)
                .SetProperty(s => s.CustomColorsJson, json).SetProperty(s => s.SelectedCustomColorId, value.SelectedCustomColorId), ct);
        if (changed == 0) return Result<PlatformAppearance>.Fail("appearance.conflict", ErrorKind.Conflict);
        db.Audit.Add(new() { ActorId = context.ActorId, Action = "configuration.appearance_changed", SubjectType = "configuration", SubjectNameSnapshot = "appearance", ChangesJson = AuditCapture.Changes(new AuditChange("primaryColor", previous.PrimaryColor, value.PrimaryColor), new("customColors", JsonSerializer.Serialize(previous.CustomColors), json), new("selectedCustomColorId", previous.SelectedCustomColorId?.ToString(), selected?.ToString())), At = time.GetUtcNow(), TraceParent = context.TraceParent });
        return Result<PlatformAppearance>.Success(value);
    }
}
