using System.Security.Claims;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.AspNetCore.Mvc;
using TemplateV4.Application.FileStorage;
using TemplateV4.Application.Users;
using TemplateV4.Infrastructure.Persistence;
using TemplateV4.Infrastructure.Storage;

namespace TemplateV4.ApiService.Endpoints;

public static class FileStorageEndpoints
{
    public static RouteGroupBuilder MapFileStorageEndpoints(this RouteGroupBuilder group)
    {
        var files = group.MapGroup("/file-storage");
        files.MapGet("", async (FileStorageService service, ClaimsPrincipal principal, CancellationToken ct, int pageNumber = 1, int pageSize = 10, string? search = null, string sort = "createdAt", string direction = "desc", Guid? parentId = null, string group = "file-storage") => (await service.List(EndpointSecurity.Actor(principal), pageNumber, pageSize, search, sort, direction, ct, parentId, group)).ToHttp())
            .RequireAuthorization().WithName("ListFileStorage").Produces<FilePage>();
        files.MapPost("/upload", async (string name, HttpContext context, FileStorageService service, CancellationToken ct, Guid? parentId = null) =>
        {
            var maxUploadBytes = (await service.Settings(ct)).MaxUploadBytes;
            var limit = context.Features.Get<IHttpMaxRequestBodySizeFeature>();
            if (limit is { IsReadOnly: false }) limit.MaxRequestBodySize = maxUploadBytes == 0 ? null : maxUploadBytes;
            if (maxUploadBytes > 0 && context.Request.ContentLength > maxUploadBytes) return Results.StatusCode(413);
            return (await service.Upload(EndpointSecurity.Actor(context.User), name, context.Request.Body, ct, parentId)).ToHttp();
        }).RequireAuthorization().WithName("UploadFileStorageFile").Accepts<byte[]>("application/octet-stream").Produces<FileItem>();
        files.MapGet("/{id:guid}/download", async (Guid id, ClaimsPrincipal principal, FileStorageService service, CancellationToken ct) =>
        {
            var result = await service.Download(EndpointSecurity.Actor(principal), id, ct);
            return result.IsSuccess ? Results.File(result.Value!.Content, "application/octet-stream", result.Value.Name, enableRangeProcessing: false) : ApiResults.Failure(result.Error!);
        }).RequireAuthorization().WithName("DownloadFileStorageFile").Produces(200, contentType: "application/octet-stream");
        files.MapPost("/{id:guid}/delete", async (Guid id, ClaimsPrincipal principal, FileStorageService service, CancellationToken ct) => (await service.Delete(EndpointSecurity.Actor(principal), id, ct)).ToHttp())
            .RequireAuthorization().WithName("DeleteFileStorageFile");
        files.MapPost("/folders", async (CreateFolderRequest request, ClaimsPrincipal principal, FileStorageService service, CancellationToken ct) => (await service.CreateFolder(EndpointSecurity.Actor(principal), request, ct)).ToHttp())
            .RequireAuthorization().WithName("CreateFileStorageFolder").Produces<FileItem>();
        files.MapPost("/{id:guid}/rename", async (Guid id, FileNameRequest request, ClaimsPrincipal principal, FileStorageService service, CancellationToken ct) => (await service.Rename(EndpointSecurity.Actor(principal), id, request, ct)).ToHttp())
            .RequireAuthorization().WithName("RenameFileStorageFile");
        files.MapPost("/{id:guid}/metadata", async (Guid id, FileMetadataRequest request, ClaimsPrincipal principal, FileStorageService service, CancellationToken ct) => (await service.Metadata(EndpointSecurity.Actor(principal), id, request, ct)).ToHttp()).RequireAuthorization().WithName("UpdateFileStorageFileMetadata");
        files.MapPost("/{id:guid}/move", async (Guid id, FileMoveRequest request, ClaimsPrincipal principal, FileStorageService service, CancellationToken ct) => (await service.Move(EndpointSecurity.Actor(principal), id, request, ct)).ToHttp()).RequireAuthorization().WithName("MoveFileStorageFile");
        files.MapPost("/{id:guid}/restore", async (Guid id, ClaimsPrincipal principal, FileStorageService service, CancellationToken ct) => (await service.Trash(EndpointSecurity.Actor(principal), id, true, false, ct)).ToHttp()).RequireAuthorization().WithName("RestoreFileStorageFile");
        files.MapPost("/{id:guid}/purge", async (Guid id, ClaimsPrincipal principal, FileStorageService service, CancellationToken ct) => (await service.Trash(EndpointSecurity.Actor(principal), id, false, true, ct)).ToHttp()).RequireAuthorization().WithName("PurgeFileStorageFile");
        files.MapPost("/trash/empty", async (ClaimsPrincipal principal, FileStorageService service, CancellationToken ct) => (await service.Trash(EndpointSecurity.Actor(principal), null, false, true, ct)).ToHttp()).RequireAuthorization().WithName("EmptyFileStorageTrash");
        files.MapGet("/{id:guid}/shares", async (Guid id, ClaimsPrincipal principal, FileStorageService service, CancellationToken ct) => (await service.Shares(EndpointSecurity.Actor(principal), id, ct)).ToHttp()).RequireAuthorization().WithName("ListFileStorageShares").Produces<FileShareItem[]>();
        files.MapPost("/{id:guid}/shares", async (Guid id, FileShareRequest request, ClaimsPrincipal principal, FileStorageService service, CancellationToken ct) => (await service.Share(EndpointSecurity.Actor(principal), id, request, ct)).ToHttp()).RequireAuthorization().WithName("ShareFileStorageFile").Produces<FileShareItem>();
        files.MapPost("/{id:guid}/shares/{shareId:guid}/revoke", async (Guid id, Guid shareId, ClaimsPrincipal principal, FileStorageService service, CancellationToken ct) => (await service.Revoke(EndpointSecurity.Actor(principal), id, shareId, ct)).ToHttp()).RequireAuthorization().WithName("RevokeFileStorageShare");
        files.MapGet("/public/{id:guid}", async (Guid id, HttpContext context, FileStorageService service, [FromHeader(Name = "X-File-Share")] string? shareToken, CancellationToken ct) => (await service.PublicItem(id, ShareToken(context, shareToken), ct)).ToHttp()).AllowAnonymous().WithName("GetPublicFileStorageFile").Produces<FileItem>();
        files.MapGet("/public/{id:guid}/download", async (Guid id, HttpContext context, FileStorageService service, [FromHeader(Name = "X-File-Share")] string? shareToken, CancellationToken ct) => DownloadResult(await service.PublicDownload(id, ShareToken(context, shareToken), ct))).AllowAnonymous().WithName("DownloadPublicFileStorageFile").Produces(200, contentType: "application/octet-stream");
        files.MapGet("/public/{id:guid}/children", async (Guid id, HttpContext context, FileStorageService service, [FromHeader(Name = "X-File-Share")] string? shareToken, CancellationToken ct, int pageNumber = 1, int pageSize = 10, string? search = null, string sort = "name", string direction = "asc") => (await service.List(Guid.Empty, pageNumber, pageSize, search, sort, direction, ct, id, "file-storage", ShareToken(context, shareToken))).ToHttp()).AllowAnonymous().WithName("ListPublicFileStorage").Produces<FilePage>();
        var admin = files.MapGroup("/admin");
        admin.MapGet("/settings", async (FileStorageService service, CancellationToken ct) => Results.Ok(await service.Settings(ct)))
            .RequireAuthorization(Permissions.Settings).WithName("GetFileStorageStorageSettings").Produces<FileStorageSettings>();
        admin.MapPost("/settings", async (StorageSettingsRequest request, ClaimsPrincipal principal, FileStorageService service, CancellationToken ct) => (await service.SaveSettings(EndpointSecurity.Actor(principal), request, ct)).ToHttp())
            .RequireAuthorization(Permissions.Settings).WithName("SaveFileStorageStorageSettings");
        admin.MapPost("/purge", async (PurgeAllFileStorageData request, Dispatcher<PurgeAllFileStorageData, Unit> dispatcher, CancellationToken ct) =>
            (await dispatcher.Send(request, ct)).ToHttp()).RequireAuthorization(Permissions.FileStoragePurge).WithName("PurgeAllFileStorageData");
        return group;
    }
    private static string ShareToken(HttpContext context, string? shareToken)
    {
        context.Response.Headers.CacheControl = "no-store";
        context.Response.Headers["Referrer-Policy"] = "no-referrer";
        return shareToken ?? "";
    }
    private static IResult DownloadResult(Result<FileDownload> result) => result.IsSuccess ? Results.File(result.Value!.Content, "application/octet-stream", result.Value.Name, enableRangeProcessing: false) : ApiResults.Failure(result.Error!);
}
