# 🔄 API Fallback Mechanism Guide

## 🎯 **What This Does**

Your MIPT app now has an intelligent fallback system that automatically tries multiple API endpoints when one fails:

1. **Primary**: `https://mipt.pythonanywhere.com/api` (Production)
2. **Fallback 1**: `http://127.0.0.1:8000/api` (Local Development)
3. **Fallback 2**: `/api` (Relative URL)

## 🚀 **How It Works**

### **Automatic Fallback Process:**
1. **Tries Production First**: `https://mipt.pythonanywhere.com/api`
2. **If CORS Error**: Automatically tries `http://127.0.0.1:8000/api`
3. **If Local Fails**: Tries relative URL `/api`
4. **If All Fail**: Shows error message

### **When Fallback Triggers:**
- ✅ **CORS Errors** (like your current issue)
- ✅ **Network Errors** (connection failed)
- ✅ **Timeout Errors** (server not responding)
- ✅ **DNS Errors** (domain not found)

## 🔧 **Current Configuration**

### **Your Netlify Environment:**
```bash
VITE_API_URL=https://mipt.pythonanywhere.com/api
```

### **Fallback Chain:**
1. `https://mipt.pythonanywhere.com/api` ← **Primary (Production)**
2. `http://127.0.0.1:8000/api` ← **Fallback (Local)**
3. `/api` ← **Last Resort**

## 🧪 **Testing the Fallback**

### **Test in Browser Console:**
```javascript
// Test the fallback mechanism
import { testBackendConnection } from '@/utils/testConnection';

// Run the test
testBackendConnection().then(result => {
  console.log('Test result:', result);
});
```

### **Test API Configuration:**
```javascript
// Check current API settings
import { testCurrentApiConfig } from '@/utils/testApiFallback';

// Run the test
testCurrentApiConfig();
```

## 🎯 **Expected Behavior**

### **Scenario 1: Production Works**
```
✅ https://mipt.pythonanywhere.com/api/auth/login/ - SUCCESS
🔄 Login works normally
```

### **Scenario 2: Production CORS Error (Your Current Issue)**
```
❌ https://mipt.pythonanywhere.com/api/auth/login/ - CORS Error
🔄 Trying fallback: http://127.0.0.1:8000/api/auth/login/
✅ http://127.0.0.1:8000/api/auth/login/ - SUCCESS
🔄 Login works with local backend
```

### **Scenario 3: All Endpoints Fail**
```
❌ https://mipt.pythonanywhere.com/api/auth/login/ - Failed
❌ http://127.0.0.1:8000/api/auth/login/ - Failed
❌ /api/auth/login/ - Failed
❌ All endpoints failed - Show error message
```

## 🔍 **Debugging**

### **Check Console Logs:**
```javascript
// In browser console, you'll see:
🔄 Trying API endpoint: https://mipt.pythonanywhere.com/api/auth/login/
❌ API endpoint failed: https://mipt.pythonanywhere.com/api/auth/login/ CORS Error
🔄 Trying API endpoint: http://127.0.0.1:8000/api/auth/login/
✅ API endpoint working: http://127.0.0.1:8000/api/auth/login/
```

### **Monitor Network Tab:**
1. Open Browser DevTools
2. Go to Network tab
3. Try to login
4. Watch the requests:
   - First: `https://mipt.pythonanywhere.com/api/auth/login/` (Failed)
   - Second: `http://127.0.0.1:8000/api/auth/login/` (Success)

## 🛠️ **CORS Fix for Production**

### **For PythonAnywhere (Django):**
```python
# settings.py
CORS_ALLOWED_ORIGINS = [
    "https://maipt.netlify.app",  # Your Netlify domain
    "http://localhost:3000",      # Local development
    "http://127.0.0.1:3000",     # Local development
]

CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_ALL_ORIGINS = False  # For security
```

### **For PythonAnywhere (Flask):**
```python
# app.py
from flask_cors import CORS

app = Flask(__name__)
CORS(app, origins=[
    "https://maipt.netlify.app",
    "http://localhost:3000",
    "http://127.0.0.1:3000"
], supports_credentials=True)
```

## 🚀 **Deploy and Test**

### **Step 1: Deploy Changes**
```bash
git add .
git commit -m "Add API fallback mechanism"
git push origin main
```

### **Step 2: Test the Fallback**
1. **Start your local backend**: `python manage.py runserver 127.0.0.1:8000`
2. **Visit your Netlify site**: `https://maipt.netlify.app`
3. **Try to login** - it should automatically fallback to local
4. **Check console** for fallback logs

### **Step 3: Fix Production CORS**
1. Update your PythonAnywhere backend CORS settings
2. Restart your backend
3. Test production endpoint again

## 📊 **Monitoring**

### **Success Indicators:**
- ✅ Login works even with CORS errors
- ✅ Automatic fallback to local backend
- ✅ Console shows fallback process
- ✅ No user intervention needed

### **Troubleshooting:**
- ❌ If login still fails: Check local backend is running
- ❌ If no fallback: Check console for errors
- ❌ If all fail: Check network connectivity

## 🎯 **Benefits**

1. **🔄 Automatic Recovery**: No manual switching needed
2. **🛡️ Fault Tolerance**: Handles CORS, network, and server errors
3. **🚀 Better UX**: Users don't see technical errors
4. **🔧 Easy Debugging**: Clear console logs show what's happening
5. **⚡ Fast Fallback**: Tries local backend immediately if production fails

## 📝 **Next Steps**

1. **Deploy the changes** to Netlify
2. **Start your local backend** on `127.0.0.1:8000`
3. **Test the login** on your live site
4. **Fix CORS on PythonAnywhere** when ready
5. **Monitor the fallback** working automatically

**The fallback mechanism will now automatically handle your CORS issue by trying the local backend when production fails!** 🎉 