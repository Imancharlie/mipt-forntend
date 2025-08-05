#!/bin/bash

# MIPT PWA Netlify Deployment Script
# This script automates the deployment process to Netlify

echo "🚀 Starting MIPT PWA deployment to Netlify..."

# Check if Netlify CLI is installed
if ! command -v netlify &> /dev/null; then
    echo "❌ Netlify CLI is not installed. Installing now..."
    npm install -g netlify-cli
fi

# Check if user is logged in to Netlify
if ! netlify status &> /dev/null; then
    echo "🔐 Please log in to Netlify..."
    netlify login
fi

# Build the project
echo "📦 Building MIPT PWA..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please check the errors above."
    exit 1
fi

echo "✅ Build completed successfully!"

# Check if dist directory exists
if [ ! -d "dist" ]; then
    echo "❌ dist directory not found. Build may have failed."
    exit 1
fi

# Check for PWA files
echo "🔍 Checking PWA files..."
if [ ! -f "dist/manifest.webmanifest" ]; then
    echo "⚠️  Warning: manifest.webmanifest not found"
fi

if [ ! -f "dist/sw.js" ]; then
    echo "⚠️  Warning: sw.js not found"
fi

# Deploy to Netlify
echo "🌐 Deploying to Netlify..."
netlify deploy --prod --dir=dist

if [ $? -eq 0 ]; then
    echo "✅ Deployment successful!"
    echo "🎉 Your MIPT PWA is now live on Netlify!"
    echo ""
    echo "📱 PWA Features to test:"
    echo "   - Install prompt should appear in supported browsers"
    echo "   - Offline functionality should work"
    echo "   - Service worker should be registered"
    echo ""
    echo "🔗 Next steps:"
    echo "   1. Test the PWA installation on different devices"
    echo "   2. Run a Lighthouse PWA audit"
    echo "   3. Configure custom domain (optional)"
    echo "   4. Set up analytics (optional)"
else
    echo "❌ Deployment failed. Please check the errors above."
    exit 1
fi 