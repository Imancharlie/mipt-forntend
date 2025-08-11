# Setup Production Backend Configuration
# This script helps configure your local frontend to use the production backend

Write-Host "🚀 Setting up Production Backend Configuration..." -ForegroundColor Green
Write-Host ""

# Production backend URL
$PRODUCTION_API_URL = "https://mipt.pythonanywhere.com/api"

# Check if .env.local exists
$envLocalPath = Join-Path $PWD ".env.local"
$envPath = Join-Path $PWD ".env"

Write-Host "📋 Current Configuration:" -ForegroundColor Yellow
Write-Host "   Production Backend: $PRODUCTION_API_URL"
Write-Host "   Environment File: $(if (Test-Path $envLocalPath) { '.env.local' } else { '.env' })"
Write-Host ""

# Create environment configuration
$envContent = @"
# Production Backend Configuration
# This file configures your local frontend to use the production backend
VITE_API_URL=$PRODUCTION_API_URL
VITE_APP_TITLE=MIPT - Industrial Training Reports (Production Backend)
VITE_APP_DESCRIPTION=Industrial Practical Training Report System
VITE_APP_VERSION=1.0.0
VITE_PWA_ENABLED=true

# Backend Information:
# - Production URL: $PRODUCTION_API_URL
# - Local Fallback: http://127.0.0.1:8000/api (if VITE_API_URL is not set)
"@

# Try to create .env.local first, fallback to .env
$targetFile = $envLocalPath
if (-not (Test-Path $envLocalPath)) {
    $targetFile = $envPath
}

try {
    $envContent | Out-File -FilePath $targetFile -Encoding UTF8
    Write-Host "✅ Configuration saved to: $(Split-Path $targetFile -Leaf)" -ForegroundColor Green
    Write-Host "   Full path: $targetFile" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Error creating environment file: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "📝 Manual Setup Required:" -ForegroundColor Yellow
    Write-Host "   1. Create a file named: $(Split-Path $targetFile -Leaf)" -ForegroundColor White
    Write-Host "   2. Add this content:" -ForegroundColor White
    Write-Host "      VITE_API_URL=$PRODUCTION_API_URL" -ForegroundColor White
    Write-Host "   3. Restart your development server" -ForegroundColor White
    exit 1
}

Write-Host ""
Write-Host "🔧 Next Steps:" -ForegroundColor Yellow
Write-Host "   1. Restart your development server (npm run dev)" -ForegroundColor White
Write-Host "   2. Check the browser console for API configuration logs" -ForegroundColor White
Write-Host "   3. Test login with your production backend credentials" -ForegroundColor White
Write-Host ""
Write-Host "📊 To verify configuration:" -ForegroundColor Yellow
Write-Host "   - Open browser console and look for 'API Client initialized with baseURL'" -ForegroundColor White
Write-Host "   - Should show: $PRODUCTION_API_URL" -ForegroundColor White
Write-Host ""
Write-Host "🔄 To switch back to local backend:" -ForegroundColor Yellow
Write-Host "   - Change VITE_API_URL to: http://127.0.0.1:8000/api" -ForegroundColor White
Write-Host "   - Or delete the environment file to use defaults" -ForegroundColor White
Write-Host ""
Write-Host "🎯 Configuration Complete!" -ForegroundColor Green

