var builder = DistributedApplication.CreateBuilder(args);

var database = builder
    .AddPostgres("postgres")
    .WithImageTag("18.6-alpine")
    .WithDataVolume()
    .AddDatabase("app");

var mail = builder
    .AddContainer("mailpit", "axllent/mailpit", "v1.31.0")
    .WithHttpEndpoint(targetPort: 8025, name: "ui")
    .WithEndpoint(targetPort: 1025, name: "smtp");

var repositoryRoot = Path.GetFullPath(Path.Combine(builder.AppHostDirectory, "../.."));
var storage = builder.AddContainer("storage", "chrislusf/seaweedfs", "4.45")
    .WithArgs("mini", "-dir=/data", "-bucket=templatev4")
    .WithVolume("templatev4-storage", "/data")
    .WithHttpEndpoint(targetPort: 8333, name: "s3")
    .WithEnvironment("AWS_ACCESS_KEY_ID", "local-development")
    .WithEnvironment("AWS_SECRET_ACCESS_KEY", "local-development-only-change-in-production");
var signingKey = Path.Combine(repositoryRoot, ".local/jwt.pem");

if (!File.Exists(signingKey))
{
    throw new InvalidOperationException("Run node tools/framework.mjs dev-init first.");
}

var dataProtectionKeys = Path.Combine(repositoryRoot, ".local/keys");
var migrator = builder
    .AddProject<Projects.TemplateV4_DatabaseMigrator>("migrator")
    .WithReference(database)
    .WaitFor(database)
    .WithEnvironment("DataProtection__KeyPath", dataProtectionKeys);

var api = builder
    .AddProject<Projects.TemplateV4_ApiService>("api")
    .WithReference(database)
    .WaitForCompletion(migrator)
    .WithEnvironment("Jwt__PrivateKeyPath", signingKey)
    .WithEnvironment("Jwt__KeyId", "local-v1")
    .WithEnvironment("DataProtection__KeyPath", dataProtectionKeys)
    .WithEnvironment("Web__PublicUrl", "https://localhost:4200")
    .WaitFor(storage)
    .WithEnvironment("Storage__Provider", "S3")
    .WithEnvironment("Storage__S3__Endpoint", storage.GetEndpoint("s3"))
    .WithEnvironment("Storage__S3__Bucket", "templatev4")
    .WithEnvironment("Storage__S3__AccessKey", "local-development")
    .WithEnvironment("Storage__S3__SecretKey", "local-development-only-change-in-production")
    .WithEnvironment("Web__AllowedOrigins__0", "https://localhost:4200");

builder
    .AddProject<Projects.TemplateV4_BackgroundWorker>("worker")
    .WithReference(database)
    .WaitForCompletion(migrator)
    .WaitFor(mail)
    .WaitFor(storage)
    .WithEnvironment("Storage__Provider", "S3")
    .WithEnvironment("Storage__S3__Endpoint", storage.GetEndpoint("s3"))
    .WithEnvironment("Storage__S3__Bucket", "templatev4")
    .WithEnvironment("Storage__S3__AccessKey", "local-development")
    .WithEnvironment("Storage__S3__SecretKey", "local-development-only-change-in-production")
    .WithEnvironment("DataProtection__KeyPath", dataProtectionKeys)
    .WithEnvironment("Email__Host", mail.GetEndpoint("smtp").Property(Aspire.Hosting.ApplicationModel.EndpointProperty.Host))
    .WithEnvironment("Email__Port", mail.GetEndpoint("smtp").Property(Aspire.Hosting.ApplicationModel.EndpointProperty.Port))
    .WithEnvironment("Web__PublicUrl", "https://localhost:4200");

builder
    .AddJavaScriptApp("web", "../TemplateV4.Angular")
    .WithRunScript("start")
    .WithReference(api)
    .WithHttpsEndpoint(port: 4200, targetPort: 4200, isProxied: false)
    .WaitFor(api);

builder
    .AddJavaScriptApp("documentation", "../../documentation")
    .WithRunScript("start")
    .WithEnvironment("DOCMD_HOST", "0.0.0.0")
    .WithHttpEndpoint(targetPort: 3000);

builder.Build().Run();
