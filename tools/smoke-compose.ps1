$ErrorActionPreference = 'Stop'
$repository = Split-Path $PSScriptRoot -Parent
$settings = @{}
foreach ($line in Get-Content -LiteralPath (Join-Path $repository '.env')) {
    if ($line -match '^([^#=]+)=(.*)$') { $settings[$Matches[1]] = $Matches[2] }
}
$origin = 'https://localhost:8443'
# Certificate bypass is confined to this local Nginx development smoke test.
$csrf = Invoke-RestMethod "$origin/api/v1/auth/csrf" -SkipCertificateCheck -SessionVariable browserSession
$headers = @{ Origin = $origin; 'X-CSRF-TOKEN' = $csrf.token }
$body = @{ email = $settings.BOOTSTRAP_EMAIL; password = $settings.BOOTSTRAP_PASSWORD; device = 'Compose smoke test' } | ConvertTo-Json
$access = Invoke-RestMethod "$origin/api/v1/auth/login" -Method Post -Body $body -ContentType 'application/json' -Headers $headers -WebSession $browserSession -SkipCertificateCheck
$bearer = @{ Authorization = "Bearer $($access.accessToken)"; 'Idempotency-Key' = [Guid]::NewGuid().ToString() }
$email = "smoke-$([Guid]::NewGuid().ToString('N'))@example.test"
$create = @{ email = $email; displayName = 'Compose test user'; role = 'Reader'; culture = 'af-ZA' } | ConvertTo-Json
$user = Invoke-RestMethod "$origin/api/v1/users" -Method Post -Body $create -ContentType 'application/json' -Headers $bearer -SkipCertificateCheck
$replay = Invoke-RestMethod "$origin/api/v1/users" -Method Post -Body $create -ContentType 'application/json' -Headers $bearer -SkipCertificateCheck
if ($user.id -ne $replay.id) { throw 'Idempotency replay returned another user.' }
$found = $false
for ($attempt = 0; $attempt -lt 30; $attempt++) {
    $messages = Invoke-RestMethod 'http://127.0.0.1:8025/api/v1/messages' -TimeoutSec 5
    if ($messages.messages | Where-Object { ($_.To | ForEach-Object { $_.Address }) -contains $email }) { $found = $true; break }
    Start-Sleep -Milliseconds 500
}
if (!$found) { throw 'Worker did not deliver the invitation to local Mailpit.' }
$bearer['Idempotency-Key'] = [Guid]::NewGuid().ToString()
$completedBefore = [int](docker compose exec -T postgres psql -U templatev4 -d templatev4 -Atc 'SELECT count(*) FROM audit.entries WHERE "Action" = ''job.maintenance.completed'';')
$job = Invoke-RestMethod "$origin/api/v1/jobs/maintenance" -Method Post -Headers $bearer -SkipCertificateCheck
$jobCompleted = $false
for ($attempt = 0; $attempt -lt 20; $attempt++) {
    $completedAfter = [int](docker compose exec -T postgres psql -U templatev4 -d templatev4 -Atc 'SELECT count(*) FROM audit.entries WHERE "Action" = ''job.maintenance.completed'';')
    if ($completedAfter -gt $completedBefore) { $jobCompleted = $true; break }
    Start-Sleep -Milliseconds 500
}
if (!$jobCompleted) { throw 'Quartz accepted the request but did not complete maintenance.' }
$csrf = Invoke-RestMethod "$origin/api/v1/auth/csrf" -Headers $bearer -WebSession $browserSession -SkipCertificateCheck
$headers = @{ Origin = $origin; 'X-CSRF-TOKEN' = $csrf.token; Authorization = $bearer.Authorization }
$null = Invoke-RestMethod "$origin/api/v1/auth/logout" -Method Post -Headers $headers -WebSession $browserSession -SkipCertificateCheck
Write-Output 'Compose smoke passed: login, idempotent invitation, Worker/Mailpit delivery, durable maintenance request, logout.'
