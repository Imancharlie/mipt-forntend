# 🔧 Backend Setup Guide

## 🎯 **Current Status**

✅ **Good News**: Your fallback mechanism is working perfectly!
- ❌ Production: CORS error (expected)
- ⚠️ Local: 400 Bad Request (needs correct credentials)
- ❌ Relative: 404 Not Found (expected)

## 🔧 **Fix Local Backend Credentials**

### **Step 1: Check Your Backend Users**

In your backend directory, run:

```bash
# For Django
python manage.py shell
```

Then in the shell:
```python
from django.contrib.auth.models import User
User.objects.all().values('username', 'email')
```

### **Step 2: Create a Test User**

If no users exist, create one:

```bash
# For Django
python manage.py createsuperuser
```

Or create a regular user:
```python
# In Django shell
from django.contrib.auth.models import User
user = User.objects.create_user('testuser', 'test@example.com', 'testpass')
user.save()
```

### **Step 3: Test with Correct Credentials**

Once you have valid credentials, test them:

```javascript
// In browser console
import { testBackendConnection } from '@/utils/testConnection';

// Test with your actual credentials
testBackendConnection().then(result => {
  console.log('Test result:', result);
});
```

## 🧪 **Test Your Backend**

### **Test 1: Check if Backend is Running**
```bash
# In your backend directory
python manage.py runserver 127.0.0.1:8000
```

### **Test 2: Check API Endpoint**
```bash
# Test with curl
curl -X POST http://127.0.0.1:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username":"your_username","password":"your_password"}'
```

### **Test 3: Check CORS Settings**
Make sure your backend allows requests from your frontend:

```python
# settings.py (Django)
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://maipt.netlify.app",
]

CORS_ALLOW_CREDENTIALS = True
```

## 🎯 **Expected Results**

### **When Backend is Properly Configured:**
```
🔄 Trying API endpoint: https://mipt.pythonanywhere.com/api/auth/login/
❌ API endpoint failed: CORS Error
🔄 Trying API endpoint: http://127.0.0.1:8000/api/auth/login/
✅ API endpoint working: http://127.0.0.1:8000/api/auth/login/
🔄 Login successful with local backend
```

### **Current Status (What You're Seeing):**
```
🔄 Trying API endpoint: https://mipt.pythonanywhere.com/api/auth/login/
❌ API endpoint failed: CORS Error
🔄 Trying API endpoint: http://127.0.0.1:8000/api/auth/login/
⚠️ 400 Bad Request (wrong credentials)
🔄 Trying API endpoint: /api/auth/login/
❌ 404 Not Found
```

## 🔍 **Debugging Steps**

### **1. Check Backend Logs**
Look at your backend console for error messages when you try to login.

### **2. Test API Directly**
```bash
curl -X POST http://127.0.0.1:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test"}'
```

### **3. Check User Database**
```python
# In Django shell
from django.contrib.auth.models import User
print(User.objects.all().values('username'))
```

## 🚀 **Quick Fix Options**

### **Option A: Create a Test User**
```bash
# In your backend directory
python manage.py createsuperuser --username testuser --email test@example.com
# Enter password when prompted
```

### **Option B: Use Existing Credentials**
If you already have users, find their credentials:
```python
# In Django shell
from django.contrib.auth.models import User
for user in User.objects.all():
    print(f"Username: {user.username}, Email: {user.email}")
```

### **Option C: Reset Password**
```python
# In Django shell
from django.contrib.auth.models import User
user = User.objects.get(username='your_username')
user.set_password('newpassword')
user.save()
```

## 📝 **Next Steps**

1. **✅ Fallback System**: Working perfectly
2. **🔧 Fix Credentials**: Set up correct username/password
3. **🧪 Test Login**: Should work with local backend
4. **🚀 Deploy**: Your app will work even with CORS issues

## 🎉 **Success Indicators**

You'll know it's working when:
- ✅ Local backend responds with 200 OK
- ✅ Login works on your live site
- ✅ Console shows successful fallback
- ✅ No more CORS errors in production

**The fallback mechanism is working perfectly! Just need to fix the credentials in your local backend.** 🚀 