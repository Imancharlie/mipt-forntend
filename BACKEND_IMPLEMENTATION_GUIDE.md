# Backend Implementation Guide: Authentication & Phone Validation

## 🚨 **Current Issues to Fix**

### **1. Missing Phone Validation Endpoint**
- **Error**: `404 Not Found` for `/api/auth/check-phone/`
- **Impact**: Users can't validate phone numbers before registration
- **Solution**: Implement the phone validation endpoint

### **2. Registration Endpoint Issues**
- **Error**: `400 Bad Request` for `/api/auth/register/`
- **Impact**: Registration fails even with valid data
- **Solution**: Update registration endpoint to handle new data structure

## 🔧 **Required Backend Changes**

### **1. Phone Number Validation Endpoint**

#### **URL Pattern**
```python
# urls.py
from django.urls import path
from . import views

urlpatterns = [
    # ... existing urls ...
    path('auth/check-phone/', views.check_phone_availability, name='check_phone_availability'),
    path('auth/register/', views.register_user, name='register_user'),
]
```

#### **View Implementation**
```python
# views.py
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.models import User
from django.db.models import Q
import re

@api_view(['GET'])
@permission_classes([AllowAny])
def check_phone_availability(request):
    """
    Check if a phone number is available for registration
    """
    phone_number = request.GET.get('phone_number')
    
    if not phone_number:
        return Response({
            'available': False,
            'message': 'Phone number is required'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Clean and validate phone number format
    cleaned_phone = clean_phone_number(phone_number)
    
    if not cleaned_phone:
        return Response({
            'available': False,
            'message': 'Invalid phone number format. Please use a valid Tanzanian phone number.'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Check if phone number already exists
    try:
        # Check in User model
        user_exists = User.objects.filter(phone_number=cleaned_phone).exists()
        
        # Also check in UserProfile if you have a separate profile model
        # profile_exists = UserProfile.objects.filter(phone_number=cleaned_phone).exists()
        
        if user_exists:  # or profile_exists
            return Response({
                'available': False,
                'message': f'Phone number {cleaned_phone} is already registered'
            }, status=status.HTTP_200_OK)
        
        return Response({
            'available': True,
            'message': 'Phone number is available for registration'
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'available': False,
            'message': 'Error checking phone number availability'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

def clean_phone_number(phone_number):
    """
    Clean and standardize phone number format
    Supports Tanzanian phone numbers: +255, 0, or 255 prefix
    """
    if not phone_number:
        return None
    
    # Remove all non-digit characters
    digits_only = re.sub(r'\D', '', phone_number)
    
    # Handle Tanzanian phone number formats
    if len(digits_only) == 9:
        # If it's 9 digits, assume it's a local number starting with 7
        if digits_only.startswith('7'):
            return f"+255{digits_only}"
        else:
            return None
    elif len(digits_only) == 10:
        # If it's 10 digits starting with 0, convert to +255
        if digits_only.startswith('0'):
            return f"+255{digits_only[1:]}"
        else:
            return None
    elif len(digits_only) == 12:
        # If it's 12 digits starting with 255, add +
        if digits_only.startswith('255'):
            return f"+{digits_only}"
        else:
            return None
    elif len(digits_only) == 13:
        # If it's 13 digits starting with 255, it's already correct
        if digits_only.startswith('255'):
            return f"+{digits_only}"
        else:
            return None
    
    return None
```

### **2. Updated Registration Endpoint**

#### **View Implementation**
```python
# views.py
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from django.db import transaction

@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    """
    Register a new user with phone number validation
    """
    try:
        # Extract data from request
        data = request.data
        
        # Validate required fields
        required_fields = ['username', 'email', 'first_name', 'last_name', 'password', 'phone_number']
        for field in required_fields:
            if not data.get(field):
                return Response({
                    'success': False,
                    'message': f'{field.replace("_", " ").title()} is required'
                }, status=status.HTTP_400_BAD_REQUEST)
        
        # Validate phone number
        phone_number = data.get('phone_number')
        cleaned_phone = clean_phone_number(phone_number)
        if not cleaned_phone:
            return Response({
                'success': False,
                'message': 'Invalid phone number format. Please use a valid Tanzanian phone number.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if phone number is already taken
        if User.objects.filter(phone_number=cleaned_phone).exists():
            return Response({
                'success': False,
                'message': 'Phone number is already registered'
            }, status=status.HTTP_409_CONFLICT)
        
        # Check if username or email already exists
        if User.objects.filter(username=data.get('username')).exists():
            return Response({
                'success': False,
                'message': 'Username is already taken'
            }, status=status.HTTP_409_CONFLICT)
        
        if User.objects.filter(email=data.get('email')).exists():
            return Response({
                'success': False,
                'message': 'Email is already registered'
            }, status=status.HTTP_409_CONFLICT)
        
        # Create user with cleaned phone number
        with transaction.atomic():
            user = User.objects.create_user(
                username=data.get('username'),
                email=data.get('email'),
                first_name=data.get('first_name'),
                last_name=data.get('last_name'),
                password=data.get('password'),
                phone_number=cleaned_phone
            )
            
            # Generate JWT tokens
            refresh = RefreshToken.for_user(user)
            access_token = refresh.access_token
            
            return Response({
                'success': True,
                'message': 'User registered successfully',
                'user_id': user.id,
                'access_token': str(access_token),
                'refresh_token': str(refresh),
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                    'phone_number': user.phone_number
                }
            }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        return Response({
            'success': False,
            'message': f'Registration failed: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
```

### **3. Update User Model**

#### **Model Changes**
```python
# models.py
from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    # ... existing fields ...
    
    # Add phone number field
    phone_number = models.CharField(
        max_length=15, 
        unique=True, 
        null=True, 
        blank=True,
        help_text="User's phone number (must be unique)"
    )
    
    class Meta:
        # ... existing meta ...
        constraints = [
            models.UniqueConstraint(
                fields=['phone_number'], 
                name='unique_user_phone_number'
            )
        ]
```

### **4. Database Migration**

#### **Create Migration**
```bash
# Create migration for phone number field
python manage.py makemigrations

# Apply migration
python manage.py migrate
```

#### **Migration File Example**
```python
# migrations/XXXX_add_phone_number.py
from django.db import migrations, models

class Migration(migrations.Migration):
    dependencies = [
        ('auth', 'XXXX_previous_migration'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='phone_number',
            field=models.CharField(
                blank=True, 
                max_length=15, 
                null=True, 
                unique=True
            ),
        ),
    ]
```

## 🧪 **Testing the Implementation**

### **1. Test Phone Number Validation**
```bash
# Test with valid phone number
curl "https://mipt.pythonanywhere.com/api/auth/check-phone/?phone_number=0712345678"

# Expected response:
{
  "available": true,
  "message": "Phone number is available for registration"
}
```

### **2. Test with Existing Phone Number**
```bash
# Test with already registered phone number
curl "https://mipt.pythonanywhere.com/api/auth/check-phone/?phone_number=0712345678"

# Expected response:
{
  "available": false,
  "message": "Phone number +255712345678 is already registered"
}
```

### **3. Test Registration**
```bash
# Test user registration
curl -X POST "https://mipt.pythonanywhere.com/api/auth/register/" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "first_name": "Test",
    "last_name": "User",
    "password": "securepass123",
    "phone_number": "0712345678"
  }'

# Expected response:
{
  "success": true,
  "message": "User registered successfully",
  "user_id": 123,
  "access_token": "...",
  "refresh_token": "...",
  "user": { ... }
}
```

## 🔒 **Security Considerations**

### **1. Rate Limiting**
```python
from django_ratelimit.decorators import ratelimit

@ratelimit(key='ip', rate='10/m', method='GET')
@api_view(['GET'])
@permission_classes([AllowAny])
def check_phone_availability(request):
    # ... implementation ...
```

### **2. Input Validation**
```python
def validate_phone_number(phone_number):
    """
    Additional validation for phone numbers
    """
    # Check length
    if len(phone_number) < 10 or len(phone_number) > 15:
        return False
    
    # Check if it contains only digits and allowed characters
    if not re.match(r'^[\d\s\+\-\(\)]+$', phone_number):
        return False
    
    return True
```

## 📱 **Phone Number Format Support**

### **Supported Formats**
- **Local**: `0712345678` → `+255712345678`
- **With 0**: `0712345678` → `+255712345678`
- **With 255**: `255712345678` → `+255712345678`
- **International**: `+255712345678` → `+255712345678`

### **Validation Rules**
- Must be 9-13 digits after cleaning
- Must start with valid Tanzanian prefixes (7, 0, 255)
- Automatically converts to international format (+255)

## 🚀 **Implementation Steps**

1. **Update User Model**: Add phone_number field with unique constraint
2. **Create Phone Validation View**: Implement check_phone_availability endpoint
3. **Update Registration View**: Modify register_user to handle phone_number
4. **Update URLs**: Add new endpoint to URL configuration
5. **Run Migrations**: Apply database changes
6. **Test Endpoints**: Verify phone validation and registration work
7. **Add Rate Limiting**: Prevent abuse of validation endpoint

## ✅ **Expected Results**

- Users can validate phone numbers before registration
- Duplicate phone numbers are prevented
- Phone numbers are standardized to +255 format
- Registration includes phone number validation
- Clear error messages for validation failures
- Secure and user-friendly registration flow

## 🔍 **Debugging Tips**

### **Common Issues**
1. **404 Errors**: Check URL patterns and view registration
2. **400 Errors**: Validate request data structure
3. **500 Errors**: Check database migrations and model constraints
4. **CORS Issues**: Ensure proper CORS configuration for frontend

### **Logging**
```python
import logging
logger = logging.getLogger(__name__)

def check_phone_availability(request):
    logger.info(f"Phone validation request: {request.GET}")
    # ... implementation ...
    logger.info(f"Phone validation result: {result}")
```

This implementation will resolve all the current frontend errors and provide a robust, secure registration system with phone number validation!
