# 🚀 Netlify Configuration Guide

## 🔧 **How to Edit/Change Configuration on Netlify**

### **Method 1: Netlify Dashboard (Recommended)**

#### **Step 1: Access Environment Variables**
1. Go to [netlify.com](https://netlify.com)
2. Sign in to your account
3. Select your MIPT project site
4. Go to **Site settings** → **Environment variables**

#### **Step 2: Add/Edit Variables**
Click **Add a variable** and set:

```bash
# For production with separate backend
VITE_API_URL=https://your-backend-url.com/api

# For production with same domain
VITE_API_URL=/api

# For Railway backend
VITE_API_URL=https://your-app.railway.app/api

# For Render backend
VITE_API_URL=https://your-app.onrender.com/api

# Other variables
VITE_APP_TITLE=MIPT - Industrial Training Reports
VITE_APP_DESCRIPTION=Industrial Practical Training Report System
VITE_APP_VERSION=1.0.0
VITE_PWA_ENABLED=true
```

### **Method 2: Netlify CLI (Command Line)**

#### **Install Netlify CLI:**
```bash
npm install -g netlify-cli
```

#### **Login and Configure:**
```bash
# Login to Netlify
netlify login

# Link your project (if not already linked)
netlify link

# Set environment variables
netlify env:set VITE_API_URL "https://your-backend-url.com/api"
netlify env:set VITE_APP_TITLE "MIPT - Industrial Training Reports"
netlify env:set VITE_PWA_ENABLED "true"

# List current variables
netlify env:list

# Get a specific variable
netlify env:get VITE_API_URL

# Delete a variable
netlify env:unset VITE_API_URL
```

### **Method 3: netlify.toml File**

Edit your `netlify.toml` file:

```toml
[build.environment]
  NODE_VERSION = "18"
  # API Configuration - Change these values for your backend
  VITE_API_URL = "/api"
  VITE_APP_TITLE = "MIPT - Industrial Training Reports"
  VITE_APP_DESCRIPTION = "Industrial Practical Training Report System"
  VITE_APP_VERSION = "1.0.0"
  VITE_PWA_ENABLED = "true"

# Environment-specific configurations
[context.production.environment]
  VITE_API_URL = "/api"
  VITE_APP_TITLE = "MIPT - Industrial Training Reports"

[context.deploy-preview.environment]
  VITE_API_URL = "/api"
  VITE_APP_TITLE = "MIPT - Industrial Training Reports (Preview)"

[context.branch-deploy.environment]
  VITE_API_URL = "/api"
  VITE_APP_TITLE = "MIPT - Industrial Training Reports (Branch)"
```

## 🌐 **Common Backend Hosting Configurations**

### **1. Railway Backend**
```bash
# Set in Netlify Dashboard
VITE_API_URL=https://your-app.railway.app/api

# Or via CLI
netlify env:set VITE_API_URL "https://your-app.railway.app/api"
```

### **2. Render Backend**
```bash
# Set in Netlify Dashboard
VITE_API_URL=https://your-app.onrender.com/api

# Or via CLI
netlify env:set VITE_API_URL "https://your-app.onrender.com/api"
```

### **3. Heroku Backend**
```bash
# Set in Netlify Dashboard
VITE_API_URL=https://your-app.herokuapp.com/api

# Or via CLI
netlify env:set VITE_API_URL "https://your-app.herokuapp.com/api"
```

### **4. Same Domain (Recommended for PWA)**
```bash
# Set in Netlify Dashboard
VITE_API_URL=/api

# Or via CLI
netlify env:set VITE_API_URL "/api"
```

### **5. Custom Domain Backend**
```bash
# Set in Netlify Dashboard
VITE_API_URL=https://api.yourdomain.com/api

# Or via CLI
netlify env:set VITE_API_URL "https://api.yourdomain.com/api"
```

## 🔄 **Deployment Workflow**

### **Step 1: Set Environment Variables**
```bash
# Via CLI
netlify env:set VITE_API_URL "https://your-backend-url.com/api"

# Or via Dashboard
# Go to Site settings → Environment variables
```

### **Step 2: Deploy Changes**
```bash
# Deploy to Netlify
git add .
git commit -m "Update API configuration"
git push origin main

# Or deploy manually
netlify deploy --prod
```

### **Step 3: Verify Configuration**
```bash
# Check environment variables
netlify env:list

# Test the live site
# Visit your Netlify URL and check browser console
console.log('API URL:', import.meta.env.VITE_API_URL);
```

## 🔍 **Testing Your Configuration**

### **1. Check Environment Variables**
```bash
# List all variables
netlify env:list

# Get specific variable
netlify env:get VITE_API_URL
```

### **2. Test in Browser Console**
```javascript
// On your live Netlify site
console.log('API URL:', import.meta.env.VITE_API_URL);
console.log('App Title:', import.meta.env.VITE_APP_TITLE);
```

### **3. Test API Connection**
```javascript
// Test API endpoint
fetch('/api/auth/profile/')
  .then(response => response.json())
  .then(data => console.log('API working:', data))
  .catch(error => console.error('API error:', error));
```

## 🛠️ **Environment-Specific Configurations**

### **Production Environment**
```bash
# Set in Netlify Dashboard
VITE_API_URL=https://your-production-backend.com/api
VITE_APP_TITLE=MIPT - Industrial Training Reports
VITE_PWA_ENABLED=true
```

### **Preview/Development Environment**
```bash
# Set in Netlify Dashboard
VITE_API_URL=https://your-dev-backend.com/api
VITE_APP_TITLE=MIPT - Industrial Training Reports (Dev)
VITE_PWA_ENABLED=true
```

### **Branch Deployments**
```bash
# Set in netlify.toml
[context.branch-deploy.environment]
  VITE_API_URL = "https://your-staging-backend.com/api"
  VITE_APP_TITLE = "MIPT - Industrial Training Reports (Staging)"
```

## 🔒 **Security Best Practices**

### **1. Environment Variables**
- ✅ Use environment variables for sensitive data
- ✅ Never commit API keys to git
- ✅ Use different backends for different environments

### **2. CORS Configuration**
```python
# Backend CORS settings (Django)
CORS_ALLOWED_ORIGINS = [
    "https://your-netlify-site.netlify.app",
    "https://yourdomain.com",
]
```

### **3. HTTPS Only**
```bash
# Ensure all URLs use HTTPS
VITE_API_URL=https://your-backend-url.com/api
```

## 📊 **Monitoring and Debugging**

### **1. Netlify Function Logs**
```bash
# View function logs
netlify functions:list
netlify functions:invoke function-name
```

### **2. Build Logs**
```bash
# View build logs
netlify sites:list
netlify deploy:list
```

### **3. Environment Variable Debugging**
```bash
# Check current variables
netlify env:list

# Test specific variable
netlify env:get VITE_API_URL
```

## 🚀 **Quick Setup Commands**

### **Complete Setup Script:**
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Link your project
netlify link

# Set environment variables
netlify env:set VITE_API_URL "https://your-backend-url.com/api"
netlify env:set VITE_APP_TITLE "MIPT - Industrial Training Reports"
netlify env:set VITE_PWA_ENABLED "true"

# Deploy
netlify deploy --prod

# Verify
netlify env:list
```

### **Update Configuration:**
```bash
# Update API URL
netlify env:set VITE_API_URL "https://new-backend-url.com/api"

# Redeploy
netlify deploy --prod
```

## 📝 **Common Issues and Solutions**

### **Issue 1: Environment Variables Not Working**
```bash
# Solution: Check variable names
netlify env:list
# Ensure variables start with VITE_
```

### **Issue 2: CORS Errors**
```bash
# Solution: Update backend CORS settings
# Add your Netlify domain to allowed origins
```

### **Issue 3: Build Failures**
```bash
# Solution: Check build logs
netlify deploy:list
# Ensure all required variables are set
```

## 🎯 **Summary**

**To edit/change configuration on Netlify:**

1. **Dashboard Method** (Easiest):
   - Go to Site settings → Environment variables
   - Add/edit variables
   - Redeploy automatically

2. **CLI Method** (Advanced):
   - Use `netlify env:set` commands
   - More control and automation

3. **File Method** (Version Control):
   - Edit `netlify.toml`
   - Commit and push changes

**Most Common Changes:**
- `VITE_API_URL` - Point to your backend
- `VITE_APP_TITLE` - Change app title
- `VITE_PWA_ENABLED` - Enable/disable PWA features

**Remember:** After changing environment variables, your site will automatically redeploy! 🚀 