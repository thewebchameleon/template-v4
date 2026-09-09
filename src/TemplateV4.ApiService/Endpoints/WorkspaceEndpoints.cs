using System.Security.Claims;
using Microsoft.AspNetCore.Http.Features;
using TemplateV4.Application;
using TemplateV4.Application.Platform;
using TemplateV4.Application.Users;
using TemplateV4.Infrastructure;
using TemplateV4.Infrastructure.Security;
using TemplateV4.Infrastructure.Storage;

namespace TemplateV4.ApiService.Endpoints;

public static class WorkspaceEndpoints
{
    public static RouteGroupBuilder MapWorkspaceEndpoints(this RouteGroupBuilder group)
    {
        group.MapGet("/audit", async ([AsParameters] AuditQuery query, Dispatcher<AuditQuery, Page<AuditItem>> dispatcher, CancellationToken ct) => (await dispatcher.Send(query, ct)).ToHttp())
            .RequireAuthorization(Permissions.Settings).WithName("ListAuditHistory").Produces<Page<AuditItem>>();
        group.MapGet("/invitations", async (AccountService service, CancellationToken ct, int pageNumber = 1, int pageSize = 25, string? search = null, string state = "all", string sort = "sentAt", string direction = "desc") => (await service.Invitations(pageNumber, pageSize, search, state, sort, direction, ct)).ToHttp())
            .RequireAuthorization(Permissions.Manage).WithName("ListInvitations").Produces<InvitationPage>();
        group.MapGet("/operations/overview", async (OperationsService service, CancellationToken ct) => Results.Ok(await service.Overview(ct)))
            .RequireAuthorization(Permissions.Settings).WithName("GetOperationsOverview").Produces<OperationsOverview>();
        group.MapGet("/notifications/summary", async (NotificationService service, ClaimsPrincipal principal, CancellationToken ct) => Results.Ok(await service.Summary(EndpointSecurity.Actor(principal), ct)))
            .RequireAuthorization().WithName("GetNotificationSummary").Produces<NotificationSummary>();
        group.MapGet("/notifications", async (NotificationService service, ClaimsPrincipal principal, CancellationToken ct, int pageNumber = 1, int pageSize = 25, bool unreadOnly = false, string sort = "createdAt", string direction = "desc") => (await service.List(EndpointSecurity.Actor(principal), pageNumber, pageSize, unreadOnly, sort, direction, ct)).ToHttp())
            .RequireAuthorization().WithName("ListNotifications").Produces<NotificationPage>();
        group.MapPost("/notifications/read", async (NotificationService service, ClaimsPrincipal principal, CancellationToken ct, Guid? id = null, bool read = true) => (await service.Read(EndpointSecurity.Actor(principal), id, read, ct)).ToHttp())
            .RequireAuthorization().WithName("ReadNotifications");
        group.MapPost("/notifications/preferences", async (NotificationPreference request, NotificationService service, ClaimsPrincipal principal, CancellationToken ct) => (await service.Preferences(EndpointSecurity.Actor(principal), request, ct)).ToHttp())
            .RequireAuthorization().WithName("SaveNotificationPreferences");
        var files = group.MapGroup("/files").AddEndpointFilter(async (invocation, next) =>
        {
            var flags = invocation.HttpContext.RequestServices.GetRequiredService<IFeatureFlags>();
            var actor = invocation.HttpContext.RequestServices.GetRequiredService<IExecutionContext>();
            return flags.Enabled("files", actor) ? await next(invocation) : Results.NotFound();
        });
        files.MapGet("", async (FileService service, ClaimsPrincipal principal, CancellationToken ct, int pageNumber = 1, int pageSize = 25, string? search = null, string sort = "createdAt", string direction = "desc") => (await service.List(EndpointSecurity.Actor(principal), pageNumber, pageSize, search, sort, direction, ct)).ToHttp())
            .RequireAuthorization().WithName("ListFiles").Produces<FilePage>();
        files.MapPost("/upload", async (string name, HttpContext context, FileService service, CancellationToken ct) =>
        {
            var limit = context.Features.Get<IHttpMaxRequestBodySizeFeature>();
            if (limit is { IsReadOnly: false }) limit.MaxRequestBodySize = FileService.MaxUploadBytes;
            if (context.Request.ContentLength > FileService.MaxUploadBytes) return Results.StatusCode(413);
            return (await service.Upload(EndpointSecurity.Actor(context.User), name, context.Request.Body, ct)).ToHttp();
        }).RequireAuthorization().WithName("UploadFile").Accepts<byte[]>("application/octet-stream").Produces<FileItem>();
        files.MapGet("/{id:guid}/download", async (Guid id, ClaimsPrincipal principal, FileService service, CancellationToken ct) =>
        {
            var result = await service.Download(EndpointSecurity.Actor(principal), id, ct);
            return result.IsSuccess ? Results.File(result.Value!.Content, "application/octet-stream", result.Value.Name, enableRangeProcessing: false) : ApiResults.Failure(result.Error!);
        }).RequireAuthorization().WithName("DownloadFile").Produces(200, contentType: "application/octet-stream");
        files.MapPost("/{id:guid}/delete", async (Guid id, ClaimsPrincipal principal, FileService service, CancellationToken ct) => (await service.Delete(EndpointSecurity.Actor(principal), id, ct)).ToHttp())
            .RequireAuthorization().WithName("DeleteFile");
        group.MapGet("/privacy", async (ClaimsPrincipal principal, PrivacyService service, CancellationToken ct) => Results.Ok(await service.Status(EndpointSecurity.Actor(principal), ct)))
            .RequireAuthorization().WithName("GetPrivacyStatus").Produces<PrivacyStatus>();
        group.MapGet("/privacy/export", async (ClaimsPrincipal principal, PrivacyService service, CancellationToken ct) => Results.File(await service.Export(EndpointSecurity.Actor(principal), ct), "application/json", "account-data.json"))
            .RequireAuthorization().WithName("ExportAccountData").Produces(200, contentType: "application/json");
        group.MapPost("/privacy/email", async (ChangeEmailRequest request, ClaimsPrincipal principal, PrivacyService service, CancellationToken ct) => (await service.ChangeEmail(EndpointSecurity.Actor(principal), request, ct)).ToHttp())
            .RequireAuthorization().WithName("RequestEmailChange");
        group.MapPost("/privacy/confirm-email", async (ConfirmEmailChangeRequest request, PrivacyService service, CancellationToken ct) => (await service.ConfirmEmail(request, ct)).ToHttp())
            .AllowAnonymous().WithName("ConfirmEmailChange");
        group.MapPost("/privacy/deletion", async (ClaimsPrincipal principal, PrivacyService service, CancellationToken ct) => (await service.RequestDeletion(EndpointSecurity.Actor(principal), ct)).ToHttp())
            .RequireAuthorization().WithName("RequestAccountDeletion");
        group.MapPost("/privacy/withdraw", async (ClaimsPrincipal principal, PrivacyService service, CancellationToken ct) => (await service.Withdraw(EndpointSecurity.Actor(principal), ct)).ToHttp())
            .RequireAuthorization().WithName("WithdrawAccountDeletion");
        group.MapGet("/privacy/requests", async (PrivacyService service, CancellationToken ct, int pageNumber = 1, int pageSize = 25, string sort = "requestedAt", string direction = "asc") => (await service.Requests(pageNumber, pageSize, sort, direction, ct)).ToHttp())
            .RequireAuthorization(Permissions.Settings).WithName("ListDeletionRequests").Produces<Page<DeletionItem>>();
        group.MapPost("/privacy/review", async (ReviewDeletionRequest request, ClaimsPrincipal principal, PrivacyService service, CancellationToken ct) => (await service.Review(EndpointSecurity.Actor(principal), request, ct)).ToHttp())
            .RequireAuthorization(Permissions.Settings).WithName("ReviewAccountDeletion");
        return group;
    }
}
