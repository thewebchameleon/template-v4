using System.Security.Claims;
using TemplateV4.Application;
using TemplateV4.Application.Users;
using TemplateV4.Infrastructure.Persistence;
using TemplateV4.Infrastructure.Security;

namespace TemplateV4.ApiService.Endpoints;

public static class SecurityEndpoints
{
    public static RouteGroupBuilder MapSecurityEndpoints(this RouteGroupBuilder group)
    {
        group.MapPost("/mfa/login", async (MfaLoginRequest request, AuthService service, HttpContext http, CancellationToken ct) =>
                EndpointSecurity.Tokens(await service.CompleteMfa(request, ct), http.Response))
            .WithName("CompleteMfa").Produces<AccessResponse>();
        group.MapPost("/mfa/email", async (EmailMfaChallengeRequest request, AuthService service, CancellationToken ct) =>
                (await service.SendEmailCode(request, ct)).ToHttp())
            .WithName("SendEmailMfaCode").Produces<EmailMfaChallengeResponse>();
        group.MapGet("/profile", async (SecurityService service, ClaimsPrincipal principal, CancellationToken ct) =>
                await service.Profile(EndpointSecurity.Actor(principal), ct))
            .RequireAuthorization().WithName("GetProfile");
        group.MapPost("/mfa/preference", async (MfaPreferenceRequest request, SecurityService service, ClaimsPrincipal principal, CancellationToken ct) =>
                (await service.SetPreferredMethod(EndpointSecurity.Actor(principal), request, ct)).ToHttp())
            .RequireAuthorization().WithName("SetMfaPreference");
        group.MapPost("/mfa/enroll", async (SecurityProof request, SecurityService service, ClaimsPrincipal principal, CancellationToken ct) =>
                (await service.BeginEnrollment(EndpointSecurity.Actor(principal), EndpointSecurity.SessionId(principal), request, ct)).ToHttp())
            .RequireAuthorization().WithName("BeginMfaEnrollment").Produces<MfaEnrollment>();
        group.MapPost("/mfa/confirm", async (MfaConfirmation request, SecurityService service, ClaimsPrincipal principal, CancellationToken ct) =>
                (await service.ConfirmEnrollment(EndpointSecurity.Actor(principal), EndpointSecurity.SessionId(principal), request.Code, ct)).ToHttp())
            .RequireAuthorization().WithName("ConfirmMfaEnrollment").Produces<string[]>();
        group.MapPost("/mfa/disable", async (SecurityProof request, SecurityService service, ClaimsPrincipal principal, CancellationToken ct) =>
                (await service.ManageMfa(EndpointSecurity.Actor(principal), EndpointSecurity.SessionId(principal), request, true, ct)).ToHttp())
            .RequireAuthorization().WithName("DisableMfa").Produces<string[]>();
        group.MapPost("/mfa/recovery", async (SecurityProof request, SecurityService service, ClaimsPrincipal principal, CancellationToken ct) =>
                (await service.ManageMfa(EndpointSecurity.Actor(principal), EndpointSecurity.SessionId(principal), request, false, ct)).ToHttp())
            .RequireAuthorization().WithName("RotateRecoveryCodes").Produces<string[]>();
        group.MapPost("/passkeys/options", async (PasskeyService service, HttpContext http, CancellationToken ct) =>
                await service.LoginOptions(http, ct))
            .WithName("PasskeyLoginOptions");
        group.MapPost("/passkeys/login", async (PasskeyCredential request, PasskeyService service, HttpContext http, CancellationToken ct) =>
                EndpointSecurity.Tokens(await service.Login(request, http, ct), http.Response))
            .WithName("PasskeyLogin").Produces<AccessResponse>();
        group.MapPost("/passkeys/mfa-options", async (PasskeyChallengeRequest request, PasskeyService service, HttpContext http, CancellationToken ct) =>
                (await service.MfaOptions(request, http, ct)).ToHttp())
            .WithName("PasskeyMfaOptions").Produces<PasskeyOptions>();
        group.MapPost("/passkeys/mfa", async (PasskeyCredential request, PasskeyService service, HttpContext http, CancellationToken ct) =>
                EndpointSecurity.Tokens(await service.CompleteMfa(request, http, ct), http.Response))
            .WithName("CompletePasskeyMfa").Produces<AccessResponse>();
        group.MapPost("/passkeys/register-options", async (SecurityProof request, PasskeyService service, HttpContext http, CancellationToken ct) =>
                (await service.RegistrationOptions(EndpointSecurity.Actor(http.User), request, http, ct)).ToHttp())
            .RequireAuthorization().WithName("PasskeyRegistrationOptions").Produces<PasskeyOptions>();
        group.MapPost("/passkeys/register", async (PasskeyCredential request, PasskeyService service, HttpContext http, CancellationToken ct) =>
                (await service.Register(EndpointSecurity.Actor(http.User), EndpointSecurity.SessionId(http.User), request, http, ct)).ToHttp())
            .RequireAuthorization().WithName("RegisterPasskey");
        group.MapPost("/passkeys/remove", async (RemovePasskeyRequest request, PasskeyService service, ClaimsPrincipal principal, CancellationToken ct) =>
                (await service.Remove(EndpointSecurity.Actor(principal), EndpointSecurity.SessionId(principal), request, ct)).ToHttp())
            .RequireAuthorization().WithName("RemovePasskey");
        group.MapGet("/settings/security", async (SecurityService service, CancellationToken ct) => await service.Settings(ct))
            .RequireAuthorization(Permissions.Settings).WithName("GetSecuritySettings");
        group.MapPost("/settings/security", async (SecurityPolicyRequest request, SecurityService service, ClaimsPrincipal principal, CancellationToken ct) =>
                (await service.SetPolicy(EndpointSecurity.Actor(principal), request, ct)).ToHttp())
            .RequireAuthorization(Permissions.Settings).WithName("SetSecuritySettings").Produces<SecuritySettings>();
        group.MapPost("/invitations", async (InvitationRequest request, AccountService service, ClaimsPrincipal principal, CancellationToken ct) =>
                (await service.Invitation(EndpointSecurity.Actor(principal), request, ct)).ToHttp())
            .RequireAuthorization(Permissions.Manage).WithName("ManageInvitation");

        return group;
    }
}
