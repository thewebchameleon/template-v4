using System.Security.Cryptography;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Quartz;
using templatev4.Infrastructure.Persistence;
namespace templatev4.Worker;

public sealed class CronDispatchJob(FrameworkDb db, TimeProvider time) : IJob
{
    public async Task Execute(IJobExecutionContext context)
    {
        var id = new Guid(SHA256.HashData(Encoding.UTF8.GetBytes($"maintenance:{context.ScheduledFireTimeUtc:O}"))[..16]);
        var now = time.GetUtcNow();
        await db.Database.ExecuteSqlInterpolatedAsync($"INSERT INTO messaging.job_runs (\"Id\", \"State\", \"Culture\", \"Attempts\", \"AvailableAt\") VALUES ({id}, 'Pending', 'en-ZA', 0, {now}) ON CONFLICT (\"Id\") DO NOTHING", context.CancellationToken);
    }
}
