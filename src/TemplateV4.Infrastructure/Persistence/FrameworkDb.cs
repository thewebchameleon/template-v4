using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using TemplateV4.Domain.Users;

namespace TemplateV4.Infrastructure.Persistence;

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
    public DbSet<BackgroundJobSchedule> BackgroundJobSchedules => Set<BackgroundJobSchedule>();
    public DbSet<UserNotification> Notifications => Set<UserNotification>();
    public DbSet<StoredFile> Files => Set<StoredFile>();
    public DbSet<FileStorageSettings> FileStorageSettings => Set<FileStorageSettings>();
    public DbSet<DeletionRequest> DeletionRequests => Set<DeletionRequest>();
    public DbSet<PlatformAppearanceSettings> PlatformAppearanceSettings => Set<PlatformAppearanceSettings>();
    public DbSet<RuntimeModuleSettings> RuntimeModules => Set<RuntimeModuleSettings>();
    public DbSet<TemplateV4.Infrastructure.ApiKeys.ApiKeyRow> ApiKeys => Set<TemplateV4.Infrastructure.ApiKeys.ApiKeyRow>();

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
        model.Entity<TemplateV4.Infrastructure.Licensing.LicenseState>(entity =>
        {
            entity.ToTable("deployment_license", "app"); entity.HasKey(x => x.Id);
            entity.Property(x => x.Payload).HasMaxLength(131072); entity.Property(x => x.Signature).HasMaxLength(2048);
        });
        model.Entity<ActionItemRow>(entity =>
        {
            entity.ToTable("action_items", "app", table => table.HasCheckConstraint("CK_action_items_assignment", "(\"AssigneeId\" IS NULL) <> (\"QueueId\" IS NULL)"));
            entity.Property(x => x.Title).HasMaxLength(160); entity.Property(x => x.Description).HasMaxLength(2000);
            entity.Property(x => x.Link).HasMaxLength(1000); entity.Property(x => x.Source).HasMaxLength(32);
            entity.Property(x => x.QueueId).HasMaxLength(80); entity.Property(x => x.State).HasMaxLength(16);
            entity.HasIndex(x => new { x.Source, x.SourceId }).IsUnique();
            entity.HasIndex(x => new { x.AssigneeId, x.State, x.CreatedAt });
            entity.HasIndex(x => new { x.QueueId, x.State, x.CreatedAt });
            entity.HasIndex(x => new { x.CreatorId, x.State, x.CreatedAt });
        });

        model.Entity<AppUser>().Property(x => x.RegistrationState).HasMaxLength(32).HasDefaultValue("NotRequired");
        model.Entity<AppUser>().HasIndex(x => x.NormalizedEmail).IsUnique();
        model.Entity<AppUser>().Property(x => x.PreferredMfaMethod).HasMaxLength(32);
        model.Entity<SecuritySettings>(entity => { entity.ToTable("security_settings", "identity"); entity.Property(x => x.Version).IsConcurrencyToken(); });
        model.Entity<AuthChallenge>(entity => { entity.ToTable("auth_challenges", "identity"); entity.HasKey(x => x.Id); entity.Property(x => x.Id).HasMaxLength(64); entity.HasIndex(x => x.ExpiresAt); });
        model.Entity<RateBucket>(entity => { entity.ToTable("rate_buckets", "identity"); entity.HasKey(x => x.Id); entity.HasIndex(x => x.ExpiresAt); });
        model.Entity<JobRun>(entity =>
        {
            entity.ToTable("job_runs", "messaging");
            entity.Property(x => x.DefinitionId).HasMaxLength(100).HasDefaultValue("maintenance");
            entity.Property(x => x.Attempts).IsConcurrencyToken();
            entity.HasIndex(x => new { x.State, x.AvailableAt });
            entity.HasIndex(x => new { x.DefinitionId, x.AvailableAt });
        });
        model.Entity<BackgroundJobSchedule>(entity =>
        {
            entity.ToTable("background_job_schedules", "messaging");
            entity.Property(x => x.Id).HasMaxLength(100);
            entity.Property(x => x.Version).IsConcurrencyToken();
            entity.HasData(new BackgroundJobSchedule
            {
                Id = "maintenance",
                UpdatedAt = new DateTimeOffset(2026, 9, 18, 0, 0, 0, TimeSpan.Zero),
                Version = new Guid("b82be80f-7d60-4ae7-bf4e-52351b480702")
            });
        });
        model.Entity<UserProfile>(entity =>
        {
            entity.ToTable("users", "app"); entity.HasKey(x => x.Id);
            entity.Property(x => x.DisplayName).HasMaxLength(120);
            entity.Property(x => x.Culture).HasMaxLength(16);
            entity.Property(x => x.FirstName).HasMaxLength(100);
            entity.Property(x => x.LastName).HasMaxLength(100);
            entity.Property(x => x.TimeZone).HasMaxLength(100).HasDefaultValue("UTC");
            entity.Property(x => x.Version).IsConcurrencyToken();
            entity.Ignore(x => x.Events); entity.HasQueryFilter(x => x.DeletedAt == null);
            entity.HasIndex(x => x.DisplayName);
            entity.HasOne<AppUser>().WithOne().HasForeignKey<UserProfile>(x => x.Id).OnDelete(DeleteBehavior.Restrict);
        });
        model.Entity<UserAvatar>(entity =>
        {
            entity.ToTable("user_avatars", "app", table => table.HasCheckConstraint("CK_user_avatars_size", "octet_length(\"Png\") <= 262144"));
            entity.HasKey(x => x.UserId);
            entity.HasOne<AppUser>().WithOne().HasForeignKey<UserAvatar>(x => x.UserId).OnDelete(DeleteBehavior.Cascade);
        });
        model.Entity<Session>(entity =>
        {
            entity.ToTable("sessions", "identity"); entity.HasIndex(x => new { x.UserId, x.RevokedAt });
            entity.Property(x => x.Device).HasMaxLength(200); entity.Property(x => x.IpAddress).HasMaxLength(45);
            entity.Property(x => x.SecurityStamp).HasMaxLength(100);
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
            entity.HasIndex(x => x.ActorId); entity.HasIndex(x => x.SubjectId);
            entity.ToTable("idempotency", "messaging"); entity.HasKey(x => x.Key); entity.Property(x => x.Key).HasMaxLength(200);
            entity.HasIndex(x => x.ExpiresAt);
        });
        model.Entity<AuditEntry>(entity =>
        {
            entity.ToTable("entries", "audit"); entity.Property(x => x.Action).HasMaxLength(100);
            entity.Property(x => x.ActorType).HasMaxLength(40);
            entity.Property(x => x.SubjectType).HasMaxLength(40);
            entity.Property(x => x.ActorNameSnapshot).HasMaxLength(256);
            entity.Property(x => x.SubjectNameSnapshot).HasMaxLength(256);
            entity.Property(x => x.Outcome).HasMaxLength(20);
            entity.Property(x => x.FailureCode).HasMaxLength(100);
            entity.Property(x => x.Source).HasMaxLength(40);
            entity.Property(x => x.Reason).HasMaxLength(500);
            entity.Property(x => x.ChangesJson).HasColumnType("jsonb");
            entity.Property(x => x.RelatedEntitiesJson).HasColumnType("jsonb");
            entity.Property(x => x.MetadataJson).HasColumnType("jsonb");
            entity.HasIndex(x => new { x.SubjectId, x.At });
            entity.HasIndex(x => new { x.At, x.Id });
            entity.HasIndex(x => new { x.ActorId, x.At });
        });
        model.Entity<UserNotification>(entity =>
        {
            entity.ToTable("notifications", "app");
            entity.Property(x => x.Kind).HasMaxLength(100); entity.Property(x => x.Link).HasMaxLength(200);
            entity.HasIndex(x => new { x.UserId, x.CreatedAt });
            entity.HasOne<AppUser>().WithMany().HasForeignKey(x => x.UserId).OnDelete(DeleteBehavior.Restrict);
        });
        model.Entity<WebPushSubscription>(entity =>
        {
            entity.ToTable("web_push_subscriptions", "app");
            entity.Property(x => x.EndpointHash).HasMaxLength(64);
            entity.Property(x => x.Endpoint).HasMaxLength(2048);
            entity.Property(x => x.P256dh).HasMaxLength(87);
            entity.Property(x => x.Auth).HasMaxLength(22);
            entity.HasIndex(x => x.EndpointHash).IsUnique();
            entity.HasIndex(x => x.UserId);
            entity.HasOne<AppUser>().WithMany().HasForeignKey(x => x.UserId).OnDelete(DeleteBehavior.Cascade);
        });
        model.Entity<TemplateV4.Infrastructure.Updates.UpdateState>(entity =>
        {
            entity.ToTable("release_update_state", "app");
            entity.HasKey(x => x.Id); entity.Property(x => x.Id).ValueGeneratedNever();
            entity.Property(x => x.Status).HasMaxLength(30); entity.Property(x => x.InstalledHash).HasMaxLength(64);
        });
        model.Entity<TemplateV4.Infrastructure.Updates.UpdateAnnouncement>(entity =>
        {
            entity.ToTable("release_announcements", "app");
            entity.HasKey(x => new { x.Component, x.Version });
            entity.Property(x => x.Component).HasMaxLength(80); entity.Property(x => x.Version).HasMaxLength(30);
        });
        model.Entity<StoredFile>(entity =>
        {
            entity.ToTable("files", "file_storage"); entity.Property(x => x.Name).HasMaxLength(180);
            entity.Property(x => x.ContentType).HasMaxLength(100);
            entity.Property(x => x.Description).HasMaxLength(4000);
            entity.Property(x => x.Tags).HasMaxLength(1000);
            entity.HasIndex(x => new { x.OwnerId, x.CreatedAt }); entity.HasIndex(x => x.DeletedAt);
            entity.HasOne<AppUser>().WithMany().HasForeignKey(x => x.OwnerId).OnDelete(DeleteBehavior.Restrict);
            entity.Ignore(x => x.ObjectKey);
            entity.Property(x => x.StorageKey).HasMaxLength(100);
            entity.HasOne<StoredFile>().WithMany().HasForeignKey(x => x.ParentId).OnDelete(DeleteBehavior.Restrict);
            entity.HasIndex(x => new { x.OwnerId, x.ParentId });
        });
        model.Entity<FileStorageShare>(entity =>
        {
            entity.ToTable("file_shares", "file_storage");
            entity.Property(x => x.TokenHash).HasMaxLength(64);
            entity.Property(x => x.ProtectedToken).HasMaxLength(1024);
            entity.Property(x => x.RecipientEmail).HasMaxLength(254);
            entity.HasIndex(x => x.TokenHash).IsUnique();
            entity.HasIndex(x => x.RecipientId);
            entity.HasIndex(x => x.SharedById);
            entity.HasOne<StoredFile>().WithMany().HasForeignKey(x => x.FileId).OnDelete(DeleteBehavior.Restrict);
            entity.HasOne<AppUser>().WithMany().HasForeignKey(x => x.RecipientId).OnDelete(DeleteBehavior.Restrict);
            entity.HasOne<AppUser>().WithMany().HasForeignKey(x => x.SharedById).OnDelete(DeleteBehavior.SetNull);
        });
        model.Entity<FileStorageSettings>(entity =>
        {
            entity.ToTable("file_storage_settings", "file_storage");
            entity.Property(x => x.DemoExpiryMinutes).HasDefaultValue(60);
            entity.Property(x => x.MaxUploadBytes).HasDefaultValue(20L * 1024 * 1024);
            entity.Property(x => x.Version).IsConcurrencyToken();
            entity.HasData(new FileStorageSettings { Id = 1, DefaultQuotaBytes = 100L * 1024 * 1024, MaxUploadBytes = 20L * 1024 * 1024, Version = new Guid("df8c4bbd-18fb-45f8-8f13-a4c58a334660") });
        });
        model.Entity<PlatformAppearanceSettings>(entity =>
        {
            entity.ToTable("platform_appearance_settings", "app", table => table.HasCheckConstraint("CK_platform_appearance_singleton", "\"Id\" = 1"));
            entity.Property(x => x.CustomColorsJson).HasColumnType("jsonb").HasDefaultValue("[]");
            entity.Property(x => x.PrimaryColor).HasMaxLength(7);
            entity.Property(x => x.LoginBackground).HasMaxLength(32).HasDefaultValue("blue-sky");
            entity.Property(x => x.Version).IsConcurrencyToken();
            entity.HasData(new PlatformAppearanceSettings { Id = 1, PrimaryColor = "#2563EB", Version = new Guid("06d9599a-a693-4d21-9745-152b0515b89b") });
        });
        model.Entity<RuntimeModuleSettings>(entity =>
        {
            entity.ToTable("runtime_modules", "app");
            entity.Property(x => x.Id).HasMaxLength(80);
            entity.Property(x => x.Version).IsConcurrencyToken();
            entity.HasData(new RuntimeModuleSettings { Id = "support", Enabled = true, Version = new Guid("b6c2b6df-1f86-46ea-90f1-c7bc3b61ba49") });
            entity.HasData(new RuntimeModuleSettings { Id = "crm", Enabled = true, Version = new Guid("34c03708-6e53-4c4b-8bfa-d79ed6744c9c") });
            entity.HasData(new RuntimeModuleSettings { Id = "invoicing", Enabled = true, Version = new Guid("9b06f2a7-1f29-4f29-887f-c0836dc6f383") });
            entity.HasData(new RuntimeModuleSettings { Id = "file-storage", Enabled = true, Version = new Guid("4660b460-92b8-46cf-aae1-eb04318596b2") });
        });
        model.Entity<TemplateV4.Infrastructure.ApiKeys.ApiKeyRow>(entity =>
        {
            entity.ToTable("api_keys", "app");
            entity.Property(x => x.Name).HasMaxLength(100);
            entity.Property(x => x.SecretHash).HasMaxLength(32);
            entity.Property(x => x.Scopes).HasColumnType("text[]");
            entity.HasIndex(x => x.CreatedAt);
            entity.HasIndex(x => x.ExpiresAt);
            entity.HasOne<AppUser>().WithMany().HasForeignKey(x => x.CreatedBy).OnDelete(DeleteBehavior.Restrict);
        });
        SupportModel.Configure(model);
        Support.SupportSettingsMappings.Configure(model);
        CustomerBillingModel.Configure(model);
        Crm.CrmMappings.Configure(model);
        Cms.CmsMappings.Configure(model);
        Website.WebsiteMappings.Configure(model);
        Contact.ContactMappings.Configure(model);
        Crm.RecordAttachmentMappings.Configure(model);
        Invoicing.CommercialMappings.Configure(model);
        model.Entity<DeletionRequest>(entity =>
        {
            entity.ToTable("deletion_requests", "app"); entity.Property(x => x.State).HasMaxLength(30);
            entity.HasIndex(x => x.UserId).IsUnique().HasFilter("\"State\" = 'Pending'");
            entity.HasIndex(x => new { x.State, x.RequestedAt });
            entity.HasOne<AppUser>().WithMany().HasForeignKey(x => x.UserId).OnDelete(DeleteBehavior.Restrict);
        });
    }
}
