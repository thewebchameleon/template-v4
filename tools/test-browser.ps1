param([switch]$NoBuild)
$ErrorActionPreference = 'Stop'
$repo = Split-Path $PSScriptRoot -Parent
Push-Location $repo
try {
    $env:BOOTSTRAP_EMAIL = 'browser-tests'
    $env:BOOTSTRAP_PASSWORD = 'Browser-test-only!Password942'
    $env:POSTGRES_PASSWORD = 'Browser-database-only!Password942'
    New-Item -ItemType Directory -Force .local | Out-Null
    if (-not (Test-Path .local/jwt.pem)) { & openssl genrsa -out .local/jwt.pem 3072 }
    if (-not (Test-Path .local/web.pem) -or -not (Test-Path .local/web.key)) {
        & dotnet dev-certs https --export-path .local/web.pem --format Pem --no-password
    }
    $buildOption = if ($NoBuild) { '--no-build' } else { '--build' }
    docker compose -p templatev4-e2e -f compose.yaml -f compose.e2e.yaml up $buildOption -d --scale api=1 --scale worker=2
    if ($LASTEXITCODE -ne 0) { throw 'Browser stack failed to start' }
    $bootstrapToken = $null
    for ($attempt = 0; $attempt -lt 60 -and -not $bootstrapToken; $attempt++) {
        $apiLogs = docker compose -p templatev4-e2e -f compose.yaml -f compose.e2e.yaml logs --no-color api 2>$null
        $match = [regex]::Match(($apiLogs -join "`n"), 'Administrator bootstrap token: ([A-F0-9]{64})')
        if ($match.Success) { $bootstrapToken = $match.Groups[1].Value } else { Start-Sleep -Seconds 1 }
    }
    if (-not $bootstrapToken) { throw 'Administrator bootstrap token was not produced' }
    $csrf = Invoke-RestMethod -Uri 'https://localhost:9443/api/v1/auth/csrf' -SkipCertificateCheck -SessionVariable browserSession
    $bootstrapBody = @{ token = $bootstrapToken; username = $env:BOOTSTRAP_EMAIL; password = $env:BOOTSTRAP_PASSWORD } | ConvertTo-Json
    Invoke-RestMethod -Uri 'https://localhost:9443/api/v1/bootstrap' -Method Post -SkipCertificateCheck -WebSession $browserSession -Headers @{ Origin = 'https://localhost:9443'; 'X-CSRF-TOKEN' = $csrf.token } -ContentType 'application/json' -Body $bootstrapBody | Out-Null
    docker compose -p templatev4-e2e -f compose.yaml -f compose.e2e.yaml up -d --scale api=2 --scale worker=2
    if ($LASTEXITCODE -ne 0) { throw 'Browser stack failed to scale after bootstrap' }
    Push-Location src/TemplateV4.Angular
    try {
        node node_modules/@playwright/test/cli.js test
        if ($LASTEXITCODE -ne 0) { throw 'Browser tests failed' }
    } finally { Pop-Location }
} finally {
    Remove-Item Env:\BOOTSTRAP_EMAIL, Env:\BOOTSTRAP_PASSWORD, Env:\POSTGRES_PASSWORD -ErrorAction SilentlyContinue
    docker compose -p templatev4-e2e -f compose.yaml -f compose.e2e.yaml down -v
    Pop-Location
}
