using System.Globalization;
using System.Security.Claims;
using System.Threading.RateLimiting;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Localization;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using TemplateV4.ApiService;
using TemplateV4.ApiService.Endpoints;
using TemplateV4.Application;
using TemplateV4.Application.Users;
using TemplateV4.Infrastructure;
using TemplateV4.Infrastructure.Persistence;
using TemplateV4.Infrastructure.Security;
using TemplateV4.ServiceDefaults;

if (await Hosting.HandleHealthProbe(args)) return;
var builder = WebApplication.CreateBuilder(args);
var exportPath = builder.Configuration["OpenApi:ExportPath"];
if (exportPath is not null && !builder.Environment.IsDevelopment()) throw new InvalidOperationException("OpenAPI export is development-only.");
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
builder.Services.AddOpenApi(options =>
{
    options.AddDocumentTransformer<JwtOpenApi>();
    options.AddOperationTransformer<JwtOperationOpenApi>();
});
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
if (exportPath is null)
{
    await using var bootstrapScope = app.Services.CreateAsyncScope();
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
    if (context.User.HasClaim("setup_only", "true") && context.Request.Path.Value is not ("/api/v1/auth/profile" or "/api/v1/auth/culture" or "/api/v1/auth/csrf" or "/api/v1/auth/logout" or "/api/v1/auth/refresh" or "/api/v1/auth/mfa/enroll" or "/api/v1/auth/mfa/confirm" or "/api/v1/auth/passkeys/register-options" or "/api/v1/auth/passkeys/register"))
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
app.MapApiEndpoints(origins);
if (exportPath is not null)
{
    await app.StartAsync();
    using var client = new HttpClient();
    var document = await client.GetStringAsync(app.Urls.First() + "/openapi/v1.json");
    await File.WriteAllTextAsync(Path.GetFullPath(exportPath), document.Replace(app.Urls.First() + "/", "https://localhost/", StringComparison.Ordinal).Replace("\r\n", "\n") + "\n");
    await app.StopAsync();
    return;
}
app.Run();
public partial class Program;
