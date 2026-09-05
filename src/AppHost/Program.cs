var builder = DistributedApplication.CreateBuilder(args);
var database = builder.AddPostgres("postgres").WithImageTag("18.6-alpine").WithDataVolume().AddDatabase("app");
var mail = builder.AddContainer("mailpit", "axllent/mailpit", "v1.31.0").WithHttpEndpoint(targetPort: 8025, name: "ui").WithEndpoint(targetPort: 1025, name: "smtp");
var root = Path.GetFullPath(Path.Combine(builder.AppHostDirectory, "../.."));
var key = Path.Combine(root, ".local/jwt.pem");
if (!File.Exists(key)) throw new InvalidOperationException("Run node tools/framework.mjs dev-init first.");
var migrator = builder.AddProject<Projects.templatev4_DatabaseMigrator>("migrator").WithReference(database).WaitFor(database)
    .WithEnvironment("DataProtection__KeyPath", Path.Combine(root, ".local/keys"));
var api = builder.AddProject<Projects.templatev4_API>("api").WithReference(database).WaitForCompletion(migrator)
    .WithEnvironment("Jwt__PrivateKeyPath", key).WithEnvironment("Jwt__KeyId", "local-v1")
    .WithEnvironment("DataProtection__KeyPath", Path.Combine(root, ".local/keys"))
    .WithEnvironment("Web__PublicUrl", "https://localhost:4200").WithEnvironment("Web__AllowedOrigins__0", "https://localhost:4200");
builder.AddProject<Projects.templatev4_Worker>("worker").WithReference(database).WaitForCompletion(migrator).WaitFor(mail)
    .WithEnvironment("DataProtection__KeyPath", Path.Combine(root, ".local/keys"))
    .WithEnvironment("Email__Host", mail.GetEndpoint("smtp").Property(Aspire.Hosting.ApplicationModel.EndpointProperty.Host))
    .WithEnvironment("Email__Port", mail.GetEndpoint("smtp").Property(Aspire.Hosting.ApplicationModel.EndpointProperty.Port))
    .WithEnvironment("Web__PublicUrl", "https://localhost:4200");
builder.AddJavaScriptApp("web", "../Web").WithRunScript("start").WithReference(api).WithHttpsEndpoint(port: 4200, targetPort: 4200, isProxied: false).WaitFor(api);
builder.AddJavaScriptApp("documentation", "../Documentation")
    .WithRunScript("start")
    .WithEnvironment("DOCMD_HOST", "0.0.0.0")
    .WithHttpEndpoint(targetPort: 3000);
builder.Build().Run();
