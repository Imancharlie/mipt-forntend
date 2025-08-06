# 🔧 API Configuration Guide

## 📍 **Current API Root Configuration**

Your MIPT frontend is configured to communicate with your backend API using a flexible URL system:

### **Priority Order:**
1. **Environment Variable** (`VITE_API_URL`) - Most flexible
2. **Development Mode** - Auto-detects hostname + port 8000
3. **Production Fallback** - Relative URL `/api`

## 🚀 **How to Configure for Different Backend Hosts**

### **1. Local Development**

#### **Option A: Default Setup (Recommended)**
```bash
# Backend runs on localhost:8000
# Frontend runs on localhost:3000
# No configuration needed - works automatically
```

#### **Option B: Custom Backend Port**
Create `.env` file:
```bash
VITE_API_URL=http://localhost:8001/api
```

#### **Option C: Custom Backend Host**
```bash
VITE_API_URL=http://192.168.1.100:8000/api
```

### **2. Production Deployment**

#### **Option A: Same Domain (Recommended for PWA)**
```bash
# Backend and frontend on same domain
VITE_API_URL=/api
```

#### **Option B: Separate Backend Domain**
```bash
# Backend on different domain
VITE_API_URL=https://api.mipt.com/api
VITE_API_URL=https://backend.yourdomain.com/api
```

#### **Option C: Subdomain**
```bash
# Backend on subdomain
VITE_API_URL=https://api.yourdomain.com/api
```

### **3. Docker Development**

#### **Option A: Docker Compose**
```bash
# Backend service name
VITE_API_URL=http://backend:8000/api
```

#### **Option B: Local Docker**
```bash
# Backend exposed on host
VITE_API_URL=http://localhost:8000/api
```

## 🔧 **Environment Configuration**

### **Create `.env` file:**
```bash
# Copy from env.example
cp env.example .env

# Edit .env file
VITE_API_URL=http://localhost:8000/api
```

### **Environment Variables:**
```bash
# Development
VITE_API_URL=http://localhost:8000/api

# Production - Same Domain
VITE_API_URL=/api

# Production - Separate Domain
VITE_API_URL=https://api.mipt.com/api

# Custom Backend
VITE_API_URL=https://your-backend-host.com/api
```

## 🌐 **Backend Hosting Options**

### **1. Local Development**
```bash
# Backend: Django/Python on port 8000
python manage.py runserver 8000

# Frontend: Vite on port 3000
npm run dev
```

### **2. Same Server Deployment**
```bash
# Both frontend and backend on same server
# Frontend serves static files
# Backend handles API requests
VITE_API_URL=/api
```

### **3. Separate Servers**
```bash
# Frontend: Netlify/Vercel
# Backend: Railway/Render/Heroku
VITE_API_URL=https://your-backend-url.com/api
```

### **4. Cloud Services**

#### **Backend Options:**
- **Railway**: `https://your-app.railway.app/api`
- **Render**: `https://your-app.onrender.com/api`
- **Heroku**: `https://your-app.herokuapp.com/api`
- **DigitalOcean**: `https://your-droplet-ip/api`
- **AWS**: `https://your-ec2-instance/api`

#### **Frontend Options:**
- **Netlify**: Automatic deployment
- **Vercel**: Automatic deployment
- **GitHub Pages**: Static hosting
- **Firebase Hosting**: Google's hosting

## 🔍 **Testing Your API Configuration**

### **1. Check Current API URL**
```javascript
// In browser console
console.log('API URL:', import.meta.env.VITE_API_URL);
console.log('Current API Base:', getApiBaseUrl());
```

### **2. Test API Connection**
```javascript
// Test endpoint
fetch('/api/auth/profile/')
  .then(response => response.json())
  .then(data => console.log('API working:', data))
  .catch(error => console.error('API error:', error));
```

### **3. Development Testing**
```bash
# Start backend
python manage.py runserver 8000

# Start frontend
npm run dev

# Test in browser
# http://localhost:3000
```

## 🛠️ **Common Configuration Scenarios**

### **Scenario 1: Local Development**
```bash
# .env
VITE_API_URL=http://localhost:8000/api

# Backend: localhost:8000
# Frontend: localhost:3000
```

### **Scenario 2: Production with Same Domain**
```bash
# .env
VITE_API_URL=/api

# Both frontend and backend on same server
# Nginx/Apache serves frontend and proxies API to backend
```

### **Scenario 3: Production with Separate Domains**
```bash
# .env
VITE_API_URL=https://api.mipt.com/api

# Frontend: https://mipt.com
# Backend: https://api.mipt.com
```

### **Scenario 4: Docker Development**
```bash
# .env
VITE_API_URL=http://backend:8000/api

# docker-compose.yml
services:
  frontend:
    ports:
      - "3000:3000"
  backend:
    ports:
      - "8000:8000"
```

## 🔒 **CORS Configuration**

### **Backend CORS Settings (Django)**
```python
# settings.py
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",  # Development
    "https://yourdomain.com",  # Production
]

CORS_ALLOW_CREDENTIALS = True
```

### **Backend CORS Settings (Express/Node.js)**
```javascript
// app.js
const cors = require('cors');

app.use(cors({
  origin: ['http://localhost:3000', 'https://yourdomain.com'],
  credentials: true
}));
```

## 📊 **API Endpoints Structure**

Your backend should follow this structure:
```
/api/
├── auth/
│   ├── login/
│   ├── register/
│   ├── logout/
│   ├── token/refresh/
│   └── profile/
├── reports/
│   ├── daily/
│   ├── weekly/
│   └── general/
├── companies/
├── ai/
└── export/
```

## 🚀 **Deployment Checklist**

### **Before Deployment:**
1. ✅ Set `VITE_API_URL` environment variable
2. ✅ Configure CORS on backend
3. ✅ Test API endpoints
4. ✅ Ensure HTTPS in production
5. ✅ Set up proper error handling

### **Environment Variables for Different Platforms:**

#### **Netlify:**
```bash
VITE_API_URL=https://your-backend-url.com/api
```

#### **Vercel:**
```bash
VITE_API_URL=https://your-backend-url.com/api
```

#### **Railway:**
```bash
VITE_API_URL=https://your-backend-url.com/api
```

## 🔍 **Debugging API Issues**

### **Common Issues:**

1. **CORS Errors**
   - Check backend CORS configuration
   - Ensure credentials are allowed

2. **404 Errors**
   - Verify API URL is correct
   - Check backend is running
   - Confirm endpoint exists

3. **Network Errors**
   - Check internet connection
   - Verify backend is accessible
   - Test with curl/Postman

### **Debug Commands:**
```bash
# Test API endpoint
curl http://localhost:8000/api/auth/profile/

# Check environment variables
echo $VITE_API_URL

# Test with different API URL
VITE_API_URL=http://localhost:8000/api npm run dev
```

## 📝 **Summary**

Your API root configuration is flexible and supports:

- ✅ **Local Development**: `http://localhost:8000/api`
- ✅ **Production Same Domain**: `/api`
- ✅ **Production Separate Domain**: `https://api.domain.com/api`
- ✅ **Docker Development**: `http://backend:8000/api`
- ✅ **Environment Variables**: `VITE_API_URL`

**To change your API root:**
1. Set `VITE_API_URL` environment variable
2. Restart your development server
3. Test the connection

**For production:**
1. Set environment variable in your hosting platform
2. Deploy your changes
3. Test the live application 