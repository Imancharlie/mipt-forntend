# Netlify Deployment Guide for MIPT PWA

## Overview
This guide will help you deploy your MIPT Progressive Web App to Netlify with proper PWA support and optimization.

## Prerequisites

1. **Netlify Account**: Sign up at [netlify.com](https://netlify.com)
2. **Git Repository**: Your MIPT project should be in a Git repository (GitHub, GitLab, or Bitbucket)
3. **Node.js**: Ensure you have Node.js 18+ installed locally

## Deployment Steps

### Method 1: Deploy via Netlify UI (Recommended)

1. **Connect Repository**
   - Go to [app.netlify.com](https://app.netlify.com)
   - Click "New site from Git"
   - Choose your Git provider (GitHub, GitLab, Bitbucket)
   - Select your MIPT repository

2. **Configure Build Settings**
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
   - **Node version**: `18` (or higher)

3. **Environment Variables** (Optional but recommended)
   ```
   NODE_VERSION=18
   NPM_FLAGS=--legacy-peer-deps
   ```

4. **Deploy**
   - Click "Deploy site"
   - Netlify will automatically build and deploy your PWA

### Method 2: Deploy via Netlify CLI

1. **Install Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

2. **Login to Netlify**
   ```bash
   netlify login
   ```

3. **Build your project**
   ```bash
   npm run build
   ```

4. **Deploy**
   ```bash
   netlify deploy --prod --dir=dist
   ```

## PWA-Specific Configuration

### ✅ **Already Configured**

The following PWA optimizations are already included in your `netlify.toml`:

- **Service Worker Headers**: Proper caching for `sw.js`
- **Manifest Headers**: Correct MIME type for `manifest.webmanifest`
- **Icon Caching**: Long-term caching for PWA icons
- **Security Headers**: PWA security best practices
- **Asset Caching**: Optimized caching for static assets

### 🔧 **Custom Domain Setup**

1. **Add Custom Domain**
   - Go to your site settings in Netlify
   - Navigate to "Domain management"
   - Add your custom domain

2. **SSL Certificate**
   - Netlify provides free SSL certificates automatically
   - HTTPS is required for PWA installation prompts

3. **DNS Configuration**
   - Follow Netlify's DNS setup instructions
   - Ensure HTTPS is enforced

## Environment Variables

### **Production Environment Variables**

Add these in your Netlify site settings:

```
NODE_VERSION=18
NPM_FLAGS=--legacy-peer-deps
VITE_APP_TITLE=MIPT - Industrial Training Reports
VITE_APP_DESCRIPTION=Industrial Practical Training Report System
```

### **Build Environment Variables**

These are automatically set by Netlify:

```
NODE_ENV=production
CI=true
```

## PWA Testing on Netlify

### **1. Lighthouse Audit**
- Open Chrome DevTools
- Go to the "Lighthouse" tab
- Run a PWA audit on your deployed site
- Ensure all PWA criteria are met

### **2. Installation Testing**
- **Chrome/Edge**: Look for install icon in address bar
- **Android**: Use Chrome and check for "Add to Home screen"
- **iOS**: Use Safari and check for "Add to Home Screen"

### **3. Offline Testing**
- Open DevTools → Application → Service Workers
- Check if service worker is registered
- Disconnect internet and refresh the page
- Verify basic functionality works offline

## Performance Optimization

### **Build Optimization**
- ✅ **Code Splitting**: Vite handles this automatically
- ✅ **Tree Shaking**: Unused code is removed
- ✅ **Asset Optimization**: Images and fonts are optimized
- ✅ **Service Worker**: Caching strategy implemented

### **Netlify Optimizations**
- ✅ **CDN**: Global content delivery network
- ✅ **Compression**: Automatic gzip compression
- ✅ **Caching**: Optimized cache headers
- ✅ **HTTPS**: Free SSL certificates

## Monitoring and Analytics

### **Netlify Analytics**
- Enable Netlify Analytics in site settings
- Track page views, unique visitors, and performance

### **PWA Metrics**
- Monitor service worker registration
- Track installation rates
- Monitor offline usage

## Troubleshooting

### **Common Issues**

#### **1. Build Failures**
```bash
# Check build logs
netlify logs

# Test build locally
npm run build
```

#### **2. PWA Not Installing**
- Ensure HTTPS is enabled
- Check manifest.webmanifest is accessible
- Verify service worker is registered
- Test on supported browsers (Chrome, Edge, Safari)

#### **3. Service Worker Issues**
```javascript
// Check service worker registration
navigator.serviceWorker.getRegistrations().then(registrations => {
  console.log('SW registrations:', registrations);
});
```

#### **4. Cache Issues**
- Clear browser cache
- Check Netlify cache headers
- Verify asset paths in manifest

### **Debug Commands**

```bash
# Check build output
npm run build && ls -la dist/

# Test service worker
curl -I https://your-site.netlify.app/sw.js

# Check manifest
curl -I https://your-site.netlify.app/manifest.webmanifest
```

## Advanced Configuration

### **Custom Headers**
Additional headers can be added to `netlify.toml`:

```toml
[[headers]]
  for = "/api/*"
  [headers.values]
    Access-Control-Allow-Origin = "*"
    Access-Control-Allow-Methods = "GET, POST, PUT, DELETE"
```

### **Redirects**
Add custom redirects if needed:

```toml
[[redirects]]
  from = "/old-page"
  to = "/new-page"
  status = 301
```

### **Functions**
For serverless functions (if needed):

```toml
[functions]
  directory = "netlify/functions"
```

## Post-Deployment Checklist

- [ ] **HTTPS Enabled**: Site loads over HTTPS
- [ ] **PWA Audit**: Lighthouse PWA score > 90
- [ ] **Installation Works**: Can install on supported devices
- [ ] **Offline Functionality**: Basic features work offline
- [ ] **Performance**: Page load time < 3 seconds
- [ ] **Cross-Browser**: Works on Chrome, Edge, Safari
- [ ] **Mobile Responsive**: Works on mobile devices
- [ ] **Analytics**: Tracking is working
- [ ] **Error Monitoring**: Set up error tracking

## Support

### **Netlify Support**
- [Netlify Documentation](https://docs.netlify.com/)
- [Netlify Community](https://community.netlify.com/)
- [Netlify Status](https://status.netlify.com/)

### **PWA Resources**
- [PWA Documentation](https://web.dev/progressive-web-apps/)
- [Lighthouse PWA Audit](https://developers.google.com/web/tools/lighthouse)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)

## Deployment URL

Once deployed, your site will be available at:
- **Netlify URL**: `https://your-site-name.netlify.app`
- **Custom Domain**: `https://your-domain.com` (if configured)

Your MIPT PWA is now ready for production use! 🚀 