# Backend Environment Fix Script

Write-Host "🔧 Fixing Backend Environment Variables..." -ForegroundColor Cyan

$envFile = ".env"
$envContent = Get-Content $envFile -Raw

# Check and fix JWT_SECRET
if ($envContent -match 'JWT_SECRET="supersecretjwt"') {
    Write-Host "⚠️  JWT_SECRET is too short (must be at least 32 characters)" -ForegroundColor Yellow
    $newSecret = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 40 | ForEach-Object {[char]$_})
    $envContent = $envContent -replace 'JWT_SECRET="supersecretjwt"', "JWT_SECRET=$newSecret"
    Write-Host "✅ Generated new JWT_SECRET (40 characters)" -ForegroundColor Green
}

# Check and add JWT_ACCESS_EXPIRES_IN if missing
if ($envContent -notmatch 'JWT_ACCESS_EXPIRES_IN') {
    Write-Host "⚠️  JWT_ACCESS_EXPIRES_IN is missing" -ForegroundColor Yellow
    $envContent = $envContent -replace '(JWT_SECRET=.+)', "`$1`nJWT_ACCESS_EXPIRES_IN=7d"
    Write-Host "✅ Added JWT_ACCESS_EXPIRES_IN=7d" -ForegroundColor Green
}

# Save updated content
Set-Content -Path $envFile -Value $envContent

Write-Host "`n✨ Environment file updated successfully!" -ForegroundColor Green
Write-Host "📝 Please review the .env file and update DATABASE_URL if needed." -ForegroundColor Cyan
