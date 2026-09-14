#Requires -Version 7.0
[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'
$templateRoot = Split-Path -Parent $PSScriptRoot
$moduleRoot = Join-Path $templateRoot 'business-modules'

function Invoke-CheckedCommand {
    param([string]$Command, [string[]]$Arguments)
    & $Command @Arguments
    if ($LASTEXITCODE -ne 0) {
        throw "$Command failed with exit code $LASTEXITCODE. Selection remains saved; fix the failure and retry the build."
    }
}

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    throw 'Install the Node version specified in framework.json before running this script.'
}
if (-not (Test-Path -LiteralPath $moduleRoot -PathType Container)) {
    throw "Clone your private module repository into '$moduleRoot', then rerun this script. The supported layout is template-v4/business-modules/."
}

$available = @(Get-ChildItem -LiteralPath $moduleRoot -Directory | Sort-Object Name | ForEach-Object {
    $descriptorPath = Join-Path $_.FullName 'module.json'
    if (Test-Path -LiteralPath $descriptorPath -PathType Leaf) {
        $descriptor = Get-Content -LiteralPath $descriptorPath -Raw | ConvertFrom-Json
        if ($descriptor.category -cne 'private' -or $descriptor.id -cne $_.Name -or $descriptor.id -cnotmatch '^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$') {
            throw "Invalid module identity in $descriptorPath"
        }
        $descriptor
    }
})
$selectionPath = Join-Path $templateRoot 'client-modules.json'
$current = @(if (Test-Path -LiteralPath $selectionPath) {
    (Get-Content -LiteralPath $selectionPath -Raw | ConvertFrom-Json).privateModules
})

Write-Host 'Choose the complete set of business modules for this installation.'
Write-Host 'This menu changes only private modules; foundation settings in client-modules.json are preserved.'
Write-Host 'Removing a selection preserves source, database tables and migration history.'
Write-Host 'Re-adding it later reconnects to retained data when using the same database.'
for ($index = 0; $index -lt $available.Count; $index++) {
    $module = $available[$index]
    $marker = if ($current -ccontains $module.id) { 'x' } else { ' ' }
    $dependencies = @($module.dependencies) -join ', '
    Write-Host ('{0,3}. [{1}] {2}  (requires: {3})' -f ($index + 1), $marker, $module.id, $dependencies)
}
$missing = @($current | Where-Object { $available.id -cnotcontains $_ })
if ($missing.Count) { Write-Host "Previously selected but no longer available: $($missing -join ', ')" }

while ($true) {
    $answer = (Read-Host 'Enter numbers separated by commas, none to remove all, Enter to keep current, or q to quit').Trim()
    if ($answer -ieq 'q') { return }
    $chosen = @()
    if ($answer -eq '') { $chosen = @($current) }
    elseif ($answer -ine 'none') {
        $tokens = @($answer -split '[,\s]+' | Where-Object { $_ -ne '' })
        $invalid = $false
        foreach ($token in $tokens) {
            $number = 0
            if (-not [int]::TryParse($token, [ref]$number) -or $number -lt 1 -or $number -gt $available.Count) {
                $invalid = $true
                break
            }
            $chosen += $available[$number - 1].id
        }
        if ($invalid) { Write-Host 'Use only numbers from the list, none, or q.'; continue }
        $chosen = @($chosen | Select-Object -Unique)
    }

    $removed = @($current | Where-Object { $chosen -cnotcontains $_ })
    Write-Host "Selected: $(if ($chosen.Count) { $chosen -join ', ' } else { '(foundation only)' })"
    if ($removed.Count) {
        Write-Host "Removed from the next build: $($removed -join ', ')"
        Write-Host 'Existing records remain stored. Resolve outstanding work and retained-data access before deploying removal.'
    }
    if ((Read-Host 'Save this selection? [y/N]') -ine 'y') { continue }

    # The owning generator validates the combined dependency graph before writing anything.
    & node (Join-Path $PSScriptRoot 'select-business-modules.mjs') @chosen
    if ($LASTEXITCODE -eq 0) { break }
    Write-Host 'Selection was not saved. Include required business dependencies or correct the descriptors, then retry.'
}

Write-Host 'Rebuild and deploy all hosts together. This script does not run migrations or change runtime activation.'
if ((Read-Host 'Restore dependencies and build the application now? [y/N]') -ine 'y') { return }

foreach ($command in @('dotnet', 'npm')) {
    if (-not (Get-Command $command -ErrorAction SilentlyContinue)) {
        throw "Install $command using the toolchain specified in framework.json. Your module selection is saved."
    }
}
$manifest = Get-Content -LiteralPath (Join-Path $templateRoot 'framework.json') -Raw | ConvertFrom-Json
Push-Location $templateRoot
try {
    Write-Host 'Stop running development hosts before building. Restore updates dependency locks; retain them with the client release.'
    Invoke-CheckedCommand 'dotnet' @('restore', 'src/TemplateV4.slnx')
    Invoke-CheckedCommand 'npm' @('ci', '--prefix', $manifest.projects.Web)
    Invoke-CheckedCommand 'npm' @('ci', '--prefix', $manifest.projects.Documentation)
    Invoke-CheckedCommand 'dotnet' @('build', 'src/TemplateV4.slnx', '-c', 'Release', '--no-restore')
    Invoke-CheckedCommand 'npm' @('run', 'build', '--prefix', $manifest.projects.Web)
    Write-Host 'Build complete. Deploy fresh outputs, run the Database Migrator, then review Administration > Modules.'
    Write-Host 'Existing activation choices and data are retained; newly installed modules start disabled.'
}
finally { Pop-Location }
