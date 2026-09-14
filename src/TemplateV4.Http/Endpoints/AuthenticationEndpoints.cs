using System.Security.Claims;
using Microsoft.AspNetCore.Antiforgery;
using TemplateV4.Application;
using TemplateV4.Infrastructure.Persistence;
using TemplateV4.Infrastructure.Security;

namespace TemplateV4.ApiService.Endpoints;

public static class AuthenticationEndpoints
{
    public static RouteGroupBuilder MapAuthenticationEndpoints(this RouteGroupBuilder group)
    {
        group.MapGet("/csrf", (HttpContext context, IAntiforgery antiforgery) =>
        {
            var principal = context.User;
            try
            {
                context.User = new ClaimsPrincipal(new ClaimsIdentity());
                return Results.Ok(new { token = antiforgery.GetAndStoreTokens(context).RequestToken });
            }
            finally
            {
                context.User = principal;
            }
        }).WithName("GetCsrfToken");

        group.MapGet("/registration", async (RegistrationService service, CancellationToken ct) => await service.Settings(ct))
            .WithName("GetRegistrationSettings").Produces<RegistrationSettings>();
        group.MapPost("/register", async (RegistrationRequest request, RegistrationService service, CancellationToken ct) =>
        {
            var result = await service.Register(request, ct);
            return result.IsSuccess ? Results.Accepted() : ApiResults.Failure(result.Error!);
        }).WithName("RegisterAccount").Produces(StatusCodes.Status202Accepted);
        group.MapPost("/login", async (LoginRequest request, AuthService service, HttpContext context, CancellationToken ct) =>
                EndpointSecurity.Tokens(await service.Login(request, ct), context.Response))
            .WithName("Login").Produces<AccessResponse>();
        group.MapPost("/refresh", async (AuthService service, HttpContext context, CancellationToken ct) =>
                EndpointSecurity.Tokens(await service.Refresh(context.Request.Cookies[EndpointSecurity.RefreshCookie], ct), context.Response))
            .WithName("Refresh").Produces<AccessResponse>();
        group.MapPost("/logout", async (AuthService service, HttpContext context, CancellationToken ct) =>
        {
            await service.Logout(context.Request.Cookies[EndpointSecurity.RefreshCookie], ct);
            context.Response.Cookies.Delete(EndpointSecurity.RefreshCookie, EndpointSecurity.RefreshCookieOptions());
            return Results.NoContent();
        }).WithName("Logout");
        group.MapGet("/sessions", async (AuthService service, ClaimsPrincipal principal, CancellationToken ct) =>
        {
            return await service.ListSessions(EndpointSecurity.Actor(principal), EndpointSecurity.SessionId(principal), ct);
        }).RequireAuthorization().WithName("ListSessions");
        group.MapDelete("/sessions/{id:guid}", async (Guid id, AuthService service, ClaimsPrincipal principal, CancellationToken ct) =>
        {
            await service.Revoke(EndpointSecurity.Actor(principal), id, ct);
            return Results.NoContent();
        }).RequireAuthorization().WithName("RevokeSession");
        group.MapPost("/forgot-password", async (ForgotPasswordRequest request, AccountService service, CancellationToken ct) =>
        {
            await service.Forgot(request, ct);
            return Results.Accepted();
        }).WithName("ForgotPassword");
        group.MapPost("/confirm-email", async (ConfirmEmailRequest request, AccountService service, CancellationToken ct) =>
                (await service.Confirm(request, ct)).ToHttp())
            .WithName("ConfirmEmail");
        group.MapPost("/reset-password", async (ResetPasswordRequest request, AccountService service, CancellationToken ct) =>
                (await service.Reset(request, ct)).ToHttp())
            .WithName("ResetPassword");
        group.MapPost("/culture", async (CultureRequest request, AccountService service, ClaimsPrincipal principal, CancellationToken ct) =>
        {
            var result = await service.SetCulture(EndpointSecurity.Actor(principal), request, ct);
            return result.IsSuccess ? Results.NoContent() : ApiResults.Failure(result.Error!);
        })
            .RequireAuthorization().WithName("SetCulture");

        return group;
    }
}
