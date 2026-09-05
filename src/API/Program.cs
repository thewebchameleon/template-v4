using System.Globalization;
using System.Security.Claims;
using System.Threading.RateLimiting;
using Microsoft.AspNetCore.Antiforgery;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Localization;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using templatev4.API;
using templatev4.Application;
using templatev4.Application.Users;
using templatev4.Infrastructure;
using templatev4.Infrastructure.Persistence;
using templatev4.Infrastructure.Security;
using templatev4.ServiceDefaults;

if (await Hosting.HandleHealthProbe(args)) return;
var builder = WebApplication.CreateBuilder(args);
builder.AddServiceDefaults();
builder.WebHost.ConfigureKestrel(options => options.Limits.MaxRequestBodySize = 1_048_576);
builder.Services.AddInfrastructure(builder.Configuration, builder.Environment);
builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<IExecutionContext, HttpExecutionContext>();
builder.Services.AddProblemDetails(options => options.CustomizeProblemDetails = context =>
{
    context.ProblemDetails.Extensions.TryAdd("code", "http." + context.ProblemDetails.Status);
    context.ProblemDetails.Extensions.TryAdd("traceId", System.Diagnostics.Activity.Current?.TraceId.ToString() ?? context.HttpContext.TraceIdentifier);
});
builder.Services.AddOpenApi(options => options.AddDocumentTransformer<JwtOpenApi>());
builder.Services.ConfigureHttpJsonOptions(options => options.SerializerOptions.NumberHandling = System.Text.Json.Serialization.JsonNumberHandling.Strict);
builder.Services.AddOutputCache();
builder.Services.AddAntiforgery(options =>
{
    options.HeaderName = "X-CSRF-TOKEN";
    options.Cookie.Name = "__Host-templatev4-csrf";
    options.Cookie.SecurePolicy = CookieSecurePolicy.Always;
    options.Cookie.SameSite = SameSiteMode.Strict;
});
var origins = builder.Configuration.GetSection("Web:AllowedOrigins").Get<string[]>() ?? [];
builder.Services.AddCors(options => options.AddDefaultPolicy(policy => policy.WithOrigins(origins).WithMethods("GET", "POST", "PUT", "DELETE").WithHeaders("Content-Type", "Authorization", "X-CSRF-TOKEN", "Idempotency-Key").AllowCredentials()));
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme).AddJwtBearer();
builder.Services.AddOptions<JwtBearerOptions>(JwtBearerDefaults.AuthenticationScheme).Configure<SigningKeys>((options, keys) =>
{
    options.MapInboundClaims = false;
    options.TokenValidationParameters = new()
    {
        ValidateIssuer = true,
        ValidIssuer = builder.Configuration["Jwt:Issuer"] ?? "templatev4",
        ValidateAudience = true,
        ValidAudience = builder.Configuration["Jwt:Audience"] ?? "templatev4-web",
        ValidateLifetime = true,
        ClockSkew = TimeSpan.FromSeconds(15),
        ValidateIssuerSigningKey = true,
        IssuerSigningKeys = keys.ValidationKeys,
        ValidAlgorithms = [SecurityAlgorithms.RsaSha256],
        NameClaimType = "sub",
        RoleClaimType = "role"
    };
    options.Events = new()
    {
        OnTokenValidated = async context =>
    {
        if (!await context.HttpContext.RequestServices.GetRequiredService<AuthService>().Validate(context.Principal!, context.HttpContext.RequestAborted)) context.Fail("Session revoked.");
    }
    };
});
builder.Services.AddAuthorization(options =>
{
    foreach (var permission in Permissions.All) options.AddPolicy(permission, policy => policy.RequireClaim("permission", permission));
});
builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = 429;
    options.AddPolicy("auth", context => RateLimitPartition.GetFixedWindowLimiter(context.User.FindFirstValue("sub") ?? context.Connection.RemoteIpAddress?.ToString() ?? "unknown", _ => new() { PermitLimit = 120, Window = TimeSpan.FromMinutes(1), QueueLimit = 0 }));
    options.AddPolicy("api", context => RateLimitPartition.GetTokenBucketLimiter(context.User.FindFirstValue("sub") ?? context.Connection.RemoteIpAddress?.ToString() ?? "unknown", _ => new() { TokenLimit = 120, TokensPerPeriod = 60, ReplenishmentPeriod = TimeSpan.FromMinutes(1), AutoReplenishment = true, QueueLimit = 0 }));
});
builder.Services.AddHealthChecks().AddCheck<DatabaseHealthCheck>("postgresql", tags: ["ready"]);
var app = builder.Build();
await using (var bootstrapScope = app.Services.CreateAsyncScope())
{
    var bootstrap = bootstrapScope.ServiceProvider.GetRequiredService<AdminBootstrapService>();
    if (await bootstrap.Initialize(CancellationToken.None)) app.Services.GetRequiredService<AdminBootstrapToken>().Enable();
}
if (builder.Configuration["ReverseProxy:Address"] is { Length: > 0 } proxy)
{
    var forwarded = new Microsoft.AspNetCore.Builder.ForwardedHeadersOptions
    {
        ForwardedHeaders = Microsoft.AspNetCore.HttpOverrides.ForwardedHeaders.XForwardedFor | Microsoft.AspNetCore.HttpOverrides.ForwardedHeaders.XForwardedProto,
        ForwardLimit = 1
    };
    forwarded.KnownProxies.Add(System.Net.IPAddress.Parse(proxy));
    app.UseForwardedHeaders(forwarded);
}
app.UseExceptionHandler(); app.UseStatusCodePages();
if (!app.Environment.IsDevelopment()) app.UseHsts();
app.UseWhen(context => !context.Request.Path.StartsWithSegments("/health"), branch => branch.UseHttpsRedirection());
app.Use(async (context, next) =>
{
    context.Response.Headers["X-Content-Type-Options"] = "nosniff";
    context.Response.Headers["Referrer-Policy"] = "no-referrer";
    context.Response.Headers["Content-Security-Policy"] = app.Environment.IsDevelopment() && context.Request.Path.StartsWithSegments("/swagger")
        ? "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; frame-ancestors 'none'"
        : "default-src 'none'; frame-ancestors 'none'";
    context.Response.Headers.CacheControl = "no-store";
    await next();
});
app.UseCors(); app.UseAuthentication();
app.Use(async (context, next) =>
{
    if (context.User.HasClaim("setup_only", "true") && context.Request.Path.Value is not ("/api/v1/auth/profile" or "/api/v1/auth/csrf" or "/api/v1/auth/logout" or "/api/v1/auth/refresh" or "/api/v1/auth/mfa/enroll" or "/api/v1/auth/mfa/confirm" or "/api/v1/auth/passkeys/register-options" or "/api/v1/auth/passkeys/register"))
    { await ApiResults.Failure(new("auth.mfa_setup_required", ErrorKind.Forbidden)).ExecuteAsync(context); return; }
    await next();
});
var cultures = app.Services.GetRequiredService<CultureCatalog>();
app.UseRequestLocalization(new RequestLocalizationOptions
{
    DefaultRequestCulture = new(cultures.DefaultCulture),
    SupportedCultures = cultures.Supported.Select(culture => new CultureInfo(culture)).ToList(),
    SupportedUICultures = cultures.Supported.Select(culture => new CultureInfo(culture)).ToList(),
    RequestCultureProviders = [new CustomRequestCultureProvider(async context =>
    {
        if (!Guid.TryParse(context.User.FindFirstValue("sub"), out var id)) return null;
        var culture = await context.RequestServices.GetRequiredService<FrameworkDb>().Profiles.Where(x => x.Id == id).Select(x => x.Culture).SingleOrDefaultAsync(context.RequestAborted);
        return culture is null ? null : new ProviderCultureResult(culture);
    }), new AcceptLanguageHeaderRequestCultureProvider()]
});
app.UseAuthorization(); app.UseRateLimiter(); app.UseOutputCache();
app.MapDefaultEndpoints();
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.UseSwaggerUI(options => options.SwaggerEndpoint("/openapi/v1.json", "templatev4 v1"));
}
const string refreshCookie = "__Host-templatev4-refresh";
CookieOptions Cookie() => new() { HttpOnly = true, Secure = true, SameSite = SameSiteMode.Strict, Path = "/", MaxAge = TimeSpan.FromDays(30), IsEssential = true };
IResult Tokens(Result<AuthTokens> result, HttpResponse response)
{
    if (!result.IsSuccess) { response.Cookies.Delete(refreshCookie, Cookie()); return ApiResults.Failure(result.Error!); }
    if (result.Value!.RefreshToken.Length > 0) response.Cookies.Append(refreshCookie, result.Value.RefreshToken, Cookie());
    return Results.Ok(result.Value.Access);
}
var auth = app.MapGroup("/api/v1/auth").WithTags("Framework").RequireRateLimiting("auth");
auth.MapGet("/csrf", (HttpContext context, IAntiforgery antiforgery) =>
{
    var principal = context.User;
    try { context.User = new ClaimsPrincipal(new ClaimsIdentity()); return Results.Ok(new { token = antiforgery.GetAndStoreTokens(context).RequestToken }); }
    finally { context.User = principal; }
}).WithName("GetCsrfToken");
auth.AddEndpointFilter(async (invocation, next) =>
{
    var context = invocation.HttpContext;
    var limiter = context.RequestServices.GetRequiredService<SharedRateLimiter>();
    var credential = context.Request.Path.Value is "/api/v1/auth/login" or "/api/v1/auth/mfa/login" or "/api/v1/auth/passkeys/login" or "/api/v1/auth/passkeys/options" or "/api/v1/auth/forgot-password" or "/api/v1/auth/register";
    var subject = credential ? context.Connection.RemoteIpAddress?.ToString() ?? "unknown" : context.User.FindFirstValue("sub") ?? context.Connection.RemoteIpAddress?.ToString() ?? "unknown";
    if (!await limiter.Allow(credential ? "credentials" : "session", subject, credential ? 20 : 120, TimeSpan.FromMinutes(1), context.RequestAborted))
    { context.Response.Headers.RetryAfter = "60"; return Results.StatusCode(429); }
    if (HttpMethods.IsGet(context.Request.Method)) return await next(invocation);
    var origin = context.Request.Headers.Origin.ToString();
    var ownOrigin = $"{context.Request.Scheme}://{context.Request.Host}";
    if (origin.Length == 0 || (origin != ownOrigin && !origins.Contains(origin, StringComparer.Ordinal))) return ApiResults.Failure(new("csrf.origin_denied", ErrorKind.Forbidden));
    var principal = context.User;
    try { context.User = new ClaimsPrincipal(new ClaimsIdentity()); await context.RequestServices.GetRequiredService<IAntiforgery>().ValidateRequestAsync(context); }
    catch (AntiforgeryValidationException) { return ApiResults.Failure(new("csrf.invalid", ErrorKind.Forbidden)); }
    finally { context.User = principal; }
    return await next(invocation);
});
auth.MapGet("/registration", async (RegistrationService service, CancellationToken ct) => await service.Settings(ct)).WithName("GetRegistrationSettings").Produces<RegistrationSettings>();
auth.MapPost("/register", async (RegistrationRequest request, RegistrationService service, CancellationToken ct) =>
{
    var result = await service.Register(request, ct);
    return result.IsSuccess ? Results.Accepted() : ApiResults.Failure(result.Error!);
}).WithName("RegisterAccount").Produces(StatusCodes.Status202Accepted);
auth.MapPost("/login", async (LoginRequest request, AuthService service, HttpContext context, CancellationToken ct) => Tokens(await service.Login(request, ct), context.Response)).WithName("Login").Produces<AccessResponse>();
auth.MapPost("/refresh", async (AuthService service, HttpContext context, CancellationToken ct) => Tokens(await service.Refresh(context.Request.Cookies[refreshCookie], ct), context.Response)).WithName("Refresh").Produces<AccessResponse>();
auth.MapPost("/logout", async (AuthService service, HttpContext context, CancellationToken ct) =>
{
    await service.Logout(context.Request.Cookies[refreshCookie], ct); context.Response.Cookies.Delete(refreshCookie, Cookie()); return Results.NoContent();
}).WithName("Logout");
auth.MapGet("/sessions", async (FrameworkDb db, ClaimsPrincipal principal, CancellationToken ct) =>
{
    var id = Guid.Parse(principal.FindFirstValue("sub")!); var current = Guid.Parse(principal.FindFirstValue("sid")!);
    return await db.Sessions.Where(x => x.UserId == id && x.RevokedAt == null && x.ExpiresAt > DateTimeOffset.UtcNow).Select(x => new SessionDto(x.Id, x.Device, x.CreatedAt, x.ExpiresAt, x.Id == current)).ToArrayAsync(ct);
}).RequireAuthorization().WithName("ListSessions");
auth.MapDelete("/sessions/{id:guid}", async (Guid id, AuthService service, ClaimsPrincipal principal, CancellationToken ct) =>
{ await service.Revoke(Guid.Parse(principal.FindFirstValue("sub")!), id, ct); return Results.NoContent(); }).RequireAuthorization().WithName("RevokeSession");
auth.MapPost("/forgot-password", async (ForgotPasswordRequest request, AccountService service, CancellationToken ct) => { await service.Forgot(request, ct); return Results.Accepted(); }).WithName("ForgotPassword");
auth.MapPost("/confirm-email", async (ConfirmEmailRequest request, AccountService service, CancellationToken ct) => (await service.Confirm(request, ct)).ToHttp()).WithName("ConfirmEmail");
auth.MapPost("/reset-password", async (ResetPasswordRequest request, AccountService service, CancellationToken ct) => (await service.Reset(request, ct)).ToHttp()).WithName("ResetPassword");
auth.MapPost("/culture", async (CultureRequest request, FrameworkDb db, ClaimsPrincipal principal, CancellationToken ct) =>
{
    if (!cultures.Supported.Contains(request.Culture)) return ApiResults.Failure(new("culture.unsupported", ErrorKind.Validation));
    var id = Guid.Parse(principal.FindFirstValue("sub")!);
    var profile = await db.Profiles.SingleAsync(x => x.Id == id, ct);
    profile.SetCulture(request.Culture); await db.SaveChangesAsync(ct); return Results.NoContent();
}).RequireAuthorization().WithName("SetCulture");
var api = app.MapGroup("/api/v1").WithTags("Framework").RequireAuthorization().RequireRateLimiting("api");
var bootstrapEndpoints = app.MapGroup("/api/v1/bootstrap").WithTags("Framework").RequireRateLimiting("auth");
bootstrapEndpoints.AddEndpointFilter(async (invocation, next) =>
{
    var context = invocation.HttpContext;
    var limiter = context.RequestServices.GetRequiredService<SharedRateLimiter>();
    var subject = context.Connection.RemoteIpAddress?.ToString() ?? "unknown";
    if (!await limiter.Allow("credentials", subject, 20, TimeSpan.FromMinutes(1), context.RequestAborted))
    { context.Response.Headers.RetryAfter = "60"; return Results.StatusCode(429); }
    if (HttpMethods.IsGet(context.Request.Method)) return await next(invocation);
    var origin = context.Request.Headers.Origin.ToString();
    var ownOrigin = $"{context.Request.Scheme}://{context.Request.Host}";
    if (origin.Length == 0 || (origin != ownOrigin && !origins.Contains(origin, StringComparer.Ordinal))) return ApiResults.Failure(new("csrf.origin_denied", ErrorKind.Forbidden));
    var principal = context.User;
    try { context.User = new ClaimsPrincipal(new ClaimsIdentity()); await context.RequestServices.GetRequiredService<IAntiforgery>().ValidateRequestAsync(context); }
    catch (AntiforgeryValidationException) { return ApiResults.Failure(new("csrf.invalid", ErrorKind.Forbidden)); }
    finally { context.User = principal; }
    return await next(invocation);
});
bootstrapEndpoints.MapGet("/status", async (AdminBootstrapService service, CancellationToken ct) => Results.Ok(new AdminBootstrapStatus(await service.Available(ct)))).WithName("GetAdminBootstrapStatus").Produces<AdminBootstrapStatus>();
bootstrapEndpoints.MapPost("", async (AdminBootstrapRequest request, AdminBootstrapService service, CancellationToken ct) =>
{
    var result = await service.Create(request, ct);
    return result.IsSuccess ? Results.NoContent() : ApiResults.Failure(result.Error!);
}).WithName("CreateBootstrapAdministrator").Produces(StatusCodes.Status204NoContent);
Guid Actor(ClaimsPrincipal principal) => Guid.Parse(principal.FindFirstValue("sub")!);
Guid SessionId(ClaimsPrincipal principal) => Guid.Parse(principal.FindFirstValue("sid")!);
auth.MapPost("/mfa/login", async (MfaLoginRequest request, AuthService service, HttpContext http, CancellationToken ct) => Tokens(await service.CompleteMfa(request, ct), http.Response)).WithName("CompleteMfa").Produces<AccessResponse>();
auth.MapGet("/profile", async (SecurityService service, ClaimsPrincipal principal, CancellationToken ct) => await service.Profile(Actor(principal), ct)).RequireAuthorization().WithName("GetProfile");
auth.MapPost("/mfa/enroll", async (SecurityProof request, SecurityService service, ClaimsPrincipal principal, CancellationToken ct) => (await service.BeginEnrollment(Actor(principal), SessionId(principal), request, ct)).ToHttp()).RequireAuthorization().WithName("BeginMfaEnrollment").Produces<MfaEnrollment>();
auth.MapPost("/mfa/confirm", async (MfaConfirmation request, SecurityService service, ClaimsPrincipal principal, CancellationToken ct) => (await service.ConfirmEnrollment(Actor(principal), SessionId(principal), request.Code, ct)).ToHttp()).RequireAuthorization().WithName("ConfirmMfaEnrollment").Produces<string[]>();
auth.MapPost("/mfa/disable", async (SecurityProof request, SecurityService service, ClaimsPrincipal principal, CancellationToken ct) => (await service.ManageMfa(Actor(principal), SessionId(principal), request, true, ct)).ToHttp()).RequireAuthorization().WithName("DisableMfa").Produces<string[]>();
auth.MapPost("/mfa/recovery", async (SecurityProof request, SecurityService service, ClaimsPrincipal principal, CancellationToken ct) => (await service.ManageMfa(Actor(principal), SessionId(principal), request, false, ct)).ToHttp()).RequireAuthorization().WithName("RotateRecoveryCodes").Produces<string[]>();
auth.MapPost("/passkeys/options", async (PasskeyService service, HttpContext http, CancellationToken ct) => await service.LoginOptions(http, ct)).WithName("PasskeyLoginOptions");
auth.MapPost("/passkeys/login", async (PasskeyCredential request, PasskeyService service, HttpContext http, CancellationToken ct) => Tokens(await service.Login(request, http, ct), http.Response)).WithName("PasskeyLogin").Produces<AccessResponse>();
auth.MapPost("/passkeys/register-options", async (SecurityProof request, PasskeyService service, HttpContext http, CancellationToken ct) => (await service.RegistrationOptions(Actor(http.User), request, http, ct)).ToHttp()).RequireAuthorization().WithName("PasskeyRegistrationOptions").Produces<PasskeyOptions>();
auth.MapPost("/passkeys/register", async (PasskeyCredential request, PasskeyService service, HttpContext http, CancellationToken ct) => (await service.Register(Actor(http.User), SessionId(http.User), request, http, ct)).ToHttp()).RequireAuthorization().WithName("RegisterPasskey");
auth.MapPost("/passkeys/remove", async (RemovePasskeyRequest request, PasskeyService service, ClaimsPrincipal principal, CancellationToken ct) => (await service.Remove(Actor(principal), SessionId(principal), request, ct)).ToHttp()).RequireAuthorization().WithName("RemovePasskey");
auth.MapGet("/settings/security", async (SecurityService service, CancellationToken ct) => await service.Settings(ct)).RequireAuthorization(Permissions.Settings).WithName("GetSecuritySettings");
auth.MapGet("/operations", async (OperationsService service, CancellationToken ct) => await service.List(ct)).RequireAuthorization(Permissions.Settings).WithName("GetDeliveryOperations");
auth.MapPost("/operations/replay", async (ReplayRequest request, OperationsService service, ClaimsPrincipal principal, CancellationToken ct) => (await service.Replay(Actor(principal), request, ct)).ToHttp()).RequireAuthorization(Permissions.Settings).WithName("ReplayDelivery");
auth.MapPost("/invitations", async (InvitationRequest request, AccountService service, ClaimsPrincipal principal, CancellationToken ct) => (await service.Invitation(Actor(principal), request, ct)).ToHttp()).RequireAuthorization(Permissions.Manage).WithName("ManageInvitation");
auth.MapPost("/settings/security", async (SecurityPolicyRequest request, SecurityService service, ClaimsPrincipal principal, CancellationToken ct) => (await service.SetPolicy(Actor(principal), request, ct)).ToHttp()).RequireAuthorization(Permissions.Settings).WithName("SetSecuritySettings").Produces<SecuritySettings>();
api.MapGet("/users", async (Dispatcher<ListUsers, Page<UserDto>> dispatcher, CancellationToken ct, int pageNumber = 1, int pageSize = 25, string? search = null, string sort = "name") =>
    (await dispatcher.Send(new(pageNumber, pageSize, search, sort), ct)).ToHttp()).RequireAuthorization(Permissions.Read).WithName("ListUsers").Produces<Page<UserDto>>();
api.MapPost("/users", async (CreateUser request, Dispatcher<CreateUser, UserDto> dispatcher, HttpContext context, CancellationToken ct) =>
    (await dispatcher.Send(request with { IdempotencyKey = context.Request.Headers["Idempotency-Key"].FirstOrDefault() }, ct)).ToHttp()).RequireAuthorization(Permissions.Manage).WithName("CreateUser").Produces<UserDto>();
api.MapPut("/users/{id:guid}", async (Guid id, UpdateUser request, Dispatcher<UpdateUser, UserDto> dispatcher, CancellationToken ct) =>
    (await dispatcher.Send(request with { Id = id }, ct)).ToHttp()).RequireAuthorization(Permissions.Manage).WithName("UpdateUser").Produces<UserDto>();
api.MapPost("/jobs/maintenance", async (Dispatcher<TriggerMaintenance, Guid> dispatcher, IFeatureFlags flags, IExecutionContext execution, HttpContext context, CancellationToken ct) =>
    !flags.Enabled("maintenance", execution) ? Results.NotFound() : (await dispatcher.Send(new(context.Request.Headers["Idempotency-Key"].FirstOrDefault()), ct)).ToHttp()).RequireAuthorization(Permissions.Jobs).WithName("TriggerMaintenance");
api.MapGet("/features", (IFeatureFlags flags, IExecutionContext context) => Results.Ok(new { maintenance = flags.Enabled("maintenance", context) })).WithName("GetFeatures");
app.Run();
public partial class Program;
