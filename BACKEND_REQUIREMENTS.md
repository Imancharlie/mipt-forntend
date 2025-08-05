# Backend Requirements for MIPT Frontend Application

## 🔧 **Current Issues**
- Frontend is getting 404 errors for missing endpoints
- Authentication issues (401 errors)
- Backend server errors (500 errors)

## 📋 **Required Backend Endpoints**

### **1. Authentication Endpoints**
```
POST /api/auth/login/
POST /api/auth/register/
POST /api/auth/token/refresh/
POST /api/auth/logout/
GET /api/auth/profile/
PUT /api/auth/profile/
```

### **2. Dashboard Endpoints**
```
GET /api/auth/dashboard/
```

**Expected Response:**
```json
{
  "total_reports": 5,
  "total_hours": 34,
  "completed_weeks": 1,
  "remaining_weeks": 7,
  "current_week": 1
}
```

### **3. Daily Reports Endpoints**
```
GET /api/reports/daily/
POST /api/reports/daily/
PUT /api/reports/daily/{id}/
PATCH /api/reports/daily/{id}/submit/
GET /api/reports/daily/week/?week_number={week_number}
```

**Daily Report Model:**
```json
{
  "id": 1,
  "week_number": 1,
  "date": "2025-07-21",
  "description": "Introduction to company procedures",
  "hours_spent": 8,
  "day_name": "Monday"
}
```

### **4. Weekly Reports Endpoints**
```
GET /api/reports/weekly/
POST /api/reports/weekly/
PUT /api/reports/weekly/{id}/
PATCH /api/reports/weekly/{id}/submit/
GET /api/reports/weekly/{week_number}/
POST /api/reports/weekly/generate/
```

**Weekly Report Model:**
```json
{
  "id": 1,
  "week_number": 1,
  "start_date": "2025-07-21",
  "end_date": "2025-07-25",
  "total_hours": 34,
  "daily_reports": [...],
  "main_job": {
    "id": 1,
    "title": "Machine Operation Training",
    "operations": [...]
  }
}
```

### **5. Main Job Endpoints**
```
GET /api/main-jobs/
POST /api/main-jobs/
PUT /api/main-jobs/{id}/
DELETE /api/main-jobs/{id}/
GET /api/main-jobs/{id}/
```

**Main Job Model:**
```json
{
  "id": 1,
  "weekly_report": 1,
  "title": "Machine Operation Training",
  "operations": [...],
  "created_at": "2025-07-21T08:00:00Z",
  "updated_at": "2025-07-21T08:00:00Z"
}
```

### **6. Main Job Operations Endpoints**
```
GET /api/main-jobs/{main_job_id}/operations/
POST /api/main-jobs/{main_job_id}/operations/
PUT /api/main-jobs/{main_job_id}/operations/{id}/
DELETE /api/main-jobs/{main_job_id}/operations/{id}/
GET /api/main-jobs/{main_job_id}/operations/{id}/
```

**Main Job Operation Model:**
```json
{
  "id": 1,
  "main_job": 1,
  "step_number": 1,
  "operation_description": "Safety briefing and equipment introduction",
  "tools_used": "Safety equipment, training manuals",
  "created_at": "2025-07-21T08:00:00Z",
  "updated_at": "2025-07-21T08:00:00Z"
}
```

### **7. Company Endpoints**
```
GET /api/companies/
POST /api/companies/
PUT /api/companies/{id}/
DELETE /api/companies/{id}/
GET /api/companies/{id}/
```

**Company Model:**
```json
{
  "id": 1,
  "name": "ABC Manufacturing",
  "address": "123 Industrial St",
  "contact_person": "John Doe",
  "phone": "+1234567890",
  "email": "contact@abc.com"
}
```

### **8. Export Endpoints**
```
GET /api/reports/weekly/{week_number}/download/pdf/
GET /api/reports/weekly/{week_number}/download/docx/
```

## 🔐 **Authentication Requirements**

### **JWT Token Structure:**
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

### **Required Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

## 📅 **Date Consistency Requirements**

### **Training Schedule:**
- **Start Date**: July 21, 2025 (Monday)
- **Duration**: 8 weeks
- **Format**: Monday-Friday (5 days per week)
- **Week 1**: July 21-25, 2025
- **Week 2**: July 28-August 1, 2025
- **...continues for 8 weeks**

### **Date Auto-Calculation:**
- Frontend calculates dates based on week number
- Backend should validate week numbers (1-8)
- Dates should be read-only in frontend forms

## 📄 **PDF/DOCX Generation Requirements**

### **Backend Libraries Needed:**
```python
# requirements.txt additions
reportlab==4.0.4
python-docx==0.8.11
django-weasyprint==1.0.1
```

### **Report Template Structure:**
```
[Company Header]
Week X Report (July 21-25, 2025)

Daily Work Log:
- Monday: 8 hours - Description
- Tuesday: 7 hours - Description
- ...

Main Job: [Title]
Operations:
1. [Operation Description] - Tools: [Tools Used]
2. [Operation Description] - Tools: [Tools Used]
...

[Signature Fields - Blank for physical signing]
Date: _____________
Signature: _____________
```

## 🚀 **Implementation Priority**

### **Phase 1 (Critical):**
1. Authentication endpoints
2. Profile endpoints
3. Dashboard endpoint
4. Basic error handling

### **Phase 2 (Core Features):**
1. Daily reports endpoints
2. Weekly reports endpoints
3. Main job endpoints
4. Company endpoints

### **Phase 3 (Advanced Features):**
1. Export functionality (PDF/DOCX)
2. AI enhancement endpoints
3. Advanced reporting

## 🔧 **Development Setup**

### **Django Models Needed:**
```python
# models.py
class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    student_id = models.CharField(max_length=20, unique=True)
    program = models.CharField(max_length=50, choices=PROGRAM_CHOICES)
    year_of_study = models.IntegerField()
    pt_phase = models.CharField(max_length=10, choices=PT_PHASE_CHOICES)
    department = models.CharField(max_length=100)
    supervisor_name = models.CharField(max_length=100)
    supervisor_email = models.EmailField()
    phone_number = models.CharField(max_length=20)
    company = models.ForeignKey('Company', on_delete=models.SET_NULL, null=True)

class Company(models.Model):
    name = models.CharField(max_length=200)
    address = models.TextField()
    contact_person = models.CharField(max_length=100)
    phone = models.CharField(max_length=20)
    email = models.EmailField()

class DailyReport(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    week_number = models.IntegerField()
    date = models.DateField()
    description = models.TextField()
    hours_spent = models.DecimalField(max_digits=4, decimal_places=2)

class WeeklyReport(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    week_number = models.IntegerField()
    start_date = models.DateField()
    end_date = models.DateField()
    total_hours = models.DecimalField(max_digits=6, decimal_places=2)

class MainJob(models.Model):
    weekly_report = models.OneToOneField(WeeklyReport, on_delete=models.CASCADE)
    title = models.CharField(max_length=200)

class MainJobOperation(models.Model):
    main_job = models.ForeignKey(MainJob, on_delete=models.CASCADE)
    step_number = models.IntegerField()
    operation_description = models.TextField()
    tools_used = models.TextField()
```

## 📝 **Notes**

1. **CORS**: Ensure Django CORS is configured for frontend domain
2. **Environment**: Set up proper environment variables for JWT secrets
3. **Database**: Use PostgreSQL for production, SQLite for development
4. **Testing**: Implement comprehensive API tests
5. **Documentation**: Use Django REST Framework's automatic API documentation

## 🆘 **Current Frontend Status**

The frontend now includes:
- ✅ Mock data for development
- ✅ Graceful error handling for missing endpoints
- ✅ Consistent date calculations
- ✅ Responsive design
- ✅ Full functionality with mock data

**Next Steps:**
1. Implement backend endpoints according to this specification
2. Test each endpoint with the frontend
3. Replace mock data with real API calls
4. Implement PDF/DOCX generation 