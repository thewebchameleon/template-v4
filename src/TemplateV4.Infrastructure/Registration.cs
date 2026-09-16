using System.Security.Cryptography.X509Certificates;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using TemplateV4.Application;
using TemplateV4.Application.Modules;
using TemplateV4.Application.Users;
using TemplateV4.Infrastructure.Modules;
using TemplateV4.Infrastructure.Persistence;
using TemplateV4.Infrastructure.Security;
using TemplateV4.Infrastructure.Storage;

namespace TemplateV4.Infrastructure;

public static partial class Registration
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration config, IHostEnvironment environment, IEnumerable<ModuleDefinition>? modules = null)
    {
        if (config is IConfigurationBuilder configurationBuilder) configurationBuilder.AddKeyPerFile("/run/secrets", optional: true);
        if (config is IConfigurationBuilder templates && Directory.Exists(Path.Combine(AppContext.BaseDirectory, "EmailTemplates")))
            foreach (var file in Directory.GetFiles(Path.Combine(AppContext.BaseDirectory, "EmailTemplates"), "*.json").Order()) templates.AddJsonFile(file, optional: false);
        services.AddSingleton(TimeProvider.System);
        AddUpdates(services);
        AddLicensing(services);
        AddOrganisations(services, config);
        AddBilling(services);
        AddCrm(services);
        AddInvoicing(services);
        AddCms(services);
        AddWebsite(services);
        AddOperations(services);
        AddAuditHistory(services);
        AddSupport(services);
        AddNotifications(services);
        AddActionItems(services);
        AddFileStorage(services);
        AddModules(services);
        AddConfiguration(services);
        AddUsers(services);
        services.AddScoped<DemoPasswordVerifier>();
        services.AddSingleton(ModuleConfiguration.Load(config, modules));
        services.AddHttpContextAccessor();
        var cultures = new CultureCatalog(config["Localisation:DefaultCulture"] ?? "en-ZA", (config.GetSection("Localisation:SupportedCultures").Get<string[]>() ?? ["en-ZA", "af-ZA"]).ToHashSet());
        if (!cultures.Supported.Contains(cultures.DefaultCulture) || cultures.Supported.Any(culture => !CultureCatalog.Examples.Supported.Contains(culture)))
            throw new InvalidOperationException("Configure supported localisation resources before enabling a culture.");
        services.AddSingleton(cultures);
        services.AddScoped<AuditCapture>();
        services.AddDbContext<FrameworkDb>((provider, options) =>
        {
            options.AddInterceptors(provider.GetRequiredService<AuditCapture>());
            options.UseNpgsql(config.GetConnectionString("app") ?? throw new InvalidOperationException("ConnectionStrings:app is required."),
                postgres => postgres.MigrationsHistoryTable("migrations", "app"));
            if (environment.IsDevelopment()) options.EnableDetailedErrors();
            // Never enable sensitive-data logging, even in development.
        });
        var protection = services.AddDataProtection().SetApplicationName("templatev4")
            .PersistKeysToFileSystem(new DirectoryInfo(config["DataProtection:KeyPath"] ?? throw new InvalidOperationException("DataProtection:KeyPath is required.")));
        if (!environment.IsDevelopment() && !environment.IsEnvironment("Testing"))
        {
            if (config["DataProtection:CertificateBase64"] is { Length: > 0 } encoded)
                protection.ProtectKeysWithCertificate(X509CertificateLoader.LoadPkcs12(Convert.FromBase64String(encoded), config["DataProtection:CertificatePassword"]));
            else if (config["DataProtection:CertificatePath"] is { Length: > 0 } path)
                protection.ProtectKeysWithCertificate(X509CertificateLoader.LoadPkcs12FromFile(path, config["DataProtection:CertificatePassword"]));
            else if (!config.GetValue<bool>("DataProtection:AllowUnencryptedKeys"))
                throw new InvalidOperationException("A Data Protection wrapping certificate is required in production unless DataProtection:AllowUnencryptedKeys is explicitly enabled.");
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
        services.AddScoped<RegistrationReviewService>();
        services.AddScoped<PrivacyService>();
        services.AddScoped<IPasskeyHandler<AppUser>, PasskeyHandler<AppUser>>();
        services.Configure<IdentityPasskeyOptions>(options =>
        {
            options.ServerDomain = new Uri(config["Web:PublicUrl"] ?? "https://localhost").Host;
            options.UserVerificationRequirement = "required";
        });
        services.AddScoped<IUnitOfWork, UnitOfWork>(); services.AddScoped<IEventOutbox, EventOutbox>();
        services.AddSingleton(new IntegrationContracts().Register<UserCreated>("users.created.v1").Register<EmailRequest>("email.requested.v1").Register<JobRequested>("maintenance.requested.v1").Register<TemplateV4.Application.Contact.ContactNotification>("contact.notification.v1"));
        services.AddScoped(typeof(Dispatcher<,>));
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
