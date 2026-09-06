using Quartz;
using TemplateV4.Application;
using TemplateV4.BackgroundWorker;
using TemplateV4.Infrastructure;
using TemplateV4.ServiceDefaults;

if (await Hosting.HandleHealthProbe(args)) return;
var builder = WebApplication.CreateBuilder(args);
builder.AddServiceDefaults();
builder.Services.AddInfrastructure(builder.Configuration, builder.Environment);
builder.Services.AddScoped<BackgroundExecutionContext>();
builder.Services.AddScoped<IExecutionContext>(provider => provider.GetRequiredService<BackgroundExecutionContext>());
builder.Services.AddScoped<IIntegrationTransport, LocalTransport>();
builder.Services.AddHostedService<OutboxPump>();
builder.Services.AddHostedService<JobReconciler>();
builder.Services.AddQuartz(options =>
{
    options.SchedulerId = "AUTO";
    options.SchedulerName = "templatev4-worker";
    options.UsePersistentStore(store =>
    {
        store.UseProperties = true;
        store.UsePostgres(postgres =>
        {
            postgres.ConnectionString = builder.Configuration.GetConnectionString("app")!;
            postgres.TablePrefix = "quartz.qrtz_";
        });
        store.UseSystemTextJsonSerializer();
        store.UseClustering();
    });
    options.AddJob<CronDispatchJob>(job => job.WithIdentity("maintenance").StoreDurably().RequestRecovery());
    if (builder.Configuration.GetValue("Maintenance:Enabled", true))
        options.AddTrigger(trigger => trigger.WithIdentity("maintenance-daily").ForJob("maintenance")
            .WithCronSchedule(builder.Configuration["Maintenance:Cron"] ?? "0 0 2 * * ?", cron => cron.WithMisfireHandlingInstructionDoNothing()));
});
builder.Services.AddQuartzHostedService(options => options.WaitForJobsToComplete = true);
builder.Services.AddHealthChecks().AddCheck<WorkerReadiness>("worker", tags: ["ready"]);
builder.Services.Configure<HostOptions>(options => options.ShutdownTimeout = TimeSpan.FromSeconds(45));
var app = builder.Build();
if (!builder.Configuration.GetValue("Maintenance:Enabled", true))
    await (await app.Services.GetRequiredService<ISchedulerFactory>().GetScheduler()).UnscheduleJob(new TriggerKey("maintenance-daily"));
app.MapDefaultEndpoints(); app.Run();
