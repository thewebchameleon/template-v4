param(
    [Parameter(Mandatory)][string]$BackupPath,
    [string]$ReportPath = '.local/restore-report.json'
)
$ErrorActionPreference = 'Stop'
$backup = (Resolve-Path -LiteralPath $BackupPath).Path
if (-not (Test-Path -LiteralPath $backup -PathType Leaf)) { throw 'Select a PostgreSQL custom-format backup file.' }
$container = 'templatev4-restore-' + [guid]::NewGuid().ToString('N')
$timer = [Diagnostics.Stopwatch]::StartNew()
function Invoke-DockerChecked {
    param([string[]]$Arguments)
    $result = & docker @Arguments
    if ($LASTEXITCODE -ne 0) { throw "Restore operation failed (exit $LASTEXITCODE)." }
    return $result
}
try {
    # No ports, network or production connection; the new container is the only restore target.
    Invoke-DockerChecked @('run', '--detach', '--name', $container, '--network', 'none', '--label', 'templatev4.restore-drill=true', '--env', 'POSTGRES_HOST_AUTH_METHOD=trust', '--env', 'POSTGRES_DB=restore_drill', '--mount', "type=bind,source=$backup,target=/backup.dump,readonly", 'postgres:18.6-alpine') | Out-Null
    $ready = $false
    for ($attempt = 0; $attempt -lt 30; $attempt++) {
        & docker exec $container pg_isready -U postgres -d restore_drill *> $null
        if ($LASTEXITCODE -eq 0) { $ready = $true; break }
        Start-Sleep -Seconds 1
    }
    if (-not $ready) { throw 'The isolated restore database did not start.' }
    Invoke-DockerChecked @('exec', $container, 'pg_restore', '--exit-on-error', '--no-owner', '--no-privileges', '--username=postgres', '--dbname=restore_drill', '/backup.dump') | Out-Null
    $sql = 'SELECT count(*) FROM app.migrations; SELECT count(*) FROM app.users; SELECT count(*) FROM identity.sessions; SELECT count(*) FROM messaging.outbox; SELECT count(*) FROM quartz.qrtz_job_details; SELECT count(*) FROM app.files;'
    $counts = @(Invoke-DockerChecked @('exec', $container, 'psql', '-U', 'postgres', '-d', 'restore_drill', '-v', 'ON_ERROR_STOP=1', '-At', '-c', $sql))
    if ($counts.Count -ne 6 -or [int]$counts[0] -eq 0) { throw 'Restored schema validation failed.' }
    $report = [ordered]@{ checkedAt = [DateTimeOffset]::UtcNow; databaseRestoreSeconds = [math]::Round($timer.Elapsed.TotalSeconds, 2); databaseRestoreSucceeded = $true; migrations = [int]$counts[0]; profileRows = [long]$counts[1]; sessionRows = [long]$counts[2]; outboxRows = [long]$counts[3]; quartzJobRows = [long]$counts[4]; fileRows = [long]$counts[5]; authenticationVerified = $false; queuedJobVerified = $false; objectStorageVerified = $false }
    $reportFile = [IO.Path]::GetFullPath($ReportPath)
    [IO.Directory]::CreateDirectory([IO.Path]::GetDirectoryName($reportFile)) | Out-Null
    $report | ConvertTo-Json | Set-Content -LiteralPath $reportFile
    Write-Output "Database restore verified in $($report.databaseRestoreSeconds) seconds. Report: $reportFile"
    Write-Output 'A full recovery drill still needs restored keys, authentication, a queued job and object-storage verification.'
}
finally {
    $label = & docker inspect --format '{{index .Config.Labels "templatev4.restore-drill"}}' $container 2>$null
    if ($LASTEXITCODE -eq 0 -and $label -eq 'true' -and $container -match '^templatev4-restore-[a-f0-9]{32}$') { & docker rm --force --volumes $container | Out-Null }
}
