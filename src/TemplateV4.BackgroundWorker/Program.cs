using Quartz;
using TemplateV4.Application;
using TemplateV4.Application.Modules;
using TemplateV4.BackgroundWorker;
using TemplateV4.Infrastructure;
using TemplateV4.Infrastructure.Modules;
using TemplateV4.ServiceDefaults;

if (await Hosting.HandleHealthProbe(args)) return;
var builder = WebApplication.CreateBuilder(args);
TemplateV4.Host.BusinessModules.ConfigureClient(builder);
builder.AddServiceDefaults();
var modules = TemplateV4.Host.BusinessModules.Descriptors;
builder.Services.AddInfrastructure(builder.Configuration, builder.Environment, modules);
TemplateV4.Host.BusinessModules.Configure(builder);
builder.Services.AddScoped<BackgroundExecutionContext>();
builder.Services.AddScoped<IExecutionContext>(provider => provider.GetRequiredService<BackgroundExecutionContext>());
builder.Services.AddScoped<IIntegrationTransport, LocalTransport>();
builder.Services.AddHostedService<OutboxPump>();
builder.Services.AddHostedService<JobReconciler>();
builder.Services.AddHostedService<StorageRetention>();
builder.Services.AddHostedService<CommercialBillingReconciler>();
builder.Services.AddHostedService<DeliveryMetrics>();
builder.Services.AddHostedService<UpdateChecker>();
builder.Services.AddQuartz(options =>
{
    options.ConfigureScheduler(scheduler =>
    {
        scheduler.InstanceId = "AUTO";
        scheduler.InstanceName = "templatev4-worker";
    });
    options.UsePersistentStore(store =>
    {
        store.ConfigureStore(jobStore =>
        {
            jobStore.StoreJobDataAsStrings = true;
            jobStore.TablePrefix = "quartz.qrtz_";
        });
        store.UsePostgres(postgres =>
        {
            postgres.ConnectionString = builder.Configuration.GetConnectionString("app")!;
        });
        store.UseSystemTextJsonSerializer();
        store.UseClustering();
    });
    options.AddJob<CronDispatchJob>(job => job.WithIdentity("maintenance").StoreDurably().RequestRecovery());
});
builder.Services.AddQuartzHostedService(options => options.WaitForJobsToComplete = true);
builder.Services.AddHealthChecks().AddCheck<WorkerReadiness>("worker", tags: ["ready"]);
builder.Services.Configure<HostOptions>(options => options.ShutdownTimeout = TimeSpan.FromSeconds(45));
var app = builder.Build();
app.MapDefaultEndpoints(); app.Run();
