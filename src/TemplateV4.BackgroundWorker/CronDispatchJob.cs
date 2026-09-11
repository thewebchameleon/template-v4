using System.Security.Cryptography;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Quartz;
using TemplateV4.Application.Modules;
using TemplateV4.Infrastructure.Persistence;
namespace TemplateV4.BackgroundWorker;

public sealed class CronDispatchJob(FrameworkDb db, TimeProvider time, ModuleCatalog modules) : IJob
{
    public async ValueTask Execute(IJobExecutionContext context, CancellationToken cancellationToken)
    {
        if (!modules.Enabled("maintenance")) return;
        var id = new Guid(SHA256.HashData(Encoding.UTF8.GetBytes($"maintenance:{context.ScheduledFireTimeUtc:O}"))[..16]);
        var now = time.GetUtcNow();
        await db.Database.ExecuteSqlInterpolatedAsync($"INSERT INTO messaging.job_runs (\"Id\", \"State\", \"Culture\", \"Attempts\", \"AvailableAt\") VALUES ({id}, 'Pending', 'en-ZA', 0, {now}) ON CONFLICT (\"Id\") DO NOTHING", cancellationToken);
    }
}
