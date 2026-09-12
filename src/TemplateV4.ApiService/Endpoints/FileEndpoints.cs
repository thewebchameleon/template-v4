using System.Security.Claims;
using Microsoft.AspNetCore.Http.Features;
using TemplateV4.Application.Modules;
using TemplateV4.Application.Users;
using TemplateV4.Infrastructure.Persistence;
using TemplateV4.Infrastructure.Storage;

namespace TemplateV4.ApiService.Endpoints;

public static class FileEndpoints
{
    public static RouteGroupBuilder MapFileEndpoints(this RouteGroupBuilder group)
    {
        var files = group.MapGroup("/files").AddEndpointFilter(async (invocation, next) =>
        {
            var flags = invocation.HttpContext.RequestServices.GetRequiredService<IFeatureFlags>();
            var actor = invocation.HttpContext.RequestServices.GetRequiredService<IExecutionContext>();
            var modules = invocation.HttpContext.RequestServices.GetRequiredService<IRuntimeModules>();
            return flags.Enabled("files", actor) && await modules.Enabled("files", invocation.HttpContext.RequestAborted)
                ? await next(invocation) : Results.NotFound();
        });
        files.MapGet("", async (FileService service, ClaimsPrincipal principal, CancellationToken ct, int pageNumber = 1, int pageSize = 25, string? search = null, string sort = "createdAt", string direction = "desc", Guid? parentId = null) => (await service.List(EndpointSecurity.Actor(principal), pageNumber, pageSize, search, sort, direction, ct, parentId)).ToHttp())
            .RequireAuthorization().WithName("ListFiles").Produces<FilePage>();
        files.MapPost("/upload", async (string name, HttpContext context, FileService service, CancellationToken ct, Guid? parentId = null) =>
        {
            var limit = context.Features.Get<IHttpMaxRequestBodySizeFeature>();
            if (limit is { IsReadOnly: false }) limit.MaxRequestBodySize = FileService.MaxUploadBytes;
            if (context.Request.ContentLength > FileService.MaxUploadBytes) return Results.StatusCode(413);
            return (await service.Upload(EndpointSecurity.Actor(context.User), name, context.Request.Body, ct, parentId)).ToHttp();
        }).RequireAuthorization().WithName("UploadFile").Accepts<byte[]>("application/octet-stream").Produces<FileItem>();
        files.MapGet("/{id:guid}/download", async (Guid id, ClaimsPrincipal principal, FileService service, CancellationToken ct) =>
        {
            var result = await service.Download(EndpointSecurity.Actor(principal), id, ct);
            return result.IsSuccess ? Results.File(result.Value!.Content, "application/octet-stream", result.Value.Name, enableRangeProcessing: false) : ApiResults.Failure(result.Error!);
        }).RequireAuthorization().WithName("DownloadFile").Produces(200, contentType: "application/octet-stream");
        files.MapPost("/{id:guid}/delete", async (Guid id, ClaimsPrincipal principal, FileService service, CancellationToken ct) => (await service.Delete(EndpointSecurity.Actor(principal), id, ct)).ToHttp())
            .RequireAuthorization().WithName("DeleteFile");
        files.MapPost("/folders", async (CreateFolderRequest request, ClaimsPrincipal principal, FileService service, CancellationToken ct) => (await service.CreateFolder(EndpointSecurity.Actor(principal), request, ct)).ToHttp())
            .RequireAuthorization().WithName("CreateFileFolder").Produces<FileItem>();
        files.MapPost("/{id:guid}/rename", async (Guid id, FileNameRequest request, ClaimsPrincipal principal, FileService service, CancellationToken ct) => (await service.Rename(EndpointSecurity.Actor(principal), id, request, ct)).ToHttp())
            .RequireAuthorization().WithName("RenameFile");
        var admin = files.MapGroup("/admin").RequireAuthorization(Permissions.Settings);
        admin.MapGet("/settings", async (FileService service, CancellationToken ct) => Results.Ok(await service.Settings(ct)))
            .WithName("GetFileStorageSettings").Produces<FileStorageSettings>();
        admin.MapPost("/settings", async (StorageSettingsRequest request, ClaimsPrincipal principal, FileService service, CancellationToken ct) => (await service.SaveSettings(EndpointSecurity.Actor(principal), request, ct)).ToHttp())
            .WithName("SaveFileStorageSettings");
        admin.MapGet("/users/{owner:guid}", async (Guid owner, FileService service, CancellationToken ct, int pageNumber = 1, int pageSize = 10, string? search = null, string sort = "createdAt", string direction = "desc", Guid? parentId = null) => (await service.List(owner, pageNumber, pageSize, search, sort, direction, ct, parentId)).ToHttp())
            .WithName("ListUserFiles").Produces<FilePage>();
        admin.MapPost("/users/{owner:guid}/quota", async (Guid owner, FileQuotaRequest request, ClaimsPrincipal principal, FileService service, CancellationToken ct) => (await service.SetQuota(EndpointSecurity.Actor(principal), owner, request, ct)).ToHttp())
            .WithName("SetUserFileQuota");
        admin.MapGet("/users/{owner:guid}/{id:guid}/download", async (Guid owner, Guid id, ClaimsPrincipal principal, FileService service, CancellationToken ct) =>
        {
            var result = await service.Download(owner, id, ct, EndpointSecurity.Actor(principal));
            return result.IsSuccess ? Results.File(result.Value!.Content, "application/octet-stream", result.Value.Name, enableRangeProcessing: false) : ApiResults.Failure(result.Error!);
        }).WithName("DownloadUserFile").Produces(200, contentType: "application/octet-stream");
        return group;
    }
}
