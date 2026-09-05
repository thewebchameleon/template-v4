using System.Text.Json;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using templatev4.Application;
using templatev4.Domain.Users;

namespace templatev4.Infrastructure.Persistence;

public sealed class AppUser : IdentityUser<Guid> { public long LastTotpStep { get; set; } = -1; }
public sealed class SecuritySettings
{
    public int Id { get; set; } = 1;
    public string MfaPolicy { get; set; } = "Administrators";
    public bool RegistrationEnabled { get; set; }
    public DateTimeOffset? BootstrapCompletedAt { get; set; }
    public Guid Version { get; set; } = Guid.NewGuid();
}
public sealed class RateBucket
{
    public string Id { get; set; } = "";
    public int Count { get; set; }
    public DateTimeOffset ExpiresAt { get; set; }
}
public sealed class JobRun
{
    public Guid Id { get; set; }
    public string State { get; set; } = "Pending";
    public string Culture { get; set; } = "en-ZA";
    public Guid? ActorId { get; set; }
    public string? TraceParent { get; set; }
    public int Attempts { get; set; }
    public DateTimeOffset AvailableAt { get; set; }
    public DateTimeOffset? LeaseUntil { get; set; }
    public DateTimeOffset? CompletedAt { get; set; }
    public string? ErrorCode { get; set; }
}
public sealed class AuthChallenge
{
    public string Id { get; set; } = "";
    public Guid? UserId { get; set; }
    public string Purpose { get; set; } = "";
    public string State { get; set; } = "";
    public string SecurityStamp { get; set; } = "";
    public string Device { get; set; } = "";
    public DateTimeOffset ExpiresAt { get; set; }
}
public sealed class Session
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UserId { get; set; }
    public string SecurityStamp { get; set; } = "";
    public string Device { get; set; } = "";
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset ExpiresAt { get; set; }
    public DateTimeOffset? RevokedAt { get; set; }
    public bool MfaVerified { get; set; }
    public bool SetupOnly { get; set; }
}
public sealed class RefreshToken
{
    public string Hash { get; set; } = "";
    public Guid SessionId { get; set; }
    public DateTimeOffset ExpiresAt { get; set; }
    public DateTimeOffset? ConsumedAt { get; set; }
}
public sealed class OutboxMessage
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Type { get; set; } = "";
    public string Payload { get; set; } = "";
    public string Culture { get; set; } = "en-ZA";
    public string? TraceParent { get; set; }
    public Guid? ActorId { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset AvailableAt { get; set; }
    public DateTimeOffset? CompletedAt { get; set; }
    public DateTimeOffset? PoisonedAt { get; set; }
    public int Attempts { get; set; }
    public string? LastErrorCode { get; set; }
    public Guid? LeaseId { get; set; }
    public DateTimeOffset? LeaseUntil { get; set; }
}
public sealed class InboxReceipt
{
    public Guid Id { get; set; }
    public DateTimeOffset CompletedAt { get; set; }
}
public sealed class IdempotencyRecord
{
    public string Key { get; set; } = "";
    public string Fingerprint { get; set; } = "";
    public string Response { get; set; } = "";
    public DateTimeOffset ExpiresAt { get; set; }
}
public sealed class AuditEntry
{
    public long Id { get; set; }
    public Guid? ActorId { get; set; }
    public Guid? SubjectId { get; set; }
    public string Action { get; set; } = "";
    public string? TraceParent { get; set; }
    public DateTimeOffset At { get; set; }
}

public sealed class FrameworkDb(DbContextOptions<FrameworkDb> options) : IdentityDbContext<AppUser, IdentityRole<Guid>, Guid>(options)
{
    public DbSet<UserProfile> Profiles => Set<UserProfile>();
    public DbSet<Session> Sessions => Set<Session>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();
    public DbSet<OutboxMessage> Outbox => Set<OutboxMessage>();
    public DbSet<InboxReceipt> Inbox => Set<InboxReceipt>();
    public DbSet<IdempotencyRecord> Idempotency => Set<IdempotencyRecord>();
    public DbSet<AuditEntry> Audit => Set<AuditEntry>();
    public DbSet<SecuritySettings> SecuritySettings => Set<SecuritySettings>();
    public DbSet<AuthChallenge> AuthChallenges => Set<AuthChallenge>();
    public DbSet<RateBucket> RateBuckets => Set<RateBucket>();
    public DbSet<JobRun> JobRuns => Set<JobRun>();

    protected override void OnModelCreating(ModelBuilder model)
    {
        base.OnModelCreating(model);
        // Explicit passkey mapping keeps runtime, design-time and package consumers on the same model.
        model.Entity<IdentityUserPasskey<Guid>>(entity =>
        {
            entity.HasKey(x => x.CredentialId); entity.ToTable("AspNetUserPasskeys", "identity");
            entity.Property(x => x.CredentialId).HasMaxLength(1024);
            entity.OwnsOne(x => x.Data).ToJson();
            entity.HasOne<AppUser>().WithMany().HasForeignKey(x => x.UserId).IsRequired();
        });
        foreach (var entity in model.Model.GetEntityTypes()) entity.SetSchema("identity");
        model.Entity<AppUser>().HasIndex(x => x.NormalizedEmail).IsUnique();
        model.Entity<SecuritySettings>(entity => { entity.ToTable("security_settings", "identity"); entity.Property(x => x.Version).IsConcurrencyToken(); });
        model.Entity<AuthChallenge>(entity => { entity.ToTable("auth_challenges", "identity"); entity.HasKey(x => x.Id); entity.Property(x => x.Id).HasMaxLength(64); entity.HasIndex(x => x.ExpiresAt); });
        model.Entity<RateBucket>(entity => { entity.ToTable("rate_buckets", "identity"); entity.HasKey(x => x.Id); entity.HasIndex(x => x.ExpiresAt); });
        model.Entity<JobRun>(entity => { entity.ToTable("job_runs", "messaging"); entity.Property(x => x.Attempts).IsConcurrencyToken(); entity.HasIndex(x => new { x.State, x.AvailableAt }); });
        model.Entity<UserProfile>(entity =>
        {
            entity.ToTable("users", "app"); entity.HasKey(x => x.Id);
            entity.Property(x => x.DisplayName).HasMaxLength(120);
            entity.Property(x => x.Culture).HasMaxLength(16);
            entity.Property(x => x.Version).IsConcurrencyToken();
            entity.Ignore(x => x.Events); entity.HasQueryFilter(x => x.DeletedAt == null);
            entity.HasIndex(x => x.DisplayName);
            entity.HasOne<AppUser>().WithOne().HasForeignKey<UserProfile>(x => x.Id).OnDelete(DeleteBehavior.Restrict);
        });
        model.Entity<Session>(entity =>
        {
            entity.ToTable("sessions", "identity"); entity.HasIndex(x => new { x.UserId, x.RevokedAt });
            entity.Property(x => x.Device).HasMaxLength(200); entity.Property(x => x.SecurityStamp).HasMaxLength(100);
            entity.HasOne<AppUser>().WithMany().HasForeignKey(x => x.UserId).OnDelete(DeleteBehavior.Cascade);
        });
        model.Entity<RefreshToken>(entity =>
        {
            entity.ToTable("refresh_tokens", "identity"); entity.HasKey(x => x.Hash); entity.Property(x => x.Hash).HasMaxLength(64);
            entity.HasIndex(x => x.ExpiresAt);
            entity.HasOne<Session>().WithMany().HasForeignKey(x => x.SessionId).OnDelete(DeleteBehavior.Cascade);
        });
        model.Entity<OutboxMessage>(entity =>
        {
            entity.ToTable("outbox", "messaging"); entity.Property(x => x.Type).HasMaxLength(100);
            entity.Property(x => x.LeaseId).IsConcurrencyToken();
            entity.HasIndex(x => x.AvailableAt).HasFilter("\"CompletedAt\" IS NULL AND \"PoisonedAt\" IS NULL");
        });
        model.Entity<InboxReceipt>().ToTable("inbox", "messaging");
        model.Entity<IdempotencyRecord>(entity =>
        {
            entity.ToTable("idempotency", "messaging"); entity.HasKey(x => x.Key); entity.Property(x => x.Key).HasMaxLength(200);
            entity.HasIndex(x => x.ExpiresAt);
        });
        model.Entity<AuditEntry>(entity =>
        {
            entity.ToTable("entries", "audit"); entity.Property(x => x.Action).HasMaxLength(100);
            entity.HasIndex(x => new { x.SubjectId, x.At });
        });
    }
}

public sealed class EventOutbox(FrameworkDb db, IExecutionContext context, TimeProvider time, IntegrationContracts contracts) : IEventOutbox
{
    public void Add<T>(T message) where T : IIntegrationEvent
    {
        // Explicit stable names form the wire contract. Never deserialize arbitrary CLR types.
        var type = contracts.Name<T>();
        db.Outbox.Add(new()
        {
            Type = type,
            Payload = JsonSerializer.Serialize(message),
            Culture = context.Culture,
            ActorId = context.ActorId,
            TraceParent = context.TraceParent,
            CreatedAt = time.GetUtcNow(),
            AvailableAt = time.GetUtcNow()
        });
    }
}
