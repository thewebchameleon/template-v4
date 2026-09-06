using System.Security.Claims;
using Microsoft.AspNetCore.Antiforgery;
using TemplateV4.Infrastructure.Security;

namespace TemplateV4.ApiService.Endpoints;

internal static class EndpointSecurity
{
    internal const string RefreshCookie = "__Host-templatev4-refresh";

    internal static RouteGroupBuilder AddAuthSecurity(this RouteGroupBuilder group, string[] allowedOrigins)
        => group.AddBrowserSecurity(allowedOrigins, context => context.Request.Path.Value is
            "/api/v1/auth/login" or
            "/api/v1/auth/mfa/login" or
            "/api/v1/auth/mfa/email" or
            "/api/v1/auth/passkeys/login" or
            "/api/v1/auth/passkeys/options" or
            "/api/v1/auth/passkeys/mfa-options" or
            "/api/v1/auth/passkeys/mfa" or
            "/api/v1/auth/forgot-password" or
            "/api/v1/auth/register");

    internal static RouteGroupBuilder AddBootstrapSecurity(this RouteGroupBuilder group, string[] allowedOrigins)
        => group.AddBrowserSecurity(allowedOrigins, _ => true);

    internal static Guid Actor(ClaimsPrincipal principal) => Guid.Parse(principal.FindFirstValue("sub")!);

    internal static Guid SessionId(ClaimsPrincipal principal) => Guid.Parse(principal.FindFirstValue("sid")!);

    internal static CookieOptions RefreshCookieOptions() => new()
    {
        HttpOnly = true,
        Secure = true,
        SameSite = SameSiteMode.Strict,
        Path = "/",
        MaxAge = TimeSpan.FromDays(30),
        IsEssential = true
    };

    internal static IResult Tokens(Result<AuthTokens> result, HttpResponse response)
    {
        if (!result.IsSuccess)
        {
            response.Cookies.Delete(RefreshCookie, RefreshCookieOptions());
            return ApiResults.Failure(result.Error!);
        }

        if (result.Value!.RefreshToken.Length > 0)
            response.Cookies.Append(RefreshCookie, result.Value.RefreshToken, RefreshCookieOptions());
        return Results.Ok(result.Value.Access);
    }

    private static RouteGroupBuilder AddBrowserSecurity(
        this RouteGroupBuilder group,
        string[] allowedOrigins,
        Func<HttpContext, bool> usesCredentialLimit)
    {
        group.AddEndpointFilter(async (invocation, next) =>
        {
            var context = invocation.HttpContext;
            var limiter = context.RequestServices.GetRequiredService<SharedRateLimiter>();
            var credential = usesCredentialLimit(context);
            var subject = credential
                ? context.Connection.RemoteIpAddress?.ToString() ?? "unknown"
                : context.User.FindFirstValue("sub") ?? context.Connection.RemoteIpAddress?.ToString() ?? "unknown";
            if (!await limiter.Allow(
                    credential ? "credentials" : "session",
                    subject,
                    credential ? 20 : 120,
                    TimeSpan.FromMinutes(1),
                    context.RequestAborted))
            {
                context.Response.Headers.RetryAfter = "60";
                return Results.StatusCode(429);
            }

            if (HttpMethods.IsGet(context.Request.Method)) return await next(invocation);
            var origin = context.Request.Headers.Origin.ToString();
            var ownOrigin = $"{context.Request.Scheme}://{context.Request.Host}";
            if (origin.Length == 0 || (origin != ownOrigin && !allowedOrigins.Contains(origin, StringComparer.Ordinal)))
                return ApiResults.Failure(new("csrf.origin_denied", ErrorKind.Forbidden));

            var principal = context.User;
            try
            {
                context.User = new ClaimsPrincipal(new ClaimsIdentity());
                await context.RequestServices.GetRequiredService<IAntiforgery>().ValidateRequestAsync(context);
            }
            catch (AntiforgeryValidationException)
            {
                return ApiResults.Failure(new("csrf.invalid", ErrorKind.Forbidden));
            }
            finally
            {
                context.User = principal;
            }

            return await next(invocation);
        });
        return group;
    }
}
