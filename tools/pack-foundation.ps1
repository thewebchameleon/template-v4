param([string]$Version = '0.2.0')
$ErrorActionPreference = 'Stop'
if ($Version -notmatch '^\d+\.\d+\.\d+(-[a-zA-Z0-9.-]+)?$') { throw 'Invalid semantic version' }
$repo = Split-Path $PSScriptRoot -Parent
$manifest = Get-Content (Join-Path $repo 'framework.json') -Raw | ConvertFrom-Json
$output = Join-Path $repo "artifacts/packages/$Version"
New-Item -ItemType Directory -Force -Path $output | Out-Null
foreach ($package in $manifest.packages.PSObject.Properties) {
    dotnet pack (Join-Path $repo $package.Value) -c Release -o $output "-p:Version=$Version" --no-restore
    if ($LASTEXITCODE -ne 0) { throw "Packing $($package.Name) failed" }
}
node (Join-Path $repo 'tools/discover-business-modules.mjs')
if ($LASTEXITCODE -ne 0) { throw 'Business module discovery failed' }
$env:FOUNDATION_PACKAGE_VERSION = $Version
try {
    node (Join-Path $repo 'tools/build-frontend-package.mjs')
    if ($LASTEXITCODE -ne 0) { throw 'Angular package build failed' }
    npm pack (Join-Path $repo 'src/TemplateV4.Angular/dist/foundation') --pack-destination $output
    if ($LASTEXITCODE -ne 0) { throw 'npm pack failed' }
} finally { Remove-Item Env:FOUNDATION_PACKAGE_VERSION -ErrorAction SilentlyContinue }
