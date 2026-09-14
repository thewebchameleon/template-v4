param([string]$Version = '0.2.0', [string]$PreviousVersion = '')
$ErrorActionPreference = 'Stop'
$repo = Split-Path $PSScriptRoot -Parent
$artifacts = Join-Path $repo 'artifacts/packages'
$fixture = Join-Path $repo 'artifacts/foundation-consumer'
New-Item -ItemType Directory -Force -Path $fixture | Out-Null
# These stop inherited repository settings; the fixture has no ProjectReference or source alias.
'<Project />' | Set-Content (Join-Path $fixture 'Directory.Build.props')
'<Project />' | Set-Content (Join-Path $fixture 'Directory.Build.targets')
'<Project />' | Set-Content (Join-Path $fixture 'Directory.Packages.props')
$sources = @($Version, $PreviousVersion) | Where-Object { $_ } | Select-Object -Unique
$feeds = ($sources | ForEach-Object { '<add key="local-' + $_ + '" value="' + (Join-Path $artifacts $_) + '" />' }) -join ''
("<configuration><packageSources><clear/>$feeds<add key=`"nuget`" value=`"https://api.nuget.org/v3/index.json`"/></packageSources><packageSourceMapping><clear/>" + (($sources | ForEach-Object { '<packageSource key="local-' + $_ + '"><package pattern="TemplateV4.*"/></packageSource>' }) -join '') + '<packageSource key="nuget"><package pattern="*"/></packageSource></packageSourceMapping></configuration>') | Set-Content (Join-Path $fixture 'NuGet.Config')
@'
using TemplateV4.ApiService;
using Microsoft.EntityFrameworkCore;
using TemplateV4.Infrastructure;
using TemplateV4.Infrastructure.Persistence;
if (args.Contains("--verify-migration"))
{
    var builder = WebApplication.CreateBuilder(args);
    builder.Services.AddInfrastructure(builder.Configuration, builder.Environment);
    builder.Services.AddScoped<TemplateV4.SharedKernel.IExecutionContext, TemplateV4.Infrastructure.BackgroundExecutionContext>();
    await using var app = builder.Build();
    await using var scope = app.Services.CreateAsyncScope();
    var db = scope.ServiceProvider.GetRequiredService<FrameworkDb>();
    await db.Database.MigrateAsync();
    await db.Database.ExecuteSqlRawAsync("CREATE TABLE IF NOT EXISTS app.consumer_customization (id integer primary key, brand text not null); INSERT INTO app.consumer_customization VALUES (42, 'Retained application branding') ON CONFLICT DO NOTHING");
    var brand = await db.Database.SqlQueryRaw<string>("SELECT brand AS \"Value\" FROM app.consumer_customization WHERE id = 42").SingleAsync();
    if (brand != "Retained application branding") throw new Exception("Retained data changed");
    if (db.Model.GetEntityTypes().Any(x => x.GetSchema() == "sample_business")) throw new Exception("Business model leaked into foundation");
    return;
}
await FoundationHost.Run(args);
'@ | Set-Content (Join-Path $fixture 'Program.cs')
$container = 'foundation-consumer-' + [Guid]::NewGuid().ToString('N')
$savedEnvironment = @{}
$variables = @('ASPNETCORE_ENVIRONMENT','ConnectionStrings__app','DataProtection__KeyPath','Jwt__PrivateKeyPath','Jwt__KeyId','ASPNETCORE_URLS')
foreach ($variable in $variables) { $savedEnvironment[$variable] = [Environment]::GetEnvironmentVariable($variable) }
try {
    docker run -d --name $container -e POSTGRES_PASSWORD=consumer-test-only -p 127.0.0.1::5432 postgres:18.6-alpine | Out-Null
    if ($LASTEXITCODE -ne 0) { throw 'Consumer PostgreSQL startup failed' }
    $port = ((docker port $container 5432/tcp).Trim() -split ':')[-1]
    $env:ASPNETCORE_ENVIRONMENT = 'Testing'
    $env:ConnectionStrings__app = "Host=127.0.0.1;Port=$port;Database=postgres;Username=postgres;Password=consumer-test-only"
    $env:DataProtection__KeyPath = Join-Path $fixture 'keys'
    New-Item -ItemType Directory -Force -Path $env:DataProtection__KeyPath | Out-Null
    $rsa = [System.Security.Cryptography.RSA]::Create(3072)
    $env:Jwt__PrivateKeyPath = Join-Path $fixture 'jwt.pem'
    $rsa.ExportRSAPrivateKeyPem() | Set-Content $env:Jwt__PrivateKeyPath
    $rsa.Dispose()
    $env:Jwt__KeyId = 'consumer-test'
    for ($attempt = 0; $attempt -lt 30; $attempt++) {
        docker exec $container pg_isready -U postgres *> $null
        if ($LASTEXITCODE -eq 0) { break }
        Start-Sleep -Milliseconds 500
    }
foreach ($release in @($PreviousVersion, $Version) | Where-Object { $_ }) {
    "<Project Sdk=`"Microsoft.NET.Sdk.Web`"><PropertyGroup><TargetFramework>net10.0</TargetFramework><ImplicitUsings>enable</ImplicitUsings><Nullable>enable</Nullable></PropertyGroup><ItemGroup><PackageReference Include=`"TemplateV4.Http`" Version=`"$release`" /></ItemGroup></Project>" | Set-Content (Join-Path $fixture 'Consumer.csproj')
    dotnet restore (Join-Path $fixture 'Consumer.csproj') --configfile (Join-Path $fixture 'NuGet.Config') --packages (Join-Path $fixture 'packages')
    if ($LASTEXITCODE -ne 0) { throw 'Artifact consumer restore failed' }
    dotnet build (Join-Path $fixture 'Consumer.csproj') --no-restore
    if ($LASTEXITCODE -ne 0) { throw 'Artifact consumer build failed' }
    $assets = Get-Content (Join-Path $fixture 'obj/project.assets.json') -Raw | ConvertFrom-Json
    if ($assets.libraries.PSObject.Properties.Value | Where-Object { $_.type -eq 'project' }) { throw 'Project-reference fallback detected' }
    dotnet run --project (Join-Path $fixture 'Consumer.csproj') --no-build -- --verify-migration
    if ($LASTEXITCODE -ne 0) { throw 'Artifact migration/retained data check failed' }
    $listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Loopback, 0)
    $listener.Start(); $hostPort = $listener.LocalEndpoint.Port; $listener.Stop()
    $env:ASPNETCORE_URLS = "http://127.0.0.1:$hostPort"
    $processOptions = @{}
    if ($IsWindows) { $processOptions.WindowStyle = 'Hidden' }
    $hostProcess = Start-Process dotnet -ArgumentList @(('"' + (Join-Path $fixture 'bin/Debug/net10.0/Consumer.dll') + '"')) @processOptions -PassThru -RedirectStandardOutput (Join-Path $fixture 'startup.log') -RedirectStandardError (Join-Path $fixture 'startup-errors.log')
    try {
        $started = $false
        for ($attempt = 0; $attempt -lt 40; $attempt++) {
            if ($hostProcess.HasExited) { throw 'Package host exited before becoming ready' }
            try { $response = Invoke-WebRequest "http://127.0.0.1:$hostPort/health/live" -TimeoutSec 2; if ($response.StatusCode -eq 200) { $started = $true; break } } catch { Start-Sleep -Milliseconds 500 }
        }
        if (-not $started) { throw 'Package host never became ready' }
    } finally { Stop-Process -Id $hostProcess.Id -ErrorAction SilentlyContinue }
}
} finally {
    docker rm -f $container *> $null
    foreach ($variable in $variables) { [Environment]::SetEnvironmentVariable($variable, $savedEnvironment[$variable]) }
}
Write-Output 'NuGet artifacts restored, migrated, preserved customization, and started without business references.'
node (Join-Path $repo 'tools/test-frontend-package.mjs') $Version $PreviousVersion
if ($LASTEXITCODE -ne 0) { throw 'Frontend artifact consumer failed' }
