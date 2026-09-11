using Quartz;
using TemplateV4.Application;
using TemplateV4.BackgroundWorker;
using TemplateV4.Infrastructure;
using TemplateV4.Infrastructure.Modules;
using TemplateV4.ServiceDefaults;

if (await Hosting.HandleHealthProbe(args)) return;
var builder = WebApplication.CreateBuilder(args);
builder.AddServiceDefaults();
builder.Services.AddInfrastructure(builder.Configuration, builder.Environment);
var maintenanceEnabled = ModuleConfiguration.Load(builder.Configuration).Enabled("maintenance") && builder.Configuration.GetValue("Maintenance:Enabled", true);
builder.Services.AddScoped<BackgroundExecutionContext>();
builder.Services.AddScoped<IExecutionContext>(provider => provider.GetRequiredService<BackgroundExecutionContext>());
builder.Services.AddScoped<IIntegrationTransport, LocalTransport>();
builder.Services.AddHostedService<OutboxPump>();
builder.Services.AddHostedService<JobReconciler>();
builder.Services.AddHostedService<StorageRetention>();
builder.Services.AddHostedService<DeliveryMetrics>();
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
    if (maintenanceEnabled)
        options.AddTrigger(trigger => trigger.WithIdentity("maintenance-daily").ForJob("maintenance")
            .WithCronSchedule(builder.Configuration["Maintenance:Cron"] ?? "0 0 2 * * ?", cron => cron.WithMisfireInstruction(CronTriggerMisfireInstruction.DoNothing)));
});
builder.Services.AddQuartzHostedService(options => options.WaitForJobsToComplete = true);
builder.Services.AddHealthChecks().AddCheck<WorkerReadiness>("worker", tags: ["ready"]);
builder.Services.Configure<HostOptions>(options => options.ShutdownTimeout = TimeSpan.FromSeconds(45));
var app = builder.Build();
if (!maintenanceEnabled)
    await (await app.Services.GetRequiredService<ISchedulerFactory>().GetScheduler()).UnscheduleJob(new TriggerKey("maintenance-daily"));
app.MapDefaultEndpoints(); app.Run();
