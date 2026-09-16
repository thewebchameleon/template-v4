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
await FoundationHost.Run(args);
'@ | Set-Content (Join-Path $fixture 'Program.cs')
foreach ($release in @($PreviousVersion, $Version) | Where-Object { $_ }) {
    "<Project Sdk=`"Microsoft.NET.Sdk.Web`"><PropertyGroup><TargetFramework>net10.0</TargetFramework><ImplicitUsings>enable</ImplicitUsings><Nullable>enable</Nullable></PropertyGroup><ItemGroup><PackageReference Include=`"TemplateV4.Http`" Version=`"$release`" /></ItemGroup></Project>" | Set-Content (Join-Path $fixture 'Consumer.csproj')
    dotnet restore (Join-Path $fixture 'Consumer.csproj') --configfile (Join-Path $fixture 'NuGet.Config') --packages (Join-Path $fixture 'packages')
    if ($LASTEXITCODE -ne 0) { throw 'Artifact consumer restore failed' }
    dotnet build (Join-Path $fixture 'Consumer.csproj') --no-restore
    if ($LASTEXITCODE -ne 0) { throw 'Artifact consumer build failed' }
    $assets = Get-Content (Join-Path $fixture 'obj/project.assets.json') -Raw | ConvertFrom-Json
    if ($assets.libraries.PSObject.Properties.Value | Where-Object { $_.type -eq 'project' }) { throw 'Project-reference fallback detected' }
}
Write-Output 'NuGet artifacts restored and built without project-reference fallback.'
node (Join-Path $repo 'tools/test-frontend-package.mjs') $Version $PreviousVersion
if ($LASTEXITCODE -ne 0) { throw 'Frontend artifact consumer failed' }
