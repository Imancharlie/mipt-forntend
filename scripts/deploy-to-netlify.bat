@echo off
REM MIPT PWA Netlify Deployment Script for Windows
REM This script automates the deployment process to Netlify

echo 🚀 Starting MIPT PWA deployment to Netlify...

REM Check if Netlify CLI is installed
netlify --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Netlify CLI is not installed. Installing now...
    npm install -g netlify-cli
)

REM Check if user is logged in to Netlify
netlify status >nul 2>&1
if %errorlevel% neq 0 (
    echo 🔐 Please log in to Netlify...
    netlify login
)

REM Build the project
echo 📦 Building MIPT PWA...
npm run build

if %errorlevel% neq 0 (
    echo ❌ Build failed. Please check the errors above.
    exit /b 1
)

echo ✅ Build completed successfully!

REM Check if dist directory exists
if not exist "dist" (
    echo ❌ dist directory not found. Build may have failed.
    exit /b 1
)

REM Check for PWA files
echo 🔍 Checking PWA files...
if not exist "dist\manifest.webmanifest" (
    echo ⚠️  Warning: manifest.webmanifest not found
)

if not exist "dist\sw.js" (
    echo ⚠️  Warning: sw.js not found
)

REM Deploy to Netlify
echo 🌐 Deploying to Netlify...
netlify deploy --prod --dir=dist

if %errorlevel% equ 0 (
    echo ✅ Deployment successful!
    echo 🎉 Your MIPT PWA is now live on Netlify!
    echo.
    echo 📱 PWA Features to test:
    echo    - Install prompt should appear in supported browsers
    echo    - Offline functionality should work
    echo    - Service worker should be registered
    echo.
    echo 🔗 Next steps:
    echo    1. Test the PWA installation on different devices
    echo    2. Run a Lighthouse PWA audit
    echo    3. Configure custom domain (optional)
    echo    4. Set up analytics (optional)
) else (
    echo ❌ Deployment failed. Please check the errors above.
    exit /b 1
) 