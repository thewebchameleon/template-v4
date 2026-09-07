using System.Security.Cryptography.X509Certificates;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using TemplateV4.Application;
using TemplateV4.Application.Platform;
using TemplateV4.Application.Users;
using TemplateV4.Infrastructure.Persistence;
using TemplateV4.Infrastructure.Security;
using TemplateV4.Infrastructure.Storage;
using TemplateV4.Infrastructure.Users;

namespace TemplateV4.Infrastructure;

public static class Registration
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration config, IHostEnvironment environment)
    {
        if (config is IConfigurationBuilder configurationBuilder) configurationBuilder.AddKeyPerFile("/run/secrets", optional: true);
        if (config is IConfigurationBuilder templates && Directory.Exists(Path.Combine(AppContext.BaseDirectory, "EmailTemplates")))
            foreach (var file in Directory.GetFiles(Path.Combine(AppContext.BaseDirectory, "EmailTemplates"), "*.json").Order()) templates.AddJsonFile(file, optional: false);
        services.AddSingleton(TimeProvider.System);
        services.AddHttpContextAccessor();
        var cultures = new CultureCatalog(config["Localisation:DefaultCulture"] ?? "en-ZA", (config.GetSection("Localisation:SupportedCultures").Get<string[]>() ?? ["en-ZA", "af-ZA"]).ToHashSet());
        if (!cultures.Supported.Contains(cultures.DefaultCulture) || cultures.Supported.Any(culture => !CultureCatalog.Examples.Supported.Contains(culture)))
            throw new InvalidOperationException("Configure supported localisation resources before enabling a culture.");
        services.AddSingleton(cultures);
        services.AddDbContext<FrameworkDb>(options =>
        {
            options.UseNpgsql(config.GetConnectionString("app") ?? throw new InvalidOperationException("ConnectionStrings:app is required."),
                postgres => postgres.MigrationsHistoryTable("migrations", "app"));
            if (environment.IsDevelopment()) options.EnableDetailedErrors();
            // Never enable sensitive-data logging, even in development.
        });
        var protection = services.AddDataProtection().SetApplicationName("templatev4")
            .PersistKeysToFileSystem(new DirectoryInfo(config["DataProtection:KeyPath"] ?? throw new InvalidOperationException("DataProtection:KeyPath is required.")));
        if (!environment.IsDevelopment() && !environment.IsEnvironment("Testing"))
        {
            var certificate = X509CertificateLoader.LoadPkcs12FromFile(config["DataProtection:CertificatePath"] ?? throw new InvalidOperationException("A Data Protection wrapping certificate is required in production."), config["DataProtection:CertificatePassword"]);
            protection.ProtectKeysWithCertificate(certificate);
        }
        services.AddIdentityCore<AppUser>(options =>
        {
            options.User.RequireUniqueEmail = true;
            options.Password.RequiredLength = 8;
            options.Lockout.MaxFailedAccessAttempts = 5;
            options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(15);
            options.SignIn.RequireConfirmedEmail = true;
        }).AddRoles<IdentityRole<Guid>>().AddEntityFrameworkStores<FrameworkDb>().AddDefaultTokenProviders();
        services.Configure<DataProtectionTokenProviderOptions>(options => options.TokenLifespan = TimeSpan.FromHours(2));
        services.AddSingleton<SigningKeys>();
        services.AddSingleton<AdminBootstrapToken>();
        services.AddScoped<AdminBootstrapService>();
        services.AddScoped<RegistrationService>();
        services.AddScoped<AuthService>(); services.AddScoped<AccountService>(); services.AddScoped<AccessManagementService>();
        services.AddScoped<SecurityService>(); services.AddScoped<PasskeyService>();
        services.AddScoped<SharedRateLimiter>();
        services.AddScoped<OperationsService>();
        services.AddScoped<IAuditHistory, AuditHistory>();
        services.AddScoped<IHandler<AuditQuery, Page<AuditItem>>, AuditQueryHandler>();
        services.AddSingleton<IValidator<AuditQuery>, AuditQueryValidator>();
        services.AddScoped<NotificationService>();
        services.AddScoped<FileService>();
        services.AddScoped<PrivacyService>();
        services.AddScoped<IPasskeyHandler<AppUser>, PasskeyHandler<AppUser>>();
        services.Configure<IdentityPasskeyOptions>(options =>
        {
            options.ServerDomain = new Uri(config["Web:PublicUrl"] ?? "https://localhost").Host;
            options.UserVerificationRequirement = "required";
        });
        services.AddScoped<IUserDirectory, UserDirectory>(); services.AddScoped<IUnitOfWork, UnitOfWork>(); services.AddScoped<IEventOutbox, EventOutbox>();
        services.AddScoped<IDomainEventHandler, UserProvisionedHandler>();
        services.AddSingleton(new IntegrationContracts().Register<UserCreated>("users.created.v1").Register<EmailRequest>("email.requested.v1").Register<JobRequested>("maintenance.requested.v1"));
        services.AddScoped(typeof(Dispatcher<,>));
        services.AddScoped<IHandler<CreateUser, UserDto>, CreateUserHandler>();
        services.AddScoped<IHandler<ListUsers, Page<UserDto>>, ListUsersHandler>();
        services.AddScoped<IHandler<UpdateUser, UserDto>, UpdateUserHandler>();
        services.AddScoped<IHandler<TriggerMaintenance, Guid>, TriggerMaintenanceHandler>();
        services.AddSingleton<IValidator<CreateUser>, CreateUserValidator>();
        services.AddSingleton<IValidator<ListUsers>, ListUsersValidator>();
        services.AddSingleton<IValidator<UpdateUser>, UpdateUserValidator>();
        services.AddSingleton<IFeatureFlags, ConfigurationFlags>();
        if (config["Storage:Provider"] == "S3") services.AddSingleton<IFileStorage, S3FileStorage>();
        else if (config["Storage:Provider"] is null or "Local") services.AddSingleton<IFileStorage, LocalFileStorage>();
        else throw new InvalidOperationException("Unknown Storage:Provider.");
        services.AddScoped<IEmailSender, SmtpEmailSender>();
        if (config["Integrations:Status:BaseUrl"] is { Length: > 0 } endpoint)
        {
            var address = new Uri(endpoint, UriKind.Absolute);
            if (address.Scheme != Uri.UriSchemeHttps && !environment.IsDevelopment()) throw new InvalidOperationException("External integrations require HTTPS.");
            services.AddHttpClient<ExternalStatusClient>(http => { http.BaseAddress = address; http.Timeout = TimeSpan.FromSeconds(15); });
        }
        return services;
    }
}

public sealed class BackgroundExecutionContext : IExecutionContext
{
    public Guid? ActorId { get; set; }
    public IReadOnlySet<string> Permissions { get; set; } = new HashSet<string>();
    public string Culture { get; set; } = "en-ZA";
    public string? TenantId { get; set; }
    public string? TraceParent { get; set; }
}
public sealed class ConfigurationFlags(IConfiguration configuration, IHostEnvironment environment) : IFeatureFlags
{
    public bool Enabled(string feature, IExecutionContext context)
    {
        var section = configuration.GetSection($"Features:{feature}");
        if (context.TenantId is not null && bool.TryParse(section[$"Tenants:{context.TenantId}"], out var tenant)) return tenant;
        if (context.ActorId is not null && bool.TryParse(section[$"Users:{context.ActorId}"], out var user)) return user;
        if (bool.TryParse(section[$"Environments:{environment.EnvironmentName}"], out var env)) return env;
        return section.GetValue<bool>("Enabled");
    }
}
public sealed class LocalFileStorage(IConfiguration config) : IFileStorage
{
    private readonly string _root = Path.GetFullPath(config["Storage:Path"] ?? ".local/storage");
    private string Resolve(string key)
    {
        if (string.IsNullOrWhiteSpace(key) || key.Any(c => !char.IsAsciiLetterOrDigit(c) && c is not ('-' or '_' or '.')) || key is "." or "..")
            throw new ArgumentException("Storage keys must be flat, opaque names.", nameof(key));
        Directory.CreateDirectory(_root);
        var path = Path.Combine(_root, key);
        if (File.Exists(path) && File.GetAttributes(path).HasFlag(FileAttributes.ReparsePoint)) throw new IOException("Symbolic links are not storage objects.");
        return path;
    }
    public async Task Write(string key, Stream content, CancellationToken cancellationToken)
    {
        await using var stream = new FileStream(Resolve(key), FileMode.CreateNew, FileAccess.Write, FileShare.None, 81920, true);
        await content.CopyToAsync(stream, cancellationToken);
    }
    public Task<Stream> Read(string key, CancellationToken cancellationToken) => Task.FromResult<Stream>(File.OpenRead(Resolve(key)));
    public Task Delete(string key, CancellationToken cancellationToken) { File.Delete(Resolve(key)); return Task.CompletedTask; }
}
