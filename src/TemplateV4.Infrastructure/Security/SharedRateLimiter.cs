using Microsoft.EntityFrameworkCore;
using TemplateV4.Infrastructure.Persistence;
namespace TemplateV4.Infrastructure.Security;

public sealed class SharedRateLimiter(FrameworkDb db, TimeProvider time)
{
    public async Task<bool> Allow(string scope, string subject, int limit, TimeSpan window, CancellationToken ct)
    {
        var now = time.GetUtcNow(); var bucket = now.ToUnixTimeSeconds() / (long)window.TotalSeconds;
        var id = AuthService.Hash($"{scope}:{subject}:{bucket}"); var expires = now.Add(window);
        return await db.Database.ExecuteSqlInterpolatedAsync($"INSERT INTO identity.rate_buckets (\"Id\", \"Count\", \"ExpiresAt\") VALUES ({id}, 1, {expires}) ON CONFLICT (\"Id\") DO UPDATE SET \"Count\" = identity.rate_buckets.\"Count\" + 1 WHERE identity.rate_buckets.\"Count\" < {limit}", ct) > 0;
    }
}
