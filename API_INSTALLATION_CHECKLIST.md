# Proctoring API Installation Checklist

## Required Django Packages

Add these to `requirements.txt` if not already present:

```
djangorestframework==3.14.0  # For REST API (if needed)
django-cors-headers==4.3.1    # For CORS support
django-environ==0.21.0        # For .env file support
psycopg2-binary==2.9.9        # PostgreSQL adapter
python-decouple==3.8          # For configuration management
```

Install them:
```bash
pip install -r requirements.txt
```

## Settings.py Updates Required

Add to `futurproctor/futurproctor/settings.py`:

```python
# At the top, add imports
import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

# ============ CORS Configuration ============
# Add 'corsheaders' to INSTALLED_APPS (if using django-cors-headers)
INSTALLED_APPS = [
    # ... existing apps ...
    'corsheaders',  # Add this
]

# Add to MIDDLEWARE (before CommonMiddleware)
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # Add this line
    'django.middleware.security.SecurityMiddleware',
    # ... rest of middleware ...
]

# Configure CORS
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",  # If using different port
    "https://yourdomain.com",  # Add your production domain
]

CORS_ALLOW_CREDENTIALS = True

# ============ Database Configuration ============
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.getenv('DB_NAME', 'jobgenie_proctoring'),
        'USER': os.getenv('DB_USER', 'postgres'),
        'PASSWORD': os.getenv('DB_PASSWORD', 'postgres'),
        'HOST': os.getenv('DB_HOST', 'localhost'),
        'PORT': os.getenv('DB_PORT', '5432'),
    }
}

# ============ Session Configuration ============
SESSION_TIMEOUT = int(os.getenv('SESSION_TIMEOUT', '3600'))
SESSION_SAVE_EVERY_REQUEST = True
SESSION_COOKIE_AGE = SESSION_TIMEOUT

# ============ Security Settings ============
SECURE_HSTS_SECONDS = 31536000 if not DEBUG else 0
SECURE_HSTS_INCLUDE_SUBDOMAINS = not DEBUG
SECURE_HSTS_PRELOAD = not DEBUG
SECURE_SSL_REDIRECT = not DEBUG
SESSION_COOKIE_SECURE = not DEBUG
CSRF_COOKIE_SECURE = not DEBUG

# ============ Static Files Configuration ============
STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR.parent, 'staticfiles')
STATICFILES_DIRS = [
    os.path.join(BASE_DIR, 'static'),
]
```

## URLs Configuration Update

The `urls.py` has already been updated. Verify it has:

```python
# proctoring/urls.py includes:
from . import api

urlpatterns = [
    # ... existing paths ...
    
    # ============ JOBGENIE PROCTORING API ENDPOINTS ============
    path('api/health/', api.api_health_check, name='api_health_check'),
    path('api/register-student/', api.api_register_student, name='api_register_student'),
    path('api/verify-face/', api.api_verify_student_face, name='api_verify_face'),
    path('api/start-exam/', api.api_start_exam, name='api_start_exam'),
    path('api/submit-exam/', api.api_submit_exam, name='api_submit_exam'),
    path('api/exam-result/<int:exam_id>/', api.api_get_exam_result, name='api_exam_result'),
    path('api/record-violation/', api.api_record_violation, name='api_record_violation'),
    path('api/record-tab-switch/', api.api_record_tab_switch, name='api_record_tab_switch'),
]
```

## API Module Creation

Verify that `api.py` exists in:
```
An-Inbrowser-Proctoring-System/futurproctor/proctoring/api.py
```

This file has been created with all required API endpoints.

## Migration Steps

### 1. Database Migration
```bash
cd An-Inbrowser-Proctoring-System/futurproctor

# Run existing migrations
python manage.py makemigrations
python manage.py migrate

# Verify migrations
python manage.py showmigrations
```

### 2. Create Superuser (Optional)
```bash
python manage.py createsuperuser
# Follow prompts for username, email, password
```

### 3. Test the API
```bash
# Start server
python manage.py runserver 0.0.0.0:8000

# In another terminal, test health endpoint
curl http://127.0.0.1:8000/api/health/

# Or use Python
python -c "
import requests
response = requests.get('http://127.0.0.1:8000/api/health/')
print(response.json())
"
```

## Verify Installation

### Checklist:
- [ ] `api.py` exists in proctoring app
- [ ] `urls.py` updated with API routes
- [ ] `settings.py` has CORS configuration
- [ ] PostgreSQL database created
- [ ] Migrations run successfully
- [ ] Health endpoint returns 200 OK
- [ ] Django server starts without errors
- [ ] Environment variables configured

### Commands to Verify:

```bash
# Check installed packages
pip list | grep -E "django|psycopg2|cors"

# Check Django version
python -m django --version

# Test API on running server
python manage.py shell
>>> from django.test import Client
>>> c = Client()
>>> r = c.get('/api/health/')
>>> print(r.status_code, r.json())

# Or from browser/curl
# http://127.0.0.1:8000/api/health/
```

## Common Installation Issues

### Issue: "No module named 'corsheaders'"
**Solution:**
```bash
pip install django-cors-headers
```

### Issue: "No module named 'api'"
**Solution:**
- Ensure `api.py` is in the `proctoring` directory
- Check file is properly created (not empty)
- Run: `python manage.py findstatic -v 0`

### Issue: "PostgreSQL connection refused"
**Solution:**
- Ensure PostgreSQL is running
- Check credentials in `.env` file
- Verify database exists: `psql -l | grep jobgenie_proctoring`

### Issue: "CORS header missing"
**Solution:**
- Verify `corsheaders` in INSTALLED_APPS
- Verify `CorsMiddleware` in MIDDLEWARE (before other middleware)
- Check CORS_ALLOWED_ORIGINS includes your frontend URL
- Restart Django server after changes

## Production Deployment Checklist

- [ ] Copy `.env` to `.env.production`
- [ ] Update `DEBUG = False`
- [ ] Change `DJANGO_SECRET_KEY`
- [ ] Update `ALLOWED_HOSTS` to production domain
- [ ] Configure SSL/TLS certificates
- [ ] Set up proper logging
- [ ] Enable security headers
- [ ] Configure database backups
- [ ] Setup monitoring
- [ ] Test all API endpoints
- [ ] Configure rate limiting
- [ ] Review CORS settings for production domain

---

**If all checks pass, the proctoring API is ready for use!** ✅
