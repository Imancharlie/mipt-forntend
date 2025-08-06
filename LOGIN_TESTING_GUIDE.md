# 🔐 Login Testing Guide

## 🎯 **Backend Login Format**

Based on your backend code, the login endpoint expects:

**Endpoint:** `POST /api/auth/login/`

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
    "username": "your_username",
    "password": "your_password"
}
```

## 🧪 **Testing Steps**

### **Step 1: Test Login Format**

Run this in your browser console:

```javascript
// Import the test utilities
import { testLoginFormat } from '@/utils/testLoginFormat';

// Test different login formats
testLoginFormat().then(result => {
  console.log('Test result:', result);
});
```

### **Step 2: Test Specific Credentials**

```javascript
import { testSpecificCredentials } from '@/utils/testLoginFormat';

// Test with your actual credentials
testSpecificCredentials('your_username', 'your_password').then(result => {
  console.log('Credential test result:', result);
});
```

### **Step 3: Test with curl**

```bash
# Test basic login
curl -X POST http://127.0.0.1:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"testpass123"}' \
  -v
```

## 📊 **Expected Responses**

### **✅ Success Response (200 OK)**
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "user": {
    "id": 1,
    "username": "testuser",
    "email": "test@example.com",
    "full_name": "Test User",
    "has_complete_profile": false
  }
}
```

### **❌ Wrong Credentials (400 Bad Request)**
```json
{
  "detail": "No active account found with the given credentials"
}
```

### **❌ Missing Fields (400 Bad Request)**
```json
{
  "username": ["This field is required."],
  "password": ["This field is required."]
}
```

## 🔧 **Create Test User**

If you don't have a test user, create one:

```bash
# In your backend directory
python manage.py createsuperuser --username testuser --email test@example.com
# Enter password: testpass123
```

Or create a regular user:
```python
# In Django shell
python manage.py shell

# Then in the shell:
from django.contrib.auth.models import User
user = User.objects.create_user('testuser', 'test@example.com', 'testpass123')
user.save()
```

## 🎯 **Frontend Integration**

### **Updated Login Service**

Your login service now sends the correct format:

```javascript
// The login service automatically formats the request
const loginData = {
  username: credentials.username,
  password: credentials.password
};

// Sends to: POST /api/auth/login/
// Headers: Content-Type: application/json
// Body: { username: "...", password: "..." }
```

### **Test in Your App**

1. **Start your backend**: `python manage.py runserver 127.0.0.1:8000`
2. **Visit your app**: `https://maipt.netlify.app`
3. **Try to login** with valid credentials
4. **Check console** for detailed logs

## 🔍 **Debugging**

### **Check Backend Logs**

Look at your Django server console for detailed error messages when you try to login.

### **Check Network Tab**

1. Open Browser DevTools
2. Go to Network tab
3. Try to login
4. Look for the `/api/auth/login/` request
5. Check the request payload and response

### **Common Issues**

1. **❌ Wrong credentials**: Username/password don't exist
2. **❌ Wrong format**: Missing required fields
3. **❌ CORS error**: Backend not allowing frontend domain
4. **❌ Network error**: Backend not running

## 🚀 **Quick Test Commands**

### **Test 1: Basic Login**
```bash
curl -X POST http://127.0.0.1:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"testpass123"}'
```

### **Test 2: Check if Backend is Running**
```bash
curl http://127.0.0.1:8000/api/auth/login/
# Should return 405 Method Not Allowed (endpoint exists)
```

### **Test 3: Check CORS**
```bash
curl -X OPTIONS http://127.0.0.1:8000/api/auth/login/ \
  -H "Origin: https://maipt.netlify.app" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -v
```

## 📝 **Success Checklist**

- [ ] **Backend is running** on `127.0.0.1:8000`
- [ ] **Test user exists** with correct credentials
- [ ] **Request format** is `{username, password}`
- [ ] **Content-Type** is `application/json`
- [ ] **CORS** allows your frontend domain
- [ ] **Login works** with valid credentials
- [ ] **Fallback mechanism** works when production fails

## 🎉 **Expected Result**

When everything is working correctly:

```
🔄 Trying API endpoint: https://mipt.pythonanywhere.com/api/auth/login/
❌ API endpoint failed: CORS Error
🔄 Trying API endpoint: http://127.0.0.1:8000/api/auth/login/
✅ API endpoint working: http://127.0.0.1:8000/api/auth/login/
🎉 Login successful! User: testuser
```

**The login should now work with the correct backend format!** 🔐 