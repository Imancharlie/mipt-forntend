# MIPT Progressive Web App (PWA) Features

## Overview
The MIPT application has been enhanced with Progressive Web App (PWA) capabilities, making it installable on various devices and providing a native app-like experience.

## Features Implemented

### 🔧 **PWA Configuration**
- **Vite PWA Plugin**: Integrated `vite-plugin-pwa` for automatic service worker generation
- **Web App Manifest**: Configured with proper app metadata, icons, and display settings
- **Service Worker**: Automatic caching and offline functionality
- **Responsive Icons**: Multiple icon sizes for different devices and platforms

### 📱 **Installation Support**
- **Automatic Install Prompt**: Shows installation prompt when the app meets PWA criteria
- **Manual Install Guide**: Step-by-step instructions for different platforms
- **Cross-Platform Support**: Works on Android, iOS, and Desktop browsers

### 🎨 **UI Components**
- **PWAInstallPrompt**: Automatic installation prompt component
- **PWAUpdatePrompt**: Update notification when new versions are available
- **PWAInstallGuide**: Manual installation instructions in Settings page

### 🚀 **Technical Features**
- **Offline Support**: Basic offline functionality with cached resources
- **Auto Updates**: Automatic service worker updates with user notification
- **Responsive Design**: Optimized for mobile and desktop installation
- **Theme Integration**: PWA components follow the app's theme system

## Installation Instructions

### Android (Chrome)
1. Open Chrome browser
2. Tap the menu (⋮) in the top right
3. Tap "Add to Home screen" or "Install app"
4. Tap "Add" to confirm

### iOS (Safari)
1. Open Safari browser
2. Tap the Share button (square with arrow)
3. Scroll down and tap "Add to Home Screen"
4. Tap "Add" to confirm

### Desktop (Chrome/Edge)
1. Open Chrome or Edge browser
2. Click the install icon (➕) in the address bar
3. Click "Install" in the popup
4. The app will be added to your desktop

## Benefits

### For Users
- **Quick Access**: Install on home screen for instant access
- **Offline Functionality**: Basic features work without internet
- **Native Experience**: App-like interface and behavior
- **Faster Loading**: Cached resources for improved performance

### For Developers
- **Automatic Updates**: Service worker handles updates seamlessly
- **Cross-Platform**: Single codebase works on all platforms
- **SEO Friendly**: Better search engine optimization
- **Analytics**: Track installation and usage metrics

## Technical Details

### Generated Files
- `manifest.webmanifest`: App configuration and metadata
- `sw.js`: Service worker for caching and offline functionality
- `registerSW.js`: Service worker registration script
- Various icon files: `pwa-192x192.png`, `pwa-512x512.png`, etc.

### Caching Strategy
- **Static Assets**: CSS, JS, images cached for offline use
- **Fonts**: Google Fonts cached for better performance
- **API Calls**: Network-first strategy for dynamic data

### Browser Support
- **Chrome**: Full PWA support
- **Edge**: Full PWA support
- **Firefox**: Basic PWA support
- **Safari**: Limited PWA support (iOS only)

## Development Commands

```bash
# Generate PWA icons
npm run generate-pwa-icons

# Build with PWA features
npm run build

# Preview PWA features
npm run preview
```

## Configuration Files

### `vite.config.ts`
- PWA plugin configuration
- Service worker settings
- Manifest generation

### `index.html`
- PWA meta tags
- Icon links
- Theme color settings

### `public/browserconfig.xml`
- Windows tile configuration
- Microsoft-specific settings

## Future Enhancements

- [ ] Push notifications
- [ ] Background sync
- [ ] Advanced offline features
- [ ] App shortcuts
- [ ] Share API integration
- [ ] Payment integration (if needed)

## Testing PWA Features

1. **Build the app**: `npm run build`
2. **Serve the dist folder**: `npm run preview`
3. **Open in Chrome/Edge**: Navigate to the preview URL
4. **Check installation**: Look for install prompt or use browser menu
5. **Test offline**: Disconnect internet and refresh the app

## Troubleshooting

### Common Issues
- **Install prompt not showing**: Ensure HTTPS and meet PWA criteria
- **Icons not loading**: Check file paths in manifest
- **Service worker errors**: Clear browser cache and reload
- **Build errors**: Check PWA plugin configuration

### Debug Tools
- Chrome DevTools: Application tab for PWA debugging
- Lighthouse: PWA audit and scoring
- Browser console: Service worker logs 