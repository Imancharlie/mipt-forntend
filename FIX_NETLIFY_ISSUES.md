# 🔧 Fix Netlify Deployment Issues

## 🚨 **Current Issues:**

1. **PWA Icon Error**: `apple-touch-icon.png` not found (404)
2. **API Error**: Trying to fetch from wrong URL (`maipt.netlify.app/api` instead of backend)

## ✅ **Solution Steps:**

### **Step 1: Fix API URL Configuration**

**The Problem:** Your API is trying to fetch from `https://maipt.netlify.app/api/auth/login/` which is wrong. Your API should point to your backend server.

**The Solution:** Set the correct API URL in Netlify environment variables.

#### **Method A: Netlify Dashboard (Recommended)**
1. Go to [netlify.com](https://netlify.com)
2. Sign in and select your MIPT project
3. Go to **Site settings** → **Environment variables**
4. Add/edit `VITE_API_URL`:

```bash
# For Railway backend
VITE_API_URL=https://your-app.railway.app/api

# For Render backend
VITE_API_URL=https://your-app.onrender.com/api

# For Heroku backend
VITE_API_URL=https://your-app.herokuapp.com/api

# For custom domain backend
VITE_API_URL=https://api.yourdomain.com/api
```

#### **Method B: Netlify CLI**
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login and set API URL
netlify login
netlify env:set VITE_API_URL "https://your-backend-url.com/api"

# Verify the setting
netlify env:get VITE_API_URL
```

### **Step 2: Fix PWA Icons**

**The Problem:** PWA icons are placeholder files causing 404 errors.

**The Solution:** Create proper PNG icons or temporarily remove problematic icons.

#### **Option A: Create Simple Icons (Quick Fix)**
```bash
# Run the icon generation script
node scripts/create-simple-icons.js
```

#### **Option B: Use Online Icon Generator**
1. Go to [favicon.io](https://favicon.io/) or [realfavicongenerator.net](https://realfavicongenerator.net/)
2. Upload your app logo
3. Download the generated icons
4. Replace the files in `public/` folder

#### **Option C: Temporarily Remove Problematic Icons**
I've already updated your `manifest.webmanifest` to remove the problematic icons. The PWA will still work with just the main icons.

### **Step 3: Test the Fix**

#### **Test API Configuration:**
```javascript
// In browser console on your Netlify site
console.log('API URL:', import.meta.env.VITE_API_URL);

// Test API connection
fetch('/api/auth/profile/')
  .then(response => response.json())
  .then(data => console.log('API working:', data))
  .catch(error => console.error('API error:', error));
```

#### **Test PWA Icons:**
```javascript
// Check if icons load
fetch('/pwa-192x192.png')
  .then(response => console.log('Icon loaded:', response.status))
  .catch(error => console.error('Icon error:', error));
```

## 🔍 **Debugging Commands**

### **Check Current Configuration:**
```bash
# List environment variables
netlify env:list

# Get specific variable
netlify env:get VITE_API_URL

# Check build logs
netlify deploy:list
```

### **Test API Endpoints:**
```bash
# Test your backend directly
curl https://your-backend-url.com/api/auth/profile/

# Test from Netlify
curl https://maipt.netlify.app/api/auth/profile/
```

## 🛠️ **Common Backend URLs**

### **Railway:**
```bash
VITE_API_URL=https://your-app.railway.app/api
```

### **Render:**
```bash
VITE_API_URL=https://your-app.onrender.com/api
```

### **Heroku:**
```bash
VITE_API_URL=https://your-app.herokuapp.com/api
```

### **DigitalOcean:**
```bash
VITE_API_URL=https://your-droplet-ip/api
```

### **Custom Domain:**
```bash
VITE_API_URL=https://api.yourdomain.com/api
```

## 📝 **Complete Fix Workflow**

### **Step 1: Set API URL**
```bash
# Via CLI
netlify env:set VITE_API_URL "https://your-backend-url.com/api"

# Or via Dashboard
# Go to Site settings → Environment variables
# Add VITE_API_URL = https://your-backend-url.com/api
```

### **Step 2: Fix Icons**
```bash
# Option A: Generate simple icons
node scripts/create-simple-icons.js

# Option B: Upload proper icons to public/ folder
# Replace apple-touch-icon.png, pwa-192x192.png, etc.
```

### **Step 3: Deploy Changes**
```bash
# Commit and push changes
git add .
git commit -m "Fix API URL and PWA icons"
git push origin main

# Or deploy manually
netlify deploy --prod
```

### **Step 4: Verify Fix**
```bash
# Check environment variables
netlify env:list

# Test the live site
# Visit https://maipt.netlify.app
# Open browser console and check for errors
```

## 🎯 **Expected Results**

After fixing:

1. **✅ API Calls**: Should go to your backend URL, not Netlify
2. **✅ PWA Icons**: Should load without 404 errors
3. **✅ Login**: Should work with your backend
4. **✅ PWA Install**: Should work properly

## 🔍 **Troubleshooting**

### **If API still doesn't work:**
1. Check your backend is running
2. Verify CORS settings on backend
3. Test backend URL directly
4. Check Netlify environment variables

### **If icons still don't work:**
1. Clear browser cache
2. Check if icon files exist in public/ folder
3. Verify icon file sizes are correct
4. Use browser dev tools to check network requests

### **If PWA doesn't install:**
1. Check manifest.webmanifest is valid
2. Verify service worker is registered
3. Test on HTTPS (required for PWA)
4. Check browser console for errors

## 📊 **Monitoring**

### **Check Netlify Logs:**
```bash
# View deployment logs
netlify deploy:list

# Check function logs
netlify functions:list
```

### **Browser Console Checks:**
```javascript
// Check API URL
console.log('API URL:', import.meta.env.VITE_API_URL);

// Check PWA status
console.log('SW registered:', 'serviceWorker' in navigator);
console.log('Manifest:', document.querySelector('link[rel="manifest"]'));

// Test API connection
fetch('/api/auth/profile/')
  .then(r => r.json())
  .then(d => console.log('API OK:', d))
  .catch(e => console.error('API Error:', e));
```

## 🎉 **Success Indicators**

You'll know it's fixed when:

- ✅ No more 404 errors for icons
- ✅ API calls go to your backend (not Netlify)
- ✅ Login works properly
- ✅ PWA install prompt appears
- ✅ App works offline (basic functionality)

**Remember:** After changing environment variables, Netlify automatically redeploys your site! 🚀 