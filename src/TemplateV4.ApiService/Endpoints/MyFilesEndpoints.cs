using System.Security.Claims;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.AspNetCore.Mvc;
using TemplateV4.Application.Modules;
using TemplateV4.Application.Users;
using TemplateV4.Infrastructure.Persistence;
using TemplateV4.Infrastructure.Storage;

namespace TemplateV4.ApiService.Endpoints;

public static class MyFilesEndpoints
{
    public static RouteGroupBuilder MapMyFilesEndpoints(this RouteGroupBuilder group)
    {
        var files = group.MapGroup("/my-files").AddEndpointFilter(async (invocation, next) =>
        {
            var flags = invocation.HttpContext.RequestServices.GetRequiredService<IFeatureFlags>();
            var actor = invocation.HttpContext.RequestServices.GetRequiredService<IExecutionContext>();
            var modules = invocation.HttpContext.RequestServices.GetRequiredService<IRuntimeModules>();
            return flags.Enabled("my-files", actor) && await modules.Enabled("my-files", invocation.HttpContext.RequestAborted)
                ? await next(invocation) : Results.NotFound();
        });
        files.MapGet("", async (MyFilesService service, ClaimsPrincipal principal, CancellationToken ct, int pageNumber = 1, int pageSize = 10, string? search = null, string sort = "createdAt", string direction = "desc", Guid? parentId = null, string group = "my-files") => (await service.List(EndpointSecurity.Actor(principal), pageNumber, pageSize, search, sort, direction, ct, parentId, group)).ToHttp())
            .RequireAuthorization().WithName("ListMyFiles").Produces<FilePage>();
        files.MapPost("/upload", async (string name, HttpContext context, MyFilesService service, CancellationToken ct, Guid? parentId = null) =>
        {
            var maxUploadBytes = (await service.Settings(ct)).MaxUploadBytes;
            var limit = context.Features.Get<IHttpMaxRequestBodySizeFeature>();
            if (limit is { IsReadOnly: false }) limit.MaxRequestBodySize = maxUploadBytes == 0 ? null : maxUploadBytes;
            if (maxUploadBytes > 0 && context.Request.ContentLength > maxUploadBytes) return Results.StatusCode(413);
            return (await service.Upload(EndpointSecurity.Actor(context.User), name, context.Request.Body, ct, parentId)).ToHttp();
        }).RequireAuthorization().WithName("UploadMyFile").Accepts<byte[]>("application/octet-stream").Produces<FileItem>();
        files.MapGet("/{id:guid}/download", async (Guid id, ClaimsPrincipal principal, MyFilesService service, CancellationToken ct) =>
        {
            var result = await service.Download(EndpointSecurity.Actor(principal), id, ct);
            return result.IsSuccess ? Results.File(result.Value!.Content, "application/octet-stream", result.Value.Name, enableRangeProcessing: false) : ApiResults.Failure(result.Error!);
        }).RequireAuthorization().WithName("DownloadMyFile").Produces(200, contentType: "application/octet-stream");
        files.MapPost("/{id:guid}/delete", async (Guid id, ClaimsPrincipal principal, MyFilesService service, CancellationToken ct) => (await service.Delete(EndpointSecurity.Actor(principal), id, ct)).ToHttp())
            .RequireAuthorization().WithName("DeleteMyFile");
        files.MapPost("/folders", async (CreateFolderRequest request, ClaimsPrincipal principal, MyFilesService service, CancellationToken ct) => (await service.CreateFolder(EndpointSecurity.Actor(principal), request, ct)).ToHttp())
            .RequireAuthorization().WithName("CreateMyFilesFolder").Produces<FileItem>();
        files.MapPost("/{id:guid}/rename", async (Guid id, FileNameRequest request, ClaimsPrincipal principal, MyFilesService service, CancellationToken ct) => (await service.Rename(EndpointSecurity.Actor(principal), id, request, ct)).ToHttp())
            .RequireAuthorization().WithName("RenameMyFile");
        files.MapPost("/{id:guid}/metadata", async (Guid id, FileMetadataRequest request, ClaimsPrincipal principal, MyFilesService service, CancellationToken ct) => (await service.Metadata(EndpointSecurity.Actor(principal), id, request, ct)).ToHttp()).RequireAuthorization().WithName("UpdateMyFileMetadata");
        files.MapPost("/{id:guid}/move", async (Guid id, FileMoveRequest request, ClaimsPrincipal principal, MyFilesService service, CancellationToken ct) => (await service.Move(EndpointSecurity.Actor(principal), id, request, ct)).ToHttp()).RequireAuthorization().WithName("MoveMyFile");
        files.MapPost("/{id:guid}/restore", async (Guid id, ClaimsPrincipal principal, MyFilesService service, CancellationToken ct) => (await service.Trash(EndpointSecurity.Actor(principal), id, true, false, ct)).ToHttp()).RequireAuthorization().WithName("RestoreMyFile");
        files.MapPost("/{id:guid}/purge", async (Guid id, ClaimsPrincipal principal, MyFilesService service, CancellationToken ct) => (await service.Trash(EndpointSecurity.Actor(principal), id, false, true, ct)).ToHttp()).RequireAuthorization().WithName("PurgeMyFile");
        files.MapPost("/trash/empty", async (ClaimsPrincipal principal, MyFilesService service, CancellationToken ct) => (await service.Trash(EndpointSecurity.Actor(principal), null, false, true, ct)).ToHttp()).RequireAuthorization().WithName("EmptyMyFilesTrash");
        files.MapGet("/{id:guid}/shares", async (Guid id, ClaimsPrincipal principal, MyFilesService service, CancellationToken ct) => (await service.Shares(EndpointSecurity.Actor(principal), id, ct)).ToHttp()).RequireAuthorization().WithName("ListMyFileShares").Produces<FileShareItem[]>();
        files.MapPost("/{id:guid}/shares", async (Guid id, FileShareRequest request, ClaimsPrincipal principal, MyFilesService service, CancellationToken ct) => (await service.Share(EndpointSecurity.Actor(principal), id, request, ct)).ToHttp()).RequireAuthorization().WithName("ShareMyFile").Produces<FileShareItem>();
        files.MapPost("/{id:guid}/shares/{shareId:guid}/revoke", async (Guid id, Guid shareId, ClaimsPrincipal principal, MyFilesService service, CancellationToken ct) => (await service.Revoke(EndpointSecurity.Actor(principal), id, shareId, ct)).ToHttp()).RequireAuthorization().WithName("RevokeMyFileShare");
        files.MapGet("/public/{id:guid}", async (Guid id, HttpContext context, MyFilesService service, [FromHeader(Name = "X-File-Share")] string? shareToken, CancellationToken ct) => (await service.PublicItem(id, ShareToken(context, shareToken), ct)).ToHttp()).AllowAnonymous().WithName("GetPublicMyFile").Produces<FileItem>();
        files.MapGet("/public/{id:guid}/download", async (Guid id, HttpContext context, MyFilesService service, [FromHeader(Name = "X-File-Share")] string? shareToken, CancellationToken ct) => DownloadResult(await service.PublicDownload(id, ShareToken(context, shareToken), ct))).AllowAnonymous().WithName("DownloadPublicMyFile").Produces(200, contentType: "application/octet-stream");
        files.MapGet("/public/{id:guid}/children", async (Guid id, HttpContext context, MyFilesService service, [FromHeader(Name = "X-File-Share")] string? shareToken, CancellationToken ct, int pageNumber = 1, int pageSize = 10, string? search = null, string sort = "name", string direction = "asc") => (await service.List(Guid.Empty, pageNumber, pageSize, search, sort, direction, ct, id, "my-files", ShareToken(context, shareToken))).ToHttp()).AllowAnonymous().WithName("ListPublicMyFiles").Produces<FilePage>();
        var admin = files.MapGroup("/admin").RequireAuthorization(Permissions.Settings);
        admin.MapGet("/settings", async (MyFilesService service, CancellationToken ct) => Results.Ok(await service.Settings(ct)))
            .WithName("GetMyFilesStorageSettings").Produces<FileStorageSettings>();
        admin.MapPost("/settings", async (StorageSettingsRequest request, ClaimsPrincipal principal, MyFilesService service, CancellationToken ct) => (await service.SaveSettings(EndpointSecurity.Actor(principal), request, ct)).ToHttp())
            .WithName("SaveMyFilesStorageSettings");
        admin.MapGet("/users/{owner:guid}", async (Guid owner, MyFilesService service, CancellationToken ct, int pageNumber = 1, int pageSize = 10, string? search = null, string sort = "createdAt", string direction = "desc", Guid? parentId = null, string group = "my-files") => (await service.List(owner, pageNumber, pageSize, search, sort, direction, ct, parentId, group)).ToHttp())
            .WithName("ListUserMyFiles").Produces<FilePage>();
        admin.MapPost("/users/{owner:guid}/quota", async (Guid owner, FileQuotaRequest request, ClaimsPrincipal principal, MyFilesService service, CancellationToken ct) => (await service.SetQuota(EndpointSecurity.Actor(principal), owner, request, ct)).ToHttp())
            .WithName("SetUserMyFilesQuota");
        admin.MapGet("/users/{owner:guid}/{id:guid}/download", async (Guid owner, Guid id, ClaimsPrincipal principal, MyFilesService service, CancellationToken ct) =>
        {
            var result = await service.Download(owner, id, ct, EndpointSecurity.Actor(principal));
            return result.IsSuccess ? Results.File(result.Value!.Content, "application/octet-stream", result.Value.Name, enableRangeProcessing: false) : ApiResults.Failure(result.Error!);
        }).WithName("DownloadUserMyFile").Produces(200, contentType: "application/octet-stream");
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
