$ErrorActionPreference = 'Stop'
$repo = Split-Path $PSScriptRoot -Parent
$output = Join-Path $repo 'artifacts/packages'
$consumer = Join-Path $repo 'artifacts/package-consumer'
dotnet pack (Join-Path $repo 'src/Framework.Core') -c Release -o $output
if ($LASTEXITCODE -ne 0) { throw 'Package build failed' }
New-Item -ItemType Directory -Force -Path $consumer | Out-Null
@'
<Project Sdk="Microsoft.NET.Sdk"><PropertyGroup><ManagePackageVersionsCentrally>false</ManagePackageVersionsCentrally><TargetFramework>net10.0</TargetFramework><OutputType>Exe</OutputType><ImplicitUsings>enable</ImplicitUsings></PropertyGroup><ItemGroup><PackageReference Include="templatev4.Framework.Core" Version="0.1.0" /></ItemGroup></Project>
'@ | Set-Content (Join-Path $consumer 'Consumer.csproj')
@'
using templatev4.Application;
var result = Result<int>.Success(42);
if (!result.IsSuccess || result.Value != 42) throw new Exception("Package contract failed");
Console.WriteLine("Independent package consumer passed");
'@ | Set-Content (Join-Path $consumer 'Program.cs')
"<configuration><packageSources><clear/><add key=`"local`" value=`"$output`"/></packageSources><packageSourceMapping><clear/></packageSourceMapping></configuration>" | Set-Content (Join-Path $consumer 'NuGet.Config')
dotnet restore (Join-Path $consumer 'Consumer.csproj') --configfile (Join-Path $consumer 'NuGet.Config')
if ($LASTEXITCODE -ne 0) { throw 'Package consumer restore failed' }
dotnet run --project (Join-Path $consumer 'Consumer.csproj') --no-restore
if ($LASTEXITCODE -ne 0) { throw 'Package consumer failed' }
