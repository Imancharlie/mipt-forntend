# 🔍 API Debug Guide - 400 Bad Request

## 🎯 **Understanding 400 Bad Request**

A 400 error can mean:
1. **❌ Wrong credentials** (username/password incorrect)
2. **❌ Wrong request format** (API expects different data structure)
3. **❌ Missing required fields** (API needs additional data)
4. **❌ Wrong HTTP method** (should be PUT instead of POST)
5. **❌ Wrong endpoint** (URL structure is different)

## 🧪 **Step-by-Step Debugging**

### **Step 1: Test Request Format**

Run this in your browser console:

```javascript
// Import the debug utilities
import { debugApiRequest } from '@/utils/debugApiRequest';

// Test different request formats
debugApiRequest().then(result => {
  console.log('Debug result:', result);
});
```

This will test:
- ✅ Standard format: `{username, password}`
- ✅ Email format: `{email, password}`
- ✅ User format: `{user, password}`
- ✅ Extended format: `{username, password, remember}`
- ✅ Minimal format: `{username, password}`

### **Step 2: Test HTTP Methods**

```javascript
import { debugApiMethods } from '@/utils/debugApiMethods';

// Test different HTTP methods
debugApiMethods();
```

This will test:
- ✅ POST method
- ✅ PUT method
- ✅ PATCH method

### **Step 3: Test Endpoint Structure**

```javascript
import { checkApiEndpoints } from '@/utils/debugApiRequest';

// Test different endpoint URLs
checkApiEndpoints();
```

This will test:
- ✅ `/api/auth/login/`
- ✅ `/api/auth/login`
- ✅ `/api/login/`
- ✅ `/api/login`
- ✅ `/auth/login/`
- ✅ `/auth/login`
- ✅ `/login/`
- ✅ `/login`

## 🔍 **Manual Testing with curl**

### **Test 1: Basic Login**
```bash
curl -X POST http://127.0.0.1:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"testpass"}' \
  -v
```

### **Test 2: Email Login**
```bash
curl -X POST http://127.0.0.1:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpass"}' \
  -v
```

### **Test 3: Different HTTP Method**
```bash
curl -X PUT http://127.0.0.1:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"testpass"}' \
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
    "email": "test@example.com"
  }
}
```

### **❌ Wrong Credentials (400 Bad Request)**
```json
{
  "error": "Invalid credentials",
  "message": "Username or password is incorrect"
}
```

### **❌ Wrong Format (400 Bad Request)**
```json
{
  "error": "Invalid request format",
  "message": "Expected fields: username, password"
}
```

### **❌ Missing Fields (400 Bad Request)**
```json
{
  "error": "Missing required fields",
  "message": "username and password are required"
}
```

## 🔧 **Common Django API Patterns**

### **Pattern 1: Standard Django REST Framework**
```python
# Expected request format
{
  "username": "testuser",
  "password": "testpass"
}
```

### **Pattern 2: Email-based Login**
```python
# Expected request format
{
  "email": "test@example.com",
  "password": "testpass"
}
```

### **Pattern 3: Custom Login**
```python
# Expected request format
{
  "user": "testuser",
  "password": "testpass"
}
```

### **Pattern 4: Extended Login**
```python
# Expected request format
{
  "username": "testuser",
  "password": "testpass",
  "remember": true
}
```

## 🛠️ **Backend Debugging**

### **Check Your Django API View**

Look at your backend code to see what format it expects:

```python
# Example Django view
class LoginView(APIView):
    def post(self, request):
        username = request.data.get('username')  # Expects 'username'
        password = request.data.get('password')  # Expects 'password'
        
        # Your login logic here
```

### **Check Django URLs**

Make sure your endpoint is correctly configured:

```python
# urls.py
from django.urls import path
from .views import LoginView

urlpatterns = [
    path('api/auth/login/', LoginView.as_view(), name='login'),
]
```

## 🎯 **Quick Fixes**

### **Fix 1: Check Your Backend Logs**
Look at your Django server console for detailed error messages.

### **Fix 2: Test with Known Good Credentials**
```bash
# Create a test user
python manage.py createsuperuser --username admin --email admin@example.com
# Password: admin123
```

### **Fix 3: Check API Documentation**
If your backend has API docs, check the expected format.

### **Fix 4: Test with Postman**
Use Postman to test different request formats manually.

## 📝 **Debugging Checklist**

- [ ] **Backend is running** on `127.0.0.1:8000`
- [ ] **Endpoint exists** at `/api/auth/login/`
- [ ] **HTTP method** is correct (POST)
- [ ] **Request format** matches backend expectations
- [ ] **Credentials** are valid
- [ ] **CORS** is configured correctly
- [ ] **Content-Type** is `application/json`

## 🚀 **Next Steps**

1. **Run the debug tests** in browser console
2. **Check backend logs** for detailed error messages
3. **Test with curl** to isolate the issue
4. **Update request format** based on findings
5. **Test login** with correct format

**The debug utilities will help us identify exactly what your backend expects!** 🔍 