param([switch]$NoBuild)
$ErrorActionPreference = 'Stop'
$repo = Split-Path $PSScriptRoot -Parent
Push-Location $repo
try {
    $env:BOOTSTRAP_EMAIL = 'browser-tests@example.test'
    $env:BOOTSTRAP_PASSWORD = 'Browser-test-only!Password942'
    $env:POSTGRES_PASSWORD = 'Browser-database-only!Password942'
    $buildOption = if ($NoBuild) { '--no-build' } else { '--build' }
    docker compose -p templatev4-e2e -f compose.yaml -f compose.e2e.yaml up $buildOption -d --scale api=2 --scale worker=2
    if ($LASTEXITCODE -ne 0) { throw 'Browser stack failed to start' }
    Push-Location src/Web
    try {
        node node_modules/@playwright/test/cli.js test
        if ($LASTEXITCODE -ne 0) { throw 'Browser tests failed' }
    } finally { Pop-Location }
} finally {
    docker compose -p templatev4-e2e -f compose.yaml -f compose.e2e.yaml down -v
    Pop-Location
}
