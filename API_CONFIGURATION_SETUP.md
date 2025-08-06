# 🔧 API Configuration Setup Guide

## 🎯 **Your Configuration Plan:**

1. **Local Development**: `http://127.0.0.1:8000/api`
2. **Production**: `https://mipt.pythonanywhere.com/api`

## 🚀 **Step 1: Local Development Setup**

### **Option A: Environment File (Recommended)**

Create a `.env.local` file in your project root:

```bash
# .env.local
VITE_API_URL=http://127.0.0.1:8000/api
VITE_APP_TITLE=MIPT - Industrial Training Reports (Dev)
VITE_APP_DESCRIPTION=Industrial Practical Training Report System
VITE_APP_VERSION=1.0.0
VITE_PWA_ENABLED=true
```

### **Option B: Netlify CLI (For Testing)**

```bash
# Install Netlify CLI if not already installed
npm install -g netlify-cli

# Login to Netlify
netlify login

# Set local development API URL
netlify env:set VITE_API_URL "http://127.0.0.1:8000/api"

# Verify the setting
netlify env:get VITE_API_URL
```

### **Option C: Netlify Dashboard**

1. Go to [netlify.com](https://netlify.com)
2. Select your MIPT project
3. Go to **Site settings** → **Environment variables**
4. Add: `VITE_API_URL = http://127.0.0.1:8000/api`

## 🧪 **Test Local Configuration**

### **Step 1: Start Your Backend**
```bash
# In your backend directory
python manage.py runserver 127.0.0.1:8000
```

### **Step 2: Start Your Frontend**
```bash
# In your frontend directory
npm run dev
```

### **Step 3: Test API Connection**
```javascript
// In browser console (http://localhost:3000)
console.log('API URL:', import.meta.env.VITE_API_URL);

// Test API connection
fetch('http://127.0.0.1:8000/api/auth/profile/')
  .then(response => response.json())
  .then(data => console.log('API working:', data))
  .catch(error => console.error('API error:', error));
```

## 🌐 **Step 2: Production Setup (PythonAnywhere)**

### **When Ready for Production:**

#### **Option A: Netlify Dashboard**
1. Go to Netlify Dashboard
2. Site settings → Environment variables
3. Update `VITE_API_URL`:
   ```bash
   VITE_API_URL=https://mipt.pythonanywhere.com/api
   ```

#### **Option B: Netlify CLI**
```bash
# Update to production API URL
netlify env:set VITE_API_URL "https://mipt.pythonanywhere.com/api"

# Verify the change
netlify env:get VITE_API_URL
```

#### **Option C: Environment-Specific Configuration**
Update your `netlify.toml`:

```toml
[build.environment]
  NODE_VERSION = "18"
  VITE_API_URL = "http://127.0.0.1:8000/api"  # Local development

[context.production.environment]
  VITE_API_URL = "https://mipt.pythonanywhere.com/api"  # Production

[context.deploy-preview.environment]
  VITE_API_URL = "https://mipt.pythonanywhere.com/api"  # Preview builds
```

## 🔄 **Switching Between Environments**

### **For Local Development:**
```bash
# Set local API URL
netlify env:set VITE_API_URL "http://127.0.0.1:8000/api"

# Or use .env.local file
echo "VITE_API_URL=http://127.0.0.1:8000/api" > .env.local
```

### **For Production:**
```bash
# Set production API URL
netlify env:set VITE_API_URL "https://mipt.pythonanywhere.com/api"
```

## 🛠️ **Backend Configuration (PythonAnywhere)**

### **CORS Settings for Your Backend:**

#### **If using Django:**
```python
# settings.py
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",           # Local development
    "http://127.0.0.1:3000",          # Local development
    "https://maipt.netlify.app",       # Your Netlify domain
    "https://yourdomain.com",          # Your custom domain (if any)
]

CORS_ALLOW_CREDENTIALS = True
```

#### **If using Flask:**
```python
# app.py
from flask_cors import CORS

app = Flask(__name__)
CORS(app, origins=[
    "http://localhost:3000",
    "http://127.0.0.1:3000", 
    "https://maipt.netlify.app",
    "https://yourdomain.com"
], supports_credentials=True)
```

## 🔍 **Testing Your Configuration**

### **Test Local Development:**
```bash
# 1. Start backend
python manage.py runserver 127.0.0.1:8000

# 2. Start frontend
npm run dev

# 3. Test in browser
# Open http://localhost:3000
# Check console for API URL
```

### **Test Production:**
```bash
# 1. Set production API URL
netlify env:set VITE_API_URL "https://mipt.pythonanywhere.com/api"

# 2. Deploy to Netlify
git add .
git commit -m "Update API URL for production"
git push origin main

# 3. Test live site
# Visit https://maipt.netlify.app
# Check console for API URL
```

## 📊 **Environment Variables Summary**

### **Local Development:**
```bash
VITE_API_URL=http://127.0.0.1:8000/api
VITE_APP_TITLE=MIPT - Industrial Training Reports (Dev)
```

### **Production:**
```bash
VITE_API_URL=https://mipt.pythonanywhere.com/api
VITE_APP_TITLE=MIPT - Industrial Training Reports
```

## 🚨 **Important Notes**

### **For Local Development:**
- ✅ Use `http://127.0.0.1:8000/api` for local testing
- ✅ Make sure your backend is running on port 8000
- ✅ Check CORS settings on your backend
- ✅ Test with browser console

### **For Production:**
- ✅ Use `https://mipt.pythonanywhere.com/api` for production
- ✅ Ensure your PythonAnywhere backend is running
- ✅ Configure CORS to allow your Netlify domain
- ✅ Test the live site thoroughly

## 🔧 **Quick Commands**

### **Check Current API URL:**
```javascript
// In browser console
console.log('Current API URL:', import.meta.env.VITE_API_URL);
```

### **Switch to Local:**
```bash
netlify env:set VITE_API_URL "http://127.0.0.1:8000/api"
```

### **Switch to Production:**
```bash
netlify env:set VITE_API_URL "https://mipt.pythonanywhere.com/api"
```

### **List Environment Variables:**
```bash
netlify env:list
```

## 🎯 **Expected Results**

### **Local Development:**
- ✅ API calls go to `http://127.0.0.1:8000/api`
- ✅ Login works with local backend
- ✅ All features work locally

### **Production:**
- ✅ API calls go to `https://mipt.pythonanywhere.com/api`
- ✅ Login works with production backend
- ✅ PWA works properly
- ✅ All features work on live site

## 🚀 **Next Steps**

1. **Set up local development** with `http://127.0.0.1:8000/api`
2. **Test everything locally** first
3. **Deploy your backend** to PythonAnywhere
4. **Switch to production** API URL when ready
5. **Test the live site** thoroughly

**Remember:** Always test locally first, then deploy to production! 🎉 