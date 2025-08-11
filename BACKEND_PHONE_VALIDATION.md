# Backend Implementation: Phone Number Validation for Registration

## 🎯 **Overview**
This document outlines the backend implementation needed to support the new 3-step registration flow with phone number validation.

## 🔧 **Required Backend Changes**

### **1. New API Endpoint**

#### **Phone Number Availability Check**
```
GET /api/auth/check-phone/
```

**Query Parameters:**
- `phone_number` (string, required): The phone number to check

**Response Format:**
```json
{
  "available": true,
  "message": "Phone number is available for registration"
}
```

**Error Response (Phone already exists):**
```json
{
  "available": false,
  "message": "Phone number is already registered"
}
```

### **2. Django Backend Implementation**

#### **2.1 Update User Model (if needed)**
```python
# models.py
class User(AbstractUser):
    # ... existing fields ...
    
    # Ensure phone_number field exists and is unique
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

#### **2.2 Create Phone Validation View**
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
            'message': 'Invalid phone number format'
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

#### **2.3 Update URL Configuration**
```python
# urls.py
from django.urls import path
from . import views

urlpatterns = [
    # ... existing urls ...
    path('auth/check-phone/', views.check_phone_availability, name='check_phone_availability'),
]
```

#### **2.4 Update Registration View (if needed)**
```python
# views.py
@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    """
    Register a new user with phone number validation
    """
    try:
        # Extract data from request
        data = request.data
        
        # Validate phone number
        phone_number = data.get('phone_number')
        if not phone_number:
            return Response({
                'success': False,
                'message': 'Phone number is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Clean phone number
        cleaned_phone = clean_phone_number(phone_number)
        if not cleaned_phone:
            return Response({
                'success': False,
                'message': 'Invalid phone number format'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if phone number is already taken
        if User.objects.filter(phone_number=cleaned_phone).exists():
            return Response({
                'success': False,
                'message': 'Phone number is already registered'
            }, status=status.HTTP_409_CONFLICT)
        
        # Create user with cleaned phone number
        user_data = {
            'username': data.get('email'),
            'email': data.get('email'),
            'first_name': data.get('first_name'),
            'last_name': data.get('last_name'),
            'password': data.get('password'),
            'phone_number': cleaned_phone
        }
        
        # Create user (implement your user creation logic)
        user = create_user(user_data)
        
        return Response({
            'success': True,
            'message': 'User registered successfully',
            'user_id': user.id
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        return Response({
            'success': False,
            'message': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
```

### **3. Database Migration (if needed)**

```bash
# Create migration for phone number field
python manage.py makemigrations

# Apply migration
python manage.py migrate
```

#### **Migration File Example:**
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

### **4. Testing the Backend**

#### **4.1 Test Phone Number Validation**
```bash
# Test with valid phone number
curl "https://mipt.pythonanywhere.com/api/auth/check-phone/?phone_number=0712345678"

# Expected response:
{
  "available": true,
  "message": "Phone number is available for registration"
}
```

#### **4.2 Test with Existing Phone Number**
```bash
# Test with already registered phone number
curl "https://mipt.pythonanywhere.com/api/auth/check-phone/?phone_number=0712345678"

# Expected response:
{
  "available": false,
  "message": "Phone number 0712345678 is already registered"
}
```

### **5. Security Considerations**

#### **5.1 Rate Limiting**
```python
# Add rate limiting to prevent abuse
from django_ratelimit.decorators import ratelimit

@ratelimit(key='ip', rate='10/m', method='GET')
@api_view(['GET'])
@permission_classes([AllowAny])
def check_phone_availability(request):
    # ... implementation ...
```

#### **5.2 Input Validation**
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

### **6. Error Handling**

#### **6.1 Common Error Scenarios**
```python
# Handle various error cases
try:
    # ... phone number check logic ...
except User.DoesNotExist:
    return Response({
        'available': True,
        'message': 'Phone number is available'
    })
except ValidationError as e:
    return Response({
        'available': False,
        'message': f'Validation error: {str(e)}'
    }, status=status.HTTP_400_BAD_REQUEST)
except Exception as e:
    return Response({
        'available': False,
        'message': 'Internal server error'
    }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
```

### **7. Performance Optimization**

#### **7.1 Database Indexing**
```python
# Add database index for phone number lookups
class Meta:
    indexes = [
        models.Index(fields=['phone_number']),
    ]
```

#### **7.2 Caching (Optional)**
```python
from django.core.cache import cache

def check_phone_availability(request):
    phone_number = request.GET.get('phone_number')
    cache_key = f'phone_check_{phone_number}'
    
    # Check cache first
    cached_result = cache.get(cache_key)
    if cached_result:
        return Response(cached_result)
    
    # ... perform check ...
    
    # Cache result for 5 minutes
    cache.set(cache_key, result, 300)
    return Response(result)
```

## 🚀 **Implementation Steps**

1. **Update User Model**: Add phone_number field with unique constraint
2. **Create Phone Validation View**: Implement check_phone_availability endpoint
3. **Update URLs**: Add new endpoint to URL configuration
4. **Run Migrations**: Apply database changes
5. **Test Endpoint**: Verify phone number validation works
6. **Update Registration**: Ensure phone number is validated during registration
7. **Add Rate Limiting**: Prevent abuse of the validation endpoint

## ✅ **Expected Results**

- Users can only proceed to step 2 if phone number is available
- Duplicate phone numbers are prevented at registration
- Phone numbers are standardized to +255 format
- Backend provides clear error messages for validation failures
- Registration flow is secure and user-friendly
